const characterData = {
    class: "Warlock",
    level: 1,
    abilityScores: { cha: 16, str: 10, dex: 10, con: 10, int: 10, wis: 10 },
    abilityBonuses: {},
    equippedWeapons: ['Dagger', '', ''],
    selectedCantrips: ['Eldritch Blast', 'Mage Hand']
};

const ATTACK_CANTRIPS = {
    'Eldritch Blast': { type: 'Attack', damage: '1d10 force' }
};

const activeAttackCantrips = (characterData.selectedCantrips || []).filter(c => ATTACK_CANTRIPS[c]);
const equippedWeapons = (characterData.equippedWeapons || []).filter(w => w !== '' && w !== 'None');

const filledSlots = equippedWeapons.length;
let cantripIndex = 0;

console.log("activeAttackCantrips:", activeAttackCantrips);
console.log("equippedWeapons:", equippedWeapons);
console.log("filledSlots:", filledSlots);

for (let i = filledSlots; i < 3; i++) {
    if (cantripIndex >= activeAttackCantrips.length) break;

    const cantripName = activeAttackCantrips[cantripIndex];
    const cantripData = ATTACK_CANTRIPS[cantripName];
    cantripIndex++;

    const nameField = i === 0 ? 'Wpn Name' : `Wpn Name ${i + 1}`;
    const atkField = `Wpn${i + 1} AtkBonus`;
    let dmgField = `Wpn${i + 1} Damage`;
    if (i === 1) dmgField = 'Wpn2 Damage ';

    console.log(`Setting ${nameField} to ${cantripName}`);
}
