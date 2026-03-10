import { PDFDocument } from 'pdf-lib';
import { CLASSES, SKILLS, SUBCLASSES } from '../data/rules5e';
import { SPELLCASTING_PROGRESSIONS, ATTACK_CANTRIPS } from '../data/spells5e';
import { EQUIPMENT_DB } from '../data/equipment';
import { STARTING_PACKS } from '../data/startingPacks';
import { calculateStats } from './stats';

export async function generateCharacterPDF(characterData) {
    try {
        const stats = calculateStats(characterData);
        const { ac, saveBonus, profBonus, mods, nonProficientItems } = stats;

        // Fetch the blank PDF from the public/assets directory
        const url = '/assets/CharacterSheet.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        // Map basic identity fields
        const setField = (name, text, size) => {
            try {
                const field = form.getTextField(name);
                field.setText(text?.toString() || '');
                if (size) field.setFontSize(size);
            } catch (e) { }
        };

        setField('CharacterName', characterData.name || 'Wandering Tabaxi', 12);
        setField('CharacterName 2', characterData.name || 'Wandering Tabaxi', 12);
        setField('ClassLevel', `${characterData.class || ''} ${characterData.level}`, 10);
        setField('Background', characterData.background || '', 10);
        setField('Race ', 'Tabaxi', 10);
        setField('Alignment', characterData.alignment || '', 10);
        setField('ProfBonus', `+${profBonus}`, 10);
        setField('Initiative', mods.dex >= 0 ? `+${mods.dex}` : mods.dex, 10);
        setField('AC', ac.toString(), 12);
        setField('Speed', `${stats.speed}' / ${stats.climbSpeed}' (Climb)`, 10);
        setField('Size', characterData.size || 'Medium', 10);

        // Character Lore & Personality
        const setLoreField = (names, value, size = 8) => {
            names.forEach(name => {
                try {
                    const field = form.getTextField(name);
                    field.setText(value || '');
                    if (size) field.setFontSize(size);
                } catch (e) {
                    // Fallback to generic getField if getTextField fails
                    try {
                        const field = form.getField(name);
                        if (field.setText) {
                            field.setText(value || '');
                            if (field.setFontSize) field.setFontSize(size);
                        }
                    } catch (err) { }
                }
            });
        };

        setLoreField(['PersonalityTraits ', 'PersonalityTraits'], characterData.personalityTraits, 8);
        setLoreField(['Ideals'], characterData.ideals, 8);
        setLoreField(['Bonds'], characterData.bonds, 8);
        setLoreField(['Flaws'], characterData.flaws, 8);
        setLoreField(['ShortRest', 'Backstory'], characterData.backstory, 8);

        // Currency
        if (characterData.money) {
            setField('CP', characterData.money.cp?.toString() || '0', 10);
            setField('SP', characterData.money.sp?.toString() || '0', 10);
            setField('EP', characterData.money.ep?.toString() || '0', 10);
            setField('GP', characterData.money.gp?.toString() || '0', 10);
            setField('PP', characterData.money.pp?.toString() || '0', 10);
        }

        // Physical Characteristics
        setField('Age', characterData.age, 10);
        setField('Height', characterData.height, 10);
        setField('Weight', characterData.weight, 10);
        setField('Eyes', characterData.eyes, 10);
        setField('Skin', characterData.skin, 10);
        setField('Hair', characterData.hair, 10);

        // Ability Scores & Mods
        const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        abilities.forEach(ability => {
            const key = ability.toLowerCase();
            const score = (characterData.abilityScores?.[key] ? Number(characterData.abilityScores[key]) : 10) + (characterData.abilityBonuses?.[key] || 0);
            const mod = mods[key] >= 0 ? `+${mods[key]}` : mods[key];
            setField(ability, score.toString());
            const modField = ability === 'DEX' ? 'DEXmod ' : (ability === 'CHA' ? 'CHamod' : `${ability}mod`);
            setField(modField, mod);
        });

        const charClass = characterData.class ? CLASSES[characterData.class] : null;

        // HP & Hit Dice
        if (charClass) {
            const level = Number(characterData.level) || 1;
            const avgHitDie = (charClass.hitDie / 2) + 1;
            let hp = charClass.hitDie + (avgHitDie * (level - 1)) + (mods.con * level);
            if (characterData.class === 'Sorcerer' && characterData.subclass === 'Draconic Bloodline') hp += level;

            setField('HPMax', hp.toString());
            setField('HPCurrent', hp.toString());
            setField('HDTotal', `${level}d${charClass.hitDie}`);
            setField('HD', `d${charClass.hitDie}`);
        }

        // Skills & Saves
        const allKnownSkills = new Set([
            ...(characterData.tabaxiSkills || []),
            ...(characterData.selectedClassSkills || []),
            ...(characterData.backgroundSkills || [])
        ]);

        setField('Passive', (10 + mods.wis + (allKnownSkills.has('Perception') ? profBonus : 0)).toString());

        // Saves
        const saveMap = { str: 'ST Strength', dex: 'ST Dexterity', con: 'ST Constitution', int: 'ST Intelligence', wis: 'ST Wisdom', cha: 'ST Charisma' };
        const saveChecks = { str: 'Check Box 11', dex: 'Check Box 18', con: 'Check Box 19', int: 'Check Box 20', wis: 'Check Box 21', cha: 'Check Box 22' };

        Object.keys(saveMap).forEach(stat => {
            const isProf = charClass?.saves?.includes(stat);
            const totalSave = mods[stat] + (isProf ? profBonus : 0) + saveBonus;
            setField(saveMap[stat], totalSave >= 0 ? `+${totalSave}` : totalSave);
            if (isProf) { try { form.getCheckBox(saveChecks[stat]).check(); } catch (e) { } }
        });

        // Skills
        const pdfSkillNames = { Acrobatics: 'Acrobatics', 'Animal Handling': 'Animal', Arcana: 'Arcana', Athletics: 'Athletics', Deception: 'Deception ', History: 'History ', Insight: 'Insight', Intimidation: 'Intimidation', Investigation: 'Investigation ', Medicine: 'Medicine', Nature: 'Nature', Perception: 'Perception ', Performance: 'Performance', Persuasion: 'Persuasion', Religion: 'Religion', 'Sleight of Hand': 'SleightofHand', Stealth: 'Stealth ', Survival: 'Survival' };
        const pdfSkillChecks = { Acrobatics: 'Check Box 23', 'Animal Handling': 'Check Box 24', Arcana: 'Check Box 25', Athletics: 'Check Box 26', Deception: 'Check Box 27', History: 'Check Box 28', Insight: 'Check Box 29', Intimidation: 'Check Box 30', Investigation: 'Check Box 31', Medicine: 'Check Box 32', Nature: 'Check Box 33', Perception: 'Check Box 34', Performance: 'Check Box 35', Persuasion: 'Check Box 36', Religion: 'Check Box 37', 'Sleight of Hand': 'Check Box 38', Stealth: 'Check Box 39', Survival: 'Check Box 40' };

        Object.entries(SKILLS).forEach(([skillName, stat]) => {
            const isProf = allKnownSkills.has(skillName);
            const total = mods[stat] + (isProf ? profBonus : 0);
            setField(pdfSkillNames[skillName], total >= 0 ? `+${total}` : total);
            if (isProf) { try { form.getCheckBox(pdfSkillChecks[skillName]).check(); } catch (e) { } }
        });

        // Spellcasting
        if (charClass?.spellcasting) {
            const ability = charClass.spellcasting.ability;
            const abilityMod = mods[ability];
            const dc = 8 + profBonus + abilityMod;
            const atk = profBonus + abilityMod;

            setField('Spellcasting Class 2', characterData.class);
            setField('SpellcastingAbility 2', ability.toUpperCase());
            setField('SpellSaveDC  2', dc.toString());
            setField('SpellAtkBonus 2', `+${atk}`);

            const progression = SPELLCASTING_PROGRESSIONS[charClass.spellcasting.progression];
            const availableSlots = progression[(Number(characterData.level) || 1) - 1] || [];
            availableSlots.forEach((num, idx) => setField(`SlotsTotal ${19 + idx}`, num || '-'));

            const spellFieldMaps = {
                0: ['Spells 1014', 'Spells 1016', 'Spells 1017', 'Spells 1018', 'Spells 1019', 'Spells 1020', 'Spells 1021', 'Spells 1022'],
                1: ['Spells 1015', 'Spells 1023', 'Spells 1024', 'Spells 1025', 'Spells 1026', 'Spells 1027', 'Spells 1028', 'Spells 1029', 'Spells 1030', 'Spells 1031', 'Spells 1032', 'Spells 1033'],
                2: ['Spells 1046', 'Spells 1034', 'Spells 1035', 'Spells 1036', 'Spells 1037', 'Spells 1038', 'Spells 1039', 'Spells 1040', 'Spells 1041', 'Spells 1042', 'Spells 1043', 'Spells 1044', 'Spells 1045'],
                3: ['Spells 1048', 'Spells 1047', 'Spells 1049', 'Spells 1050', 'Spells 1051', 'Spells 1052', 'Spells 1053', 'Spells 1054', 'Spells 1055', 'Spells 1056', 'Spells 1057', 'Spells 1058', 'Spells 1059'],
                4: ['Spells 1061', 'Spells 1060', 'Spells 1062', 'Spells 1063', 'Spells 1064', 'Spells 1065', 'Spells 1066', 'Spells 1067', 'Spells 1068', 'Spells 1069', 'Spells 1070', 'Spells 1071', 'Spells 1072'],
                5: ['Spells 1074', 'Spells 1073', 'Spells 1075', 'Spells 1076', 'Spells 1077', 'Spells 1078', 'Spells 1079', 'Spells 1080', 'Spells 1081'],
                6: ['Spells 1083', 'Spells 1082', 'Spells 1084', 'Spells 1085', 'Spells 1086', 'Spells 1087', 'Spells 1088', 'Spells 1089', 'Spells 1090'],
                7: ['Spells 1092', 'Spells 1091', 'Spells 1093', 'Spells 1094', 'Spells 1095', 'Spells 1096', 'Spells 1097', 'Spells 1098', 'Spells 1099'],
                8: ['Spells 10101', 'Spells 10100', 'Spells 10102', 'Spells 10103', 'Spells 10104', 'Spells 10105', 'Spells 10106'],
                9: ['Spells 10108', 'Spells 10107', 'Spells 10109', 'Spells 101010', 'Spells 101011', 'Spells 101012', 'Spells 101013']
            };

            const mapSpells = (list, fields) => fields.forEach((f, i) => setField(f, list[i] || '', 7));
            mapSpells(characterData.selectedCantrips || [], spellFieldMaps[0]);
            for (let l = 1; l <= 9; l++) mapSpells(characterData.selectedSpells?.[l] || [], spellFieldMaps[l]);
        }

        // Weapons and Attacks
        const inventory = characterData.inventory || [];
        const equippedWeapons = inventory.filter(i =>
            i.isEquipped &&
            i.equipped_slot === 'Weapon' &&
            i.Damage && i.Damage.trim() !== ""
        ).slice(0, 3);
        const attackCantrips = (characterData.selectedCantrips || []).filter(c => ATTACK_CANTRIPS[c]);

        const weaponSlots = [
            { name: 'Wpn Name', atk: 'Wpn1 AtkBonus', dmg: 'Wpn1 Damage' },
            { name: 'Wpn Name 2', atk: 'Wpn2 AtkBonus ', dmg: 'Wpn2 Damage ' },
            { name: 'Wpn Name 3', atk: 'Wpn3 AtkBonus  ', dmg: 'Wpn3 Damage ' }
        ];

        let slotIdx = 0;
        equippedWeapons.forEach(wp => {
            if (slotIdx >= 3) return;
            const slot = weaponSlots[slotIdx++];
            const isProf = charClass?.weaponProficiencies?.some(p => wp.type?.includes(p)) || wp.type === 'Any' || (wp.name === "Cat's Claws");
            const isFinesse = (wp.Properties || wp.properties || '').toLowerCase().includes('finesse');
            const mod = (isFinesse && mods.dex > mods.str) ? mods.dex : mods.str;
            const atkBonus = mod + (isProf ? profBonus : 0) + (Number(wp.attack_bonus) || 0);
            const dmgBonus = mod + (Number(wp.damage_bonus) || 0);

            setField(slot.name, wp.name, 8);
            setField(slot.atk, atkBonus >= 0 ? `+${atkBonus}` : atkBonus, 10);
            setField(slot.dmg, `${wp.Damage || wp.damage || '1d6'}${dmgBonus >= 0 ? '+' : ''}${dmgBonus}`, 8);
        });

        // Fill remaining slots with cantrips
        attackCantrips.forEach(cName => {
            if (slotIdx >= 3) return;
            const slot = weaponSlots[slotIdx++];
            const cData = ATTACK_CANTRIPS[cName];
            const atkBonus = profBonus + mods[charClass?.spellcasting?.ability || 'int'];
            setField(slot.name, cName, 8);
            setField(slot.atk, `+${atkBonus}`, 10);
            setField(slot.dmg, cData.damage, 8);
        });

        // Inventory Mapping (Treasure field)
        let inventoryList = inventory.map(i => `- ${i.name}${i.isEquipped ? ' (E)' : ''}${i.isAttuned ? ' (A)' : ''}`);

        if (characterData.startingPack && STARTING_PACKS[characterData.startingPack]) {
            const packName = characterData.startingPack;
            const packContents = STARTING_PACKS[packName].map(item => item.Item).join(', ');
            inventoryList = [`[${packName}]: ${packContents}`, "", ...inventoryList];
        }

        const inventoryText = inventoryList.join('\n');
        setField('Treasure', inventoryText, 8);
        setField('Equipment', characterData.treasure || '', 8);

        // Features and Traits
        const traitList = [
            "Tabaxi Traits:",
            "- Darkvision (60 ft)",
            "- Feline Agility (Double speed for a turn; recharge on 0 ft move)",
            "- Cat's Claws (Climb 30 ft; Claws deal 1d6 + STR slashing)",
            "- Cat's Talent (Proficiency: Perception, Stealth)"
        ];

        if (nonProficientItems?.length > 0) {
            traitList.push("");
            traitList.push("WARNING ARMOR PENALTY:");
            traitList.push(`Non-proficient: ${nonProficientItems.join(', ')}`);
            traitList.push("Penalty: Disadvantage on Str/Dex rolls (saves/checks/attacks). Cannot cast spells.");
        }

        traitList.push("");

        // Base Class Features
        if (charClass?.features) {
            const level = Number(characterData.level) || 1;
            const features = Object.entries(charClass.features)
                .filter(([lvl]) => parseInt(lvl) <= level)
                .flatMap(([_, feats]) => feats);

            if (features.length > 0) {
                traitList.push(`Class Features: ${features.join(', ')}`);
            }
        }

        // Subclass Features
        if (characterData.subclass) {
            traitList.push(`Subclass: ${characterData.subclass}`);
            const subclassData = SUBCLASSES[characterData.class]?.[characterData.subclass];
            if (subclassData) {
                const level = Number(characterData.level) || 1;

                Object.entries(subclassData)
                    .filter(([key]) => key.startsWith('level') && parseInt(key.replace('level', '')) <= level)
                    .forEach(([_, desc]) => {
                        const lines = desc.split('\n');
                        lines.forEach(line => {
                            if (!line.includes('Bonus Proficiency:') && !line.includes('Spells:')) {
                                traitList.push(`- ${line}`);
                            }
                        });
                    });
            }
        }

        const traits = traitList.join('\n');
        setField('Features and Traits', traits, 8);
        setField('ProficienciesLang', `Languages: Common, ${characterData.language || 'Choice'}`, 8);

        form.updateFieldAppearances(pdfDoc.defaultUpdateAppearances);
        form.flatten();

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${characterData.name || 'Tabaxi'}.pdf`;
        link.click();

    } catch (error) {
        console.error("PDF Error:", error);
    }
}
