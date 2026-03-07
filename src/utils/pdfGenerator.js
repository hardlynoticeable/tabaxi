import { PDFDocument } from 'pdf-lib';
import { CLASSES, SKILLS } from '../data/rules5e';
import { SPELLCASTING_PROGRESSIONS, ATTACK_CANTRIPS } from '../data/spells5e';
import { EQUIPMENT_DB } from '../data/equipment';

export async function generateCharacterPDF(characterData) {
    try {
        // Fetch the blank PDF from the public/assets directory
        const url = '/assets/CharacterSheet.pdf';
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const form = pdfDoc.getForm();

        // Map the basic identity fields
        try { form.getTextField('CharacterName').setText(characterData.name || 'Wandering Tabaxi'); } catch (e) { }
        try { form.getTextField('CharacterName 2').setText(characterData.name || 'Wandering Tabaxi'); } catch (e) { }
        try { form.getTextField('ClassLevel').setText(`${characterData.class || ''} ${characterData.level}`); } catch (e) { }
        try { form.getTextField('Background').setText(characterData.background || ''); } catch (e) { }
        try { form.getTextField('Race ').setText('Tabaxi'); } catch (e) { }
        try { form.getTextField('Alignment').setText(characterData.alignment || ''); } catch (e) { }

        // Map Ability Scores and Modifiers
        const calculateModifier = (score) => {
            const mod = Math.floor((score - 10) / 2);
            return mod >= 0 ? `+${mod}` : `${mod}`;
        };

        const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
        abilities.forEach(ability => {
            const baseScore = characterData.abilityScores[ability.toLowerCase()];
            const bonus = characterData.abilityBonuses ? (characterData.abilityBonuses[ability.toLowerCase()] || 0) : 0;
            const score = (baseScore !== "" && baseScore !== undefined) ? Number(baseScore) + bonus : 0;

            const mod = calculateModifier(score);
            try { form.getTextField(ability).setText(score.toString()); } catch (e) { }
            try {
                const modField = ability === 'DEX' ? 'DEXmod ' : (ability === 'CHA' ? 'CHamod' : `${ability}mod`);
                form.getTextField(modField).setText(mod);
            } catch (e) { }
        });

        // Speed and Size
        let speed = 30;
        try {
            const equippedArmorName = characterData.equippedArmor || 'None';
            const armorData = EQUIPMENT_DB.armor.find(a => a.Item === equippedArmorName) || EQUIPMENT_DB.magicItems.find(m => m.name === equippedArmorName);

            if (armorData && (armorData.Type === 'Heavy' || armorData.type?.includes('Heavy'))) {
                const strMatch = (armorData.Properties || armorData.properties || '').match(/Str (\d+)/);
                if (strMatch) {
                    const minStr = parseInt(strMatch[1], 10);
                    const strScore = (characterData.abilityScores?.str !== "" ? Number(characterData.abilityScores?.str) : 10) + (characterData.abilityBonuses?.str || 0);
                    if (strScore < minStr) {
                        speed -= 10;
                    }
                }
            }
        } catch (e) {
            console.error("Error calculating speed penalty:", e);
        }

        try { form.getTextField('Speed').setText(`${speed}'`); } catch (e) { }
        try { form.getTextField('Size').setText(characterData.size || 'Medium'); } catch (e) { }

        // Determine Exact Derived Stats if Class exists
        if (characterData.class) {
            const charClass = CLASSES[characterData.class];
            const level = Number(characterData.level) || 1;
            const profBonus = Math.ceil(level / 4) + 1;

            try { form.getTextField('ProfBonus').setText(`+${profBonus}`); } catch (e) { }

            // HP & Hit Dice
            const avgHitDie = (charClass.hitDie / 2) + 1;
            const conMod = Math.floor((((characterData.abilityScores.con !== "" ? Number(characterData.abilityScores.con) : 10) + (characterData.abilityBonuses?.con || 0)) - 10) / 2);
            const hp = charClass.hitDie + (avgHitDie * (level - 1)) + (conMod * level);
            try { form.getTextField('HPMax').setText(hp.toString()); } catch (e) { }
            try { form.getTextField('HPCurrent').setText(hp.toString()); } catch (e) { }
            try { form.getTextField('HDTotal').setText(`${level}d${charClass.hitDie}`); } catch (e) { }
            try { form.getTextField('HD').setText(`d${charClass.hitDie}`); } catch (e) { }

            // Initiative and AC
            const dexMod = Math.floor((((characterData.abilityScores.dex !== "" ? Number(characterData.abilityScores.dex) : 10) + (characterData.abilityBonuses?.dex || 0)) - 10) / 2);
            const wisMod = Math.floor((((characterData.abilityScores.wis !== "" ? Number(characterData.abilityScores.wis) : 10) + (characterData.abilityBonuses?.wis || 0)) - 10) / 2);

            try { form.getTextField('Initiative').setText(calculateModifier((characterData.abilityScores.dex !== "" ? Number(characterData.abilityScores.dex) : 10) + (characterData.abilityBonuses?.dex || 0))); } catch (e) { }

            // Dynamic AC Calculation based on Equipped Armor
            let ac = 10 + dexMod; // Default Unarmored
            const equippedArmorName = characterData.equippedArmor || 'None';
            let armorData = null;

            if (equippedArmorName !== 'None') {
                armorData = EQUIPMENT_DB.armor.find(a => a.Item === equippedArmorName) || EQUIPMENT_DB.magicItems.find(m => m.name === equippedArmorName);
            }

            if (armorData && equippedArmorName !== 'None') {
                const baseAcMatch = (armorData.AC || '').match(/^(\d+)/);
                const baseAc = baseAcMatch ? parseInt(baseAcMatch[1], 10) : 10;
                let magicBonus = armorData.ac_bonus || 0;
                const armorCategory = armorData.Type || armorData.type;

                if (armorCategory === 'Light' || armorCategory?.includes('Light')) {
                    ac = baseAc + dexMod + magicBonus;
                } else if (armorCategory === 'Medium' || armorCategory?.includes('Medium')) {
                    ac = baseAc + Math.min(dexMod, 2) + magicBonus;
                } else if (armorCategory === 'Heavy' || armorCategory?.includes('Heavy')) {
                    ac = baseAc + magicBonus;
                } else {
                    ac = baseAc + dexMod + magicBonus;
                }
            } else {
                // Unarmored Defense
                if (characterData.class === 'Monk') ac = 10 + dexMod + wisMod;
                else if (characterData.class === 'Barbarian') ac = 10 + dexMod + conMod;
                else if (characterData.class === 'Sorcerer' && characterData.subclass === 'Draconic Bloodline') ac = 13 + dexMod;
            }

            // Apply Shield
            if (characterData.equippedShield) {
                ac += 2; // base shield
            }

            try { form.getTextField('AC').setText(ac.toString()); } catch (e) { }

            // Skills & Saves Parsing
            const allKnownSkills = new Set([
                ...(characterData.tabaxiSkills || []),
                ...(characterData.selectedClassSkills || []),
                ...(characterData.backgroundSkills || [])
            ]);

            try { form.getTextField('Passive').setText((10 + wisMod + (allKnownSkills.has('Perception') ? profBonus : 0)).toString()); } catch (e) { }

            const getStatScore = (statKey) => {
                const b = characterData.abilityScores[statKey];
                return (b !== "" && b !== undefined) ? Number(b) + (characterData.abilityBonuses?.[statKey] || 0) : 10;
            };

            // Saves
            const saveMap = {
                str: 'ST Strength',
                dex: 'ST Dexterity',
                con: 'ST Constitution',
                int: 'ST Intelligence',
                wis: 'ST Wisdom',
                cha: 'ST Charisma'
            };
            const saveChecks = {
                str: 'Check Box 11',
                dex: 'Check Box 18',
                con: 'Check Box 19',
                int: 'Check Box 20',
                wis: 'Check Box 21',
                cha: 'Check Box 22'
            };

            ['str', 'dex', 'con', 'int', 'wis', 'cha'].forEach(stat => {
                const isProf = charClass.saves.includes(stat);
                const mod = Math.floor((getStatScore(stat) - 10) / 2);
                const total = mod + (isProf ? profBonus : 0);

                try {
                    form.getTextField(saveMap[stat]).setText(total >= 0 ? `+${total}` : `${total}`);
                    if (isProf) {
                        form.getCheckBox(saveChecks[stat]).check();
                    }
                } catch (e) { }
            });

            // Skills
            // Mapping Exact PDF Field Names 
            const pdfSkillNames = {
                Acrobatics: 'Acrobatics',
                'Animal Handling': 'Animal',
                Arcana: 'Arcana',
                Athletics: 'Athletics',
                Deception: 'Deception ',
                History: 'History ',
                Insight: 'Insight',
                Intimidation: 'Intimidation',
                Investigation: 'Investigation ',
                Medicine: 'Medicine',
                Nature: 'Nature',
                Perception: 'Perception ',
                Performance: 'Performance',
                Persuasion: 'Persuasion',
                Religion: 'Religion',
                'Sleight of Hand': 'SleightofHand',
                Stealth: 'Stealth ',
                Survival: 'Survival'
            };

            const pdfSkillChecks = {
                Acrobatics: 'Check Box 23',
                'Animal Handling': 'Check Box 24',
                Arcana: 'Check Box 25',
                Athletics: 'Check Box 26',
                Deception: 'Check Box 27',
                History: 'Check Box 28',
                Insight: 'Check Box 29',
                Intimidation: 'Check Box 30',
                Investigation: 'Check Box 31',
                Medicine: 'Check Box 32',
                Nature: 'Check Box 33',
                Perception: 'Check Box 34',
                Performance: 'Check Box 35',
                Persuasion: 'Check Box 36',
                Religion: 'Check Box 37',
                'Sleight of Hand': 'Check Box 38',
                Stealth: 'Check Box 39',
                Survival: 'Check Box 40'
            };

            Object.entries(SKILLS).forEach(([skillName, governingStat]) => {
                const isProf = allKnownSkills.has(skillName);
                const mod = Math.floor((getStatScore(governingStat) - 10) / 2);
                const total = mod + (isProf ? profBonus : 0);
                const fieldName = pdfSkillNames[skillName];
                const checkName = pdfSkillChecks[skillName];

                try {
                    form.getTextField(fieldName).setText(total >= 0 ? `+${total}` : `${total}`);
                    if (isProf) {
                        form.getCheckBox(checkName).check();
                    }
                } catch (e) { }
            });

            // Spellcasting
            const spellcasting = charClass.spellcasting;
            let spellAttackBonus = 0;
            let spellSaveDC = 0;

            if (spellcasting) {
                const ability = spellcasting.ability; // 'int', 'wis', 'cha'
                const totalAbility = getStatScore(ability);
                const abilityMod = Math.floor((totalAbility - 10) / 2);

                spellSaveDC = 8 + profBonus + abilityMod;
                spellAttackBonus = profBonus + abilityMod;

                try { form.getTextField('Spellcasting Class 2').setText(characterData.class); } catch (e) { }
                try { form.getTextField('SpellcastingAbility 2').setText(ability.toUpperCase()); } catch (e) { }
                try { form.getTextField('SpellSaveDC  2').setText(spellSaveDC.toString()); } catch (e) { }
                try { form.getTextField('SpellAtkBonus 2').setText(`+${spellAttackBonus}`); } catch (e) { }

                // Spell Slots
                const progression = SPELLCASTING_PROGRESSIONS[spellcasting.progression];
                const availableSlots = progression[level - 1] || [];

                availableSlots.forEach((numSlots, index) => {
                    const slotLevel = index + 1;
                    const fieldIndex = 18 + slotLevel; // Level 1 is 'SlotsTotal 19'
                    let textVal = numSlots.toString();
                    if (spellcasting.progression === 'warlock' && numSlots === 0) {
                        textVal = '-';
                    }
                    try { form.getTextField(`SlotsTotal ${fieldIndex}`).setText(textVal); } catch (e) { }
                });

                // Mapping Acrobat's Out-Of-Order Spell Fields visually
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

                const mapSpellsToFields = (spellList, fieldArray) => {
                    for (let i = 0; i < fieldArray.length; i++) {
                        const spellName = spellList[i] || '';
                        try {
                            const field = form.getTextField(fieldArray[i]);
                            field.setText(spellName);
                            field.setFontSize(7);
                        } catch (e) { }
                    }
                };

                // Cantrips
                mapSpellsToFields(characterData.selectedCantrips || [], spellFieldMaps[0]);

                // Compile Subclass Spells if applicable
                const subclassSpells = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
                if (characterData.subclass) {
                    // Try to parse out subclass spells. Example regex to capture spells after 'Spells: '
                    const { SUBCLASSES } = await import('../data/rules5e');
                    const subclassData = SUBCLASSES[characterData.class]?.[characterData.subclass];
                    if (subclassData) {
                        const allFeaturesText = Object.values(subclassData).join('\n');
                        const spellMatch = allFeaturesText.match(/Spells:\s*([^\n]+)/);
                        if (spellMatch) {
                            const spellsList = spellMatch[1].split(',').map(s => s.trim());
                            // Assuming they are all Level 1 spells for now based on the generic text, 
                            // a more robust system would map these to their actual levels.
                            // However, we can just put them in the Level 1 block since early artificers only have Level 1 slots.
                            if (spellsList.length > 0) {
                                subclassSpells[1].push(...spellsList);
                            }
                        }
                    }
                }

                // Level 1-9
                const selectedSpells = characterData.selectedSpells || {};
                for (let lvl = 1; lvl <= 9; lvl++) {
                    const combinedSpellsForLevel = [
                        ...(subclassSpells[lvl] || []),
                        ...(selectedSpells[lvl] || [])
                    ].filter(Boolean); // Remove empty strings

                    mapSpellsToFields(combinedSpellsForLevel, spellFieldMaps[lvl]);
                }
            }

            // Artificer Infusion Variables
            let infusionAcBonus = 0;
            let infusionWeaponBonus = 0;
            if (characterData.class === 'Artificer' && level >= 2) {
                if (characterData.infusionDefense) infusionAcBonus = level >= 10 ? 2 : 1;
                if (characterData.infusionWeapon) infusionWeaponBonus = level >= 10 ? 2 : 1;
            }

            // Adjust AC for Defense Infusion
            try {
                const acField = form.getTextField('AC');
                const baseAcStr = acField.getText();
                if (baseAcStr && infusionAcBonus > 0) {
                    const newAc = parseInt(baseAcStr) + infusionAcBonus;
                    acField.setText(newAc.toString());
                }
            } catch (e) { console.warn("Failed to update AC for infusion", e); }

            // Weapon Attacks & Attack Cantrips
            const strMod = Math.floor((getStatScore('str') - 10) / 2);
            const equippedWeapons = (characterData.equippedWeapons || []).filter(w => w !== '' && w !== 'None');

            // Gather valid attack cantrips from the ones they selected
            const activeAttackCantrips = (characterData.selectedCantrips || []).filter(c => ATTACK_CANTRIPS[c]);
            console.log("PDF Generation Cantrips:", characterData.selectedCantrips, "Active Attack Cantrips:", activeAttackCantrips);

            const findWeaponData = (weaponName) => {
                let wdata = EQUIPMENT_DB.weapons.find(w => w.Item === weaponName);
                if (wdata) return { type: wdata.Type, ...wdata };

                let mdata = EQUIPMENT_DB.magicItems.find(m => m.name === weaponName);
                if (mdata) return { type: mdata.type, ...mdata };

                if (weaponName === "Cat's Claws") return { type: "Simple Melee", Damage: "1d4 slash.", Properties: "Finesse" };

                return { type: null };
            };

            equippedWeapons.forEach((weaponName, index) => {
                if (index > 2) return; // Note: Currently matching the 3 main Wpn slots on PDF page 1.

                const weapon = findWeaponData(weaponName);
                if (!weapon.type) return;

                // Determine if proficient
                const isProficient = (charClass.weaponProficiencies || []).some(wp => weapon.type.includes(wp)) ||
                    (charClass.weaponProficiencies || []).includes(weaponName);

                // Determine attack stat
                let useDex = false;
                const properties = (weapon.Properties || weapon.properties || '').toLowerCase();
                const isFinesse = properties.includes('finesse');
                const isRanged = weapon.type.includes('Ranged');

                if (isRanged) {
                    useDex = true;
                } else if (isFinesse && dexMod > strMod) {
                    useDex = true;
                }

                const attackStatMod = useDex ? dexMod : strMod;
                const magicWeaponAttack = weapon.attack_bonus || 0;
                const magicWeaponDamage = weapon.damage_bonus || 0;

                // Add Infusion weapon bonus if this is weapon index 0 (the primary weapon)
                const wBonus = (index === 0) ? infusionWeaponBonus : 0;

                const attackBonus = attackStatMod + (isProficient ? profBonus : 0) + wBonus + magicWeaponAttack;

                // Fields for weapons 1, 2, 3
                // Wpn Name, Wpn Name 2, Wpn Name 3
                // Wpn1 AtkBonus, Wpn2 AtkBonus, Wpn3 AtkBonus
                // Wpn1 Damage, Wpn2 Damage, Wpn3 Damage

                const nameField = index === 0 ? 'Wpn Name' : `Wpn Name ${index + 1}`;

                let atkField = `Wpn${index + 1} AtkBonus`;
                if (index === 1) atkField = 'Wpn2 AtkBonus ';
                if (index === 2) atkField = 'Wpn3 AtkBonus  ';

                let dmgField = `Wpn${index + 1} Damage`;
                if (index === 1) dmgField = 'Wpn2 Damage ';
                if (index === 2) dmgField = 'Wpn3 Damage ';

                try {
                    const nameF = form.getTextField(nameField);
                    nameF.setText(weaponName);
                    nameF.setFontSize(8);
                } catch (e) { }
                try {
                    const atkF = form.getTextField(atkField);
                    atkF.setText(attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`);
                    atkF.setFontSize(10);
                } catch (e) { }

                // Combine Damage dice + type (e.g., 1d8 + 3 slashing)
                const totalDmgBonus = attackStatMod + wBonus + magicWeaponDamage;
                const finalDmgBonus = totalDmgBonus === 0 ? '' : (totalDmgBonus > 0 ? `+${totalDmgBonus}` : `${totalDmgBonus}`);
                const dmgString = `${weapon.Damage || weapon.damage || ''}${finalDmgBonus} ${weapon.type || ''}`.trim();

                try {
                    const dmgF = form.getTextField(dmgField);
                    dmgF.setText(dmgString);
                    dmgF.setFontSize(8);
                } catch (e) { }
            });

            // If there's extra room in the top 3 attack slots, fill them with attack cantrips
            const filledSlots = equippedWeapons.length;
            let cantripIndex = 0;

            for (let i = filledSlots; i < 3; i++) {
                if (cantripIndex >= activeAttackCantrips.length) break;

                const cantripName = activeAttackCantrips[cantripIndex];
                const cantripData = ATTACK_CANTRIPS[cantripName];
                cantripIndex++;

                const nameField = i === 0 ? 'Wpn Name' : `Wpn Name ${i + 1}`;

                let atkField = `Wpn${i + 1} AtkBonus`;
                if (i === 1) atkField = 'Wpn2 AtkBonus ';
                if (i === 2) atkField = 'Wpn3 AtkBonus  ';

                let dmgField = `Wpn${i + 1} Damage`;
                if (i === 1) dmgField = 'Wpn2 Damage ';
                if (i === 2) dmgField = 'Wpn3 Damage ';

                try {
                    const nameF = form.getTextField(nameField);
                    nameF.setText(cantripName);
                    nameF.setFontSize(8);
                } catch (e) { }

                const isAttack = cantripData.type === 'Attack';
                const atkText = isAttack
                    ? (spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`)
                    : cantripData.type; // e.g. "Save (DEX)"

                try {
                    const atkF = form.getTextField(atkField);
                    atkF.setText(atkText);
                    atkF.setFontSize(isAttack ? 10 : 7);
                } catch (e) { }

                try {
                    const dmgF = form.getTextField(dmgField);
                    dmgF.setText(cantripData.damage);
                    dmgF.setFontSize(8);
                } catch (e) { }
            }

            // Overflow weapons and cantrips text builder
            let overflowAttacksText = "";

            if (equippedWeapons.length > 3) {
                for (let i = 3; i < equippedWeapons.length; i++) {
                    const weaponName = equippedWeapons[i];
                    const weapon = findWeaponData(weaponName);
                    if (!weapon.type) continue;

                    const isProficient = (charClass.weaponProficiencies || []).some(wp => weapon.type.includes(wp)) ||
                        (charClass.weaponProficiencies || []).includes(weaponName);

                    let useDex = false;
                    const properties = (weapon.Properties || weapon.properties || '').toLowerCase();
                    const isFinesse = properties.includes('finesse');
                    const isRanged = weapon.type.includes('Ranged');
                    if (isRanged) useDex = true;
                    else if (isFinesse && dexMod > strMod) useDex = true;

                    const attackStatMod = useDex ? dexMod : strMod;
                    const magicWeaponAttack = weapon.attack_bonus || 0;
                    const magicWeaponDamage = weapon.damage_bonus || 0;

                    const attackBonus = attackStatMod + (isProficient ? profBonus : 0) + magicWeaponAttack;
                    const atkText = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;

                    const totalDmgBonus = attackStatMod + magicWeaponDamage;
                    const dmgBonus = totalDmgBonus === 0 ? '' : (totalDmgBonus > 0 ? `+${totalDmgBonus}` : `${totalDmgBonus}`);
                    const dmgString = `${weapon.Damage || weapon.damage || ''}${dmgBonus} ${weapon.type || ''}`.trim();

                    overflowAttacksText += `${weaponName}: ${atkText} | ${dmgString}\n`;
                }
            }

            // Remaining cantrips
            for (let i = cantripIndex; i < activeAttackCantrips.length; i++) {
                const cantripName = activeAttackCantrips[i];
                const cantripData = ATTACK_CANTRIPS[cantripName];

                const isAttack = cantripData.type === 'Attack';
                const atkText = isAttack
                    ? (spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`)
                    : cantripData.type;

                overflowAttacksText += `${cantripName}: ${atkText} | ${cantripData.damage}\n`;
            }

            if (overflowAttacksText.length > 0) {
                try {
                    const atkSpellsField = form.getTextField('AttacksSpellcasting');
                    atkSpellsField.setText(overflowAttacksText.trim());
                    atkSpellsField.setFontSize(8);
                } catch (e) { }
            }

            // Inventory & Equipment List (Now mapped to the "Treasure" field on page 2)
            try {
                const eqField = form.getTextField('Treasure');
                const inventoryArray = Array.isArray(characterData.inventory) ? characterData.inventory : [];
                const inventoryText = inventoryArray.map(item => `• ${item.name || item.Item}${item.Cost ? ` (${item.Cost})` : ''}`).join('\n');
                eqField.setText(inventoryText);
                eqField.setFontSize(8);
            } catch (e) { }

        }

        let artificerFeatures = '';
        if (characterData.class === 'Artificer') {
            const level = Number(characterData.level) || 1;
            if (level >= 1) artificerFeatures += `\n• Magical Tinkering`;
            if (level >= 3) artificerFeatures += `\n• The Right Tool for the Job`;
            if (level >= 6) artificerFeatures += `\n• Tool Expertise`;
            if (level >= 7) artificerFeatures += `\n• Flash of Genius`;

            if (characterData.subclass) {
                try {
                    const { SUBCLASSES } = await import('../data/rules5e');
                    const subclassData = SUBCLASSES[characterData.class]?.[characterData.subclass];
                    if (subclassData) {
                        artificerFeatures += `\n\n--- ${characterData.subclass} Specialist ---`;
                        if (level >= 3 && subclassData.level3) {
                            const l3Features = subclassData.level3.split('\n').filter(f => !f.includes('Spells:'));
                            l3Features.forEach(f => artificerFeatures += `\n• ${f}`);
                        }
                        if (level >= 5 && subclassData.level5) {
                            const l5Features = subclassData.level5.split('\n');
                            l5Features.forEach(f => artificerFeatures += `\n• ${f}`);
                        }
                    }
                } catch (e) {
                    console.error("Error loading subclass features for PDF:", e);
                }
            }
        }

        const traits = `Tabaxi Traits:
• Darkvision 60ft
• Feline Agility (Double speed burst)
• Cat's Claws (1d6 Slashing)
• Cat's Talent (Perception & Stealth)
${characterData.class ? `\nClass Skills: ${(characterData.selectedClassSkills || []).join(', ')}` : ''}
${characterData.background ? `\nBackground Skills (${characterData.background}): ${(characterData.backgroundSkills || []).join(', ')}` : ''}
${artificerFeatures}`;

        // Also append any tool proficiencies from the rules database
        try {
            const profLangField = form.getTextField('ProficienciesLang');
            const chosenLanguage = characterData.language ? characterData.language : '+1 choice';

            if (characterData.class && CLASSES[characterData.class]?.toolProficiencies) {
                const toolsString = CLASSES[characterData.class].toolProficiencies.join(', ');
                profLangField.setText(`Tools: ${toolsString}\nLanguages: Common, ${chosenLanguage}`);
            } else {
                profLangField.setText(`Languages: Common, ${chosenLanguage}`);
            }
            profLangField.setFontSize(8);
        } catch (e) { }
        try {
            const featuresField = form.getTextField('Features and Traits');
            featuresField.setText(traits);
            featuresField.setFontSize(8);
            featuresField.updateAppearances(pdfDoc.defaultUpdateAppearances);
        } catch (e) { }

        // This is critical for causing the setFontSize(8) mapping to actually take effect in some viewers
        form.updateFieldAppearances(pdfDoc.defaultUpdateAppearances);

        // Flatten form to prevent editing
        form.flatten();

        // Serialize and trigger download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${characterData.name || 'Tabaxi'}_Character_Sheet.pdf`;
        link.click();

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("There was an issue generating the PDF. Please check the console.");
    }
}
