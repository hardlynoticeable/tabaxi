import { CLASSES, SUBCLASSES } from '../data/rules5e';

/**
 * Infers the body slot for an item based on its properties.
 * Used as a fallback for items that lack the property due to data persistence.
 */
export function inferEquippedSlot(item) {
    if (!item) return 'Wondrous';
    if (item.equipped_slot) return item.equipped_slot;

    const lowerName = (item.name || item.Item || '').toLowerCase();
    const lowerType = (item.Type || item.type || '').toLowerCase();
    const category = (item.category || '').toLowerCase();

    // 1. High-priority keyword detection
    if (category === 'rings' || lowerName.includes('ring')) return 'Ring';

    // Head: Priority detection for wearables
    if (lowerName.includes('crown') || lowerName.includes('circlet') || lowerName.includes('helmet') ||
        lowerName.includes('helm') || lowerName.includes('hat') || lowerName.includes('cap') ||
        lowerName.includes('goggles') || lowerName.includes('diadem') || lowerName.includes('spectacles') ||
        lowerName.includes('eyes')) return 'Head';

    if (lowerName.includes('cloak') || lowerName.includes('cape') || lowerName.includes('robe') || lowerName.includes('mantle')) return 'Back';
    if (lowerName.includes('amulet') || lowerName.includes('necklace') || lowerName.includes('periapt') || lowerName.includes('pendant') || lowerName.includes('talisman')) return 'Neck';
    if (lowerName.includes('boots') || lowerName.includes('slippers') || lowerName.includes('shoes')) return 'Feet';
    if (lowerName.includes('gloves') || lowerName.includes('gauntlets') || lowerName.includes('bracers')) return 'Hands';
    if (lowerName.includes('belt') || lowerName.includes('girdle')) return 'Waist';

    // 2. Structural classification (Armor/Shields)
    if (category.includes('armor') || lowerType.includes('armor') || lowerType.includes('shield')) {
        if (lowerName.includes('shield') || lowerType.includes('shield')) return 'Shield';
        return 'Armor';
    }

    // 3. Low-priority category fallback (Weapons)
    if (category.includes('weapon') || lowerType.includes('weapon') || lowerType.includes('melee') || lowerType.includes('ranged')) return 'Weapon';

    return 'Wondrous';
}

/**
 * Calculates core character stats based on ability scores, class features, and equipped/attuned inventory.
 */
export function calculateStats(characterData) {
    const level = Number(characterData.level) || 1;
    const profBonus = Math.ceil(level / 4) + 1;

    const getMod = (score) => Math.floor((score - 10) / 2);

    const getAbilityScore = (stat) => {
        const val = characterData.abilityScores?.[stat];
        const base = (val !== "" && val !== undefined) ? Number(val) : 10;
        const bonus = characterData.abilityBonuses?.[stat] || 0;
        return base + bonus;
    };

    const strMod = getMod(getAbilityScore('str'));
    const dexMod = getMod(getAbilityScore('dex'));
    const conMod = getMod(getAbilityScore('con'));
    const intMod = getMod(getAbilityScore('int'));
    const wisMod = getMod(getAbilityScore('wis'));
    const chaMod = getMod(getAbilityScore('cha'));

    const charClass = characterData.class ? CLASSES[characterData.class] : null;

    const inventory = Array.isArray(characterData.inventory) ? characterData.inventory : [];
    const equippedItems = inventory.filter(item => item.isEquipped);

    // Get all proficiencies (Class + Subclass)
    const profs = new Set([
        ...(charClass?.armorProficiencies || []),
        ...(SUBCLASSES[characterData.class]?.[characterData.subclass]?.armorProficiencies || [])
    ]);

    // Attunement & Utility check: 
    // - Items that REQUIRE attunement only give benefits if attuned
    // - Utility items (Wondrous, no attunement) give benefits if in inventory
    // - Everything else (Armor, Shields, etc) gives benefits if equipped
    const activeItems = inventory.filter(item => {
        const slot = item.equipped_slot || inferEquippedSlot(item);
        const requiresAttunement = item.attunement === true || item.attunement === 'true';

        if (requiresAttunement) return item.isAttuned;
        if (slot === 'Wondrous') return true; // Always active if in inventory
        return item.isEquipped;
    });

    let acBonus = 0;
    let saveBonus = 0;
    let armorItem = null;
    let shieldItem = null;
    const nonProficientItems = [];

    activeItems.forEach(item => {
        const slot = item.equipped_slot || inferEquippedSlot(item);
        acBonus += (Number(item.ac_bonus) || 0);
        saveBonus += (Number(item.save_bonus) || 0);

        if (slot === 'Armor') {
            armorItem = item;
            const type = (item.Type || item.type || '').split(' ')[0] || ''; // 'Heavy Armor' -> 'Heavy'
            if (type && !profs.has(type)) {
                nonProficientItems.push(item.name || item.Item);
            }
        }
        if (slot === 'Shield') {
            shieldItem = item;
            if (!profs.has('Shield')) {
                nonProficientItems.push(item.name || item.Item);
            }
        }
    });

    // Base AC calculation
    let ac = 10 + dexMod;
    let acNote = "Base Unarmored";

    if (armorItem) {
        const baseAcMatch = (armorItem.AC || '').match(/^(\d+)/);
        const baseAc = baseAcMatch ? parseInt(baseAcMatch[1], 10) : 10;
        const type = (armorItem.Type || armorItem.type || '').toLowerCase();

        if (type.includes('light')) ac = baseAc + dexMod;
        else if (type.includes('medium')) ac = baseAc + Math.min(dexMod, 2);
        else if (type.includes('heavy')) ac = baseAc;
        else ac = baseAc + dexMod; // fallback
        acNote = armorItem.name || armorItem.Item;
    } else {
        // Unarmored Defense features
        if (characterData.class === 'Monk') {
            ac = 10 + dexMod + wisMod;
            acNote = "Unarmored Defense (Monk)";
        } else if (characterData.class === 'Barbarian') {
            ac = 10 + dexMod + conMod;
            acNote = "Unarmored Defense (Barbarian)";
        } else if (characterData.class === 'Sorcerer' && characterData.subclass === 'Draconic Bloodline') {
            ac = 13 + dexMod;
            acNote = "Draconic Resilience";
        }
    }

    if (shieldItem) {
        ac += 2;
        acNote += " + Shield";
    }

    // Artificer Infusions (static check for now per existing logic)
    if (characterData.class === 'Artificer' && level >= 2) {
        if (characterData.infusionDefense) {
            const infBonus = (level >= 10 ? 2 : 1);
            ac += infBonus;
            acNote += ` + Infusion (+${infBonus})`;
        }
    }

    // Speed Calculation
    let speed = 30;
    let climbSpeed = 30;

    if (charClass && characterData.class === 'Monk' && level >= 2) {
        // Unarmored Movement: +10 at L2, +15 at L6, +20 at L10, +25 at L14, +30 at L18
        if (level >= 18) speed += 30;
        else if (level >= 14) speed += 25;
        else if (level >= 10) speed += 20;
        else if (level >= 6) speed += 15;
        else speed += 10;
        climbSpeed = speed; // Monk speed applies to all movement types
    } else if (characterData.class === 'Barbarian' && level >= 5) {
        speed += 10;
        climbSpeed += 10;
    }

    // HP Calculation
    const hitDie = charClass?.hitDie || 8;
    // HP: Max at L1, then average rounded up (hitDie/2 + 1) for subsequent levels
    const maxHp = hitDie + (Math.floor(hitDie / 2) + 1) * (level - 1) + (conMod * level);

    // Skills & Passive Perception
    const knownSkills = new Set([
        ...(characterData.tabaxiSkills || []),
        ...(characterData.selectedClassSkills || []),
        ...(characterData.backgroundSkills || [])
    ]);
    const passivePerception = 10 + wisMod + (knownSkills.has('Perception') ? profBonus : 0);
    const initiative = dexMod;

    ac += acBonus;

    return {
        ac,
        acNote,
        hasShield: !!shieldItem,
        speed,
        climbSpeed,
        maxHp,
        hitDie,
        initiative,
        passivePerception,
        knownSkills,
        saveBonus,
        profBonus,
        mods: { str: strMod, dex: dexMod, con: conMod, int: intMod, wis: wisMod, cha: chaMod },
        activeItems,
        nonProficientItems
    };
}

/**
 * Determines the maximum number of items a character can attune to.
 */
export function getAttunementLimit(characterData) {
    let limit = 3;
    if (characterData.class === 'Artificer') {
        const level = Number(characterData.level) || 1;
        if (level >= 18) limit = 6;
        else if (level >= 14) limit = 5;
        else if (level >= 10) limit = 4;
    }
    return limit;
}
