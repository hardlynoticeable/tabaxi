const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const { CLASSES } = require('./src/data/rules5e.js');
const { ATTACK_CANTRIPS } = require('./src/data/spells5e.js');

async function testPdf() {
    const bytes = fs.readFileSync('./public/assets/CharacterSheet.pdf');
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();

    const characterData = {
        class: "Warlock",
        level: 3,
        abilityScores: { cha: 16, str: 10, dex: 10, con: 10, int: 10, wis: 10 },
        abilityBonuses: {},
        equippedWeapons: ['Dagger'],
        selectedCantrips: ['Eldritch Blast', 'Mage Hand']
    };

    const charClass = CLASSES[characterData.class];
    const level = characterData.level;
    const profBonus = Math.ceil(level / 4) + 1;

    const getStatScore = (statKey) => {
        const b = characterData.abilityScores[statKey];
        return (b !== "" && b !== undefined) ? Number(b) + (characterData.abilityBonuses?.[statKey] || 0) : 10;
    };

    const spellcasting = charClass.spellcasting;
    let spellAttackBonus = 0;
    if (spellcasting) {
        const ability = spellcasting.ability;
        const totalAbility = getStatScore(ability);
        const abilityMod = Math.floor((totalAbility - 10) / 2);
        spellAttackBonus = profBonus + abilityMod;
    }

    const filledSlots = characterData.equippedWeapons.length;
    const activeAttackCantrips = characterData.selectedCantrips.filter(c => ATTACK_CANTRIPS[c]);

    let cantripIndex = 0;
    for (let i = filledSlots; i < 3; i++) {
        if (cantripIndex >= activeAttackCantrips.length) break;

        const cantripName = activeAttackCantrips[cantripIndex];
        const cantripData = ATTACK_CANTRIPS[cantripName];
        cantripIndex++;

        const nameField = i === 0 ? 'Wpn Name' : `Wpn Name ${i + 1}`;
        const atkField = `Wpn${i + 1} AtkBonus`;
        let dmgField = `Wpn${i + 1} Damage`;
        if (i === 1) dmgField = 'Wpn2 Damage ';

        const isAttack = cantripData.type === 'Attack';
        const atkText = isAttack
            ? (spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`)
            : cantripData.type;

        console.log(`Setting ${atkField} to ${atkText}`);

        try { form.getTextField(nameField).setText(cantripName); } catch (e) { }
        try { form.getTextField(atkField).setText(atkText); } catch (e) {
            console.log("Failed to set atk field:", e);
        }
        try { form.getTextField(dmgField).setText(cantripData.damage); } catch (e) { }
    }

    form.updateFieldAppearances();
    const outBytes = await pdfDoc.save();
    fs.writeFileSync('out.pdf', outBytes);
    console.log("Saved out.pdf");
}

testPdf();
