const { CLASSES } = require('./src/data/rules5e.js');
const { ATTACK_CANTRIPS } = require('./src/data/spells5e.js');

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
    const ability = spellcasting.ability; // 'cha'
    const totalAbility = getStatScore(ability); // 16
    const abilityMod = Math.floor((totalAbility - 10) / 2); // 3

    spellAttackBonus = profBonus + abilityMod; // 2 + 3 = 5
}

console.log("Spell Attack Bonus Variable:", spellAttackBonus);

const filledSlots = 1;
const activeAttackCantrips = characterData.selectedCantrips.filter(c => ATTACK_CANTRIPS[c]);
console.log("Active Attack Cantrips:", activeAttackCantrips);

let cantripIndex = 0;
for (let i = filledSlots; i < 3; i++) {
    if (cantripIndex >= activeAttackCantrips.length) break;

    const cantripName = activeAttackCantrips[cantripIndex];
    const cantripData = ATTACK_CANTRIPS[cantripName];
    cantripIndex++;

    const isAttack = cantripData.type === 'Attack';
    const atkText = isAttack
        ? (spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`)
        : cantripData.type;

    console.log(`Writing Cantrip [${cantripName}] to Slot ${i + 1}`);
    console.log(`- atkText:`, atkText);
}
