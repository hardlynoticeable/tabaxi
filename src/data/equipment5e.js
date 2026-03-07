export const ARMOR = {
    Light: {
        'Padded': { ac: 11, stealthDisadvantage: true },
        'Leather': { ac: 11, stealthDisadvantage: false },
        'Studded Leather': { ac: 12, stealthDisadvantage: false }
    },
    Medium: {
        'Hide': { ac: 12, stealthDisadvantage: false },
        'Chain Shirt': { ac: 13, stealthDisadvantage: false },
        'Scale Mail': { ac: 14, stealthDisadvantage: true },
        'Breastplate': { ac: 14, stealthDisadvantage: false },
        'Half Plate': { ac: 15, stealthDisadvantage: true }
    },
    Heavy: {
        'Ring Mail': { ac: 14, stealthDisadvantage: true, minStr: 0 },
        'Chain Mail': { ac: 16, stealthDisadvantage: true, minStr: 13 },
        'Splint': { ac: 17, stealthDisadvantage: true, minStr: 15 },
        'Plate': { ac: 18, stealthDisadvantage: true, minStr: 15 }
    },
    Unarmored: {
        'None': { ac: 10, stealthDisadvantage: false }
    }
};

export const SHIELDS = {
    'None': { acBonus: 0 },
    'Shield': { acBonus: 2 }
};

export const WEAPONS = {
    SimpleMelee: {
        'Club': { damage: '1d4', type: 'bludgeoning', properties: ['light'] },
        'Dagger': { damage: '1d4', type: 'piercing', properties: ['finesse', 'light', 'thrown (range 20/60)'] },
        'Greatclub': { damage: '1d8', type: 'bludgeoning', properties: ['two-handed'] },
        'Handaxe': { damage: '1d6', type: 'slashing', properties: ['light', 'thrown (range 20/60)'] },
        'Javelin': { damage: '1d6', type: 'piercing', properties: ['thrown (range 30/120)'] },
        'Light Hammer': { damage: '1d4', type: 'bludgeoning', properties: ['light', 'thrown (range 20/60)'] },
        'Mace': { damage: '1d6', type: 'bludgeoning', properties: [] },
        'Quarterstaff': { damage: '1d6', type: 'bludgeoning', properties: ['versatile (1d8)'] },
        'Sickle': { damage: '1d4', type: 'slashing', properties: ['light'] },
        'Spear': { damage: '1d6', type: 'piercing', properties: ['thrown (range 20/60)', 'versatile (1d8)'] }
    },
    SimpleRanged: {
        'Crossbow, light': { damage: '1d8', type: 'piercing', properties: ['ammunition (range 80/320)', 'loading', 'two-handed'] },
        'Dart': { damage: '1d4', type: 'piercing', properties: ['finesse', 'thrown (range 20/60)'] },
        'Shortbow': { damage: '1d6', type: 'piercing', properties: ['ammunition (range 80/320)', 'two-handed'] },
        'Sling': { damage: '1d4', type: 'bludgeoning', properties: ['ammunition (range 30/120)'] }
    },
    MartialMelee: {
        'Battleaxe': { damage: '1d8', type: 'slashing', properties: ['versatile (1d10)'] },
        'Flail': { damage: '1d8', type: 'bludgeoning', properties: [] },
        'Glaive': { damage: '1d10', type: 'slashing', properties: ['heavy', 'reach', 'two-handed'] },
        'Greataxe': { damage: '1d12', type: 'slashing', properties: ['heavy', 'two-handed'] },
        'Greatsword': { damage: '2d6', type: 'slashing', properties: ['heavy', 'two-handed'] },
        'Halberd': { damage: '1d10', type: 'slashing', properties: ['heavy', 'reach', 'two-handed'] },
        'Lance': { damage: '1d12', type: 'piercing', properties: ['reach', 'special'] },
        'Longsword': { damage: '1d8', type: 'slashing', properties: ['versatile (1d10)'] },
        'Maul': { damage: '2d6', type: 'bludgeoning', properties: ['heavy', 'two-handed'] },
        'Morningstar': { damage: '1d8', type: 'piercing', properties: [] },
        'Pike': { damage: '1d10', type: 'piercing', properties: ['heavy', 'reach', 'two-handed'] },
        'Rapier': { damage: '1d8', type: 'piercing', properties: ['finesse'] },
        'Scimitar': { damage: '1d6', type: 'slashing', properties: ['finesse', 'light'] },
        'Shortsword': { damage: '1d6', type: 'piercing', properties: ['finesse', 'light'] },
        'Trident': { damage: '1d6', type: 'piercing', properties: ['thrown (range 20/60)', 'versatile (1d8)'] },
        'War Pick': { damage: '1d8', type: 'piercing', properties: [] },
        'Warhammer': { damage: '1d8', type: 'bludgeoning', properties: ['versatile (1d10)'] },
        'Whip': { damage: '1d4', type: 'slashing', properties: ['finesse', 'reach'] },
        "Cat's Claws": { damage: '1d6', type: 'slashing', properties: ['finesse'] } // Tabaxi unarmed strike
    },
    MartialRanged: {
        'Blowgun': { damage: '1', type: 'piercing', properties: ['ammunition (range 25/100)', 'loading'] },
        'Crossbow, hand': { damage: '1d6', type: 'piercing', properties: ['ammunition (range 30/120)', 'light', 'loading'] },
        'Crossbow, heavy': { damage: '1d10', type: 'piercing', properties: ['ammunition (range 100/400)', 'heavy', 'loading', 'two-handed'] },
        'Longbow': { damage: '1d8', type: 'piercing', properties: ['ammunition (range 150/600)', 'heavy', 'two-handed'] },
        'Net': { damage: '0', type: 'None', properties: ['special', 'thrown (range 5/15)'] }
    }
};

export const PACKS = [
    "Burglar's Pack",
    "Diplomat's Pack",
    "Dungeoneer's Pack",
    "Entertainer's Pack",
    "Explorer's Pack",
    "Priest's Pack",
    "Scholar's Pack"
];
