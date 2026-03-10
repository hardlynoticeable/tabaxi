const fs = require('fs');
const path = require('path');

// Simple CSV parser
function parseCSV(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        // Handle quoted values containing commas
        let inQuotes = false;
        let currentValue = '';
        const values = [];

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

function extractNumericBonuses(statImpact) {
    if (!statImpact) return { ac_bonus: 0, attack_bonus: 0, damage_bonus: 0, save_bonus: 0 };

    let ac_bonus = 0;
    let attack_bonus = 0;
    let damage_bonus = 0;
    let save_bonus = 0;

    const lowerImpact = statImpact.toLowerCase();

    // AC bonuses - handle both "+1 bonus to AC" and "+1 AC"
    const acMatch = lowerImpact.match(/\+(\d+)\s+(?:bonus\s+to\s+)?ac/i);
    if (acMatch) ac_bonus = parseInt(acMatch[1], 10);

    // Save bonuses - handle "+1 bonus to Saving Throws" and "+1 to all Saving Throws"
    const saveMatch = lowerImpact.match(/\+(\d+)\s+(?:bonus\s+to\s+|to\s+all\s+)?saving\s+throws/i);
    if (saveMatch) save_bonus = parseInt(saveMatch[1], 10);

    // Weapon attack/damage bonuses
    const atkDmgMatch = lowerImpact.match(/\+(\d+)\s+bonus\s+to\s+attack\s+and\s+damage/i);
    if (atkDmgMatch) {
        attack_bonus = parseInt(atkDmgMatch[1], 10);
        damage_bonus = parseInt(atkDmgMatch[1], 10);
    }

    // Spell attack bonuses
    const spellAtkMatch = lowerImpact.match(/\+(\d+)\s+bonus\s+to\s+spell\s+attack/i);
    if (spellAtkMatch) {
        attack_bonus = parseInt(spellAtkMatch[1], 10);
    }

    return { ac_bonus, attack_bonus, damage_bonus, save_bonus };
}

function inferEquippedSlot(item) {
    const lowerName = (item.name || item.Item || '').toLowerCase();
    const lowerType = (item.Type || item.type || '').toLowerCase();
    const category = (item.category || '').toLowerCase();

    // 1. High-priority keyword detection
    if (category === 'rings' || lowerType.includes('ring')) return 'Ring';

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
    if (category === 'armor and shields' || lowerType.includes('armor') || lowerType.includes('shield')) {
        if (lowerName.includes('shield') || lowerType.includes('shield')) return 'Shield';
        return 'Armor';
    }

    // 3. Low-priority category fallback (Weapons)
    if (category === 'weapons' || lowerType.includes('weapon')) return 'Weapon';

    return 'Wondrous';
}

function inferItemType(magicItem, equipmentSets) {
    let inferredType = magicItem.type || '';
    let inferredProperties = '';
    let inferredDamage = '';

    const lowerName = (magicItem.name || '').toLowerCase();
    const lowerType = (magicItem.type || '').toLowerCase();
    const explicitBase = (magicItem.base_item || '').toLowerCase();

    // Mapping for generic types to common base items for stat inheritance
    const genericMappings = {
        'axe': 'battleaxe',
        'hammer': 'warhammer',
        'sword': 'longsword',
        'mace': 'mace',
        'dagger': 'dagger',
        'spear': 'spear',
        'bow': 'longbow',
        'crossbow': 'light crossbow',
        'trident': 'spear', // Fallback for trident stats if not in weapons.csv
        'javelin': 'javelin'
    };

    let targetBase = explicitBase;
    if (!targetBase && lowerType !== 'any') {
        // Try to find a keyword in type or name to find a base item for stats
        for (const [key, val] of Object.entries(genericMappings)) {
            if (lowerType.includes(key) || lowerName.includes(key)) {
                targetBase = val;
                break;
            }
        }
    }

    // Look through base weapons to map sword, axe, bow, etc.
    for (const wep of equipmentSets.weapons) {
        const wepLower = (wep.Item || '').toLowerCase();

        // Exact match against base_item/targetBase, OR fallback to name/type string matching
        let matchFound = false;
        if (targetBase) {
            matchFound = (wepLower === targetBase);
        } else {
            // Check if name or type contains the weapon name
            // e.g. "Dagger of Venom" contains "Dagger"
            matchFound = lowerName.includes(wepLower) ||
                lowerType.includes(wepLower) ||
                ((lowerName.includes('sword') || lowerType.includes('sword')) && wepLower === 'longsword');
        }

        if (matchFound) {
            inferredType = wep.Type;
            inferredProperties = wep.Properties;
            inferredDamage = wep.Damage;
            break;
        }
    }

    // Special case for generic "Weapon, +X" or items that failed to match
    if (!inferredType && (lowerName.includes('weapon') || lowerType === 'any')) {
        inferredType = 'Any';
        // Default to some generic damage if none found, to avoid empty strings
        if (!inferredDamage) inferredDamage = '1d6';
    }

    // Look through base armors
    if (!inferredProperties) { // if didn't find weapon, check armor
        for (const arm of equipmentSets.armor) {
            const armLower = (arm.Item || '').toLowerCase();

            let matchFound = false;
            if (explicitBase) {
                matchFound = (armLower === explicitBase);
            } else {
                matchFound = lowerName.includes(armLower) || lowerType.includes(armLower);
            }

            if (matchFound) {
                inferredType = arm.Type;
                inferredProperties = arm.Properties;
                // Add AC from base item if not present
                if (!magicItem.AC && arm.AC) {
                    magicItem.AC = arm.AC;
                }
                break;
            }
        }
    }

    return {
        inferredType: inferredType || magicItem.type,
        inferredProperties: inferredProperties || magicItem.Properties || '',
        inferredDamage: inferredDamage || magicItem.Damage || '',
        inferredAC: magicItem.AC || ''
    };
}

const ASSETS_DIR = path.join(__dirname, '../old_project_files/assets');
const OUTPUT_FILE = path.join(__dirname, '../src/data/equipment.js');

try {
    const equipment = {
        weapons: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'weapons.csv'), 'utf8')),
        armor: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'Armorshields.csv'), 'utf8')),
        gear: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'gear.csv'), 'utf8')),
        mounts: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'mounts.csv'), 'utf8')),
        magicItems: []
    };

    // process items to extract numeric bonuses
    equipment.magicItems = [];
    const magicFiles = fs.readdirSync(ASSETS_DIR);
    magicFiles.forEach(file => {
        if (file.startsWith('dnd_') && file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(ASSETS_DIR, file), 'utf8');
            try {
                const items = JSON.parse(content);

                let defaultCategory = '';
                if (file.includes('armor_shields')) defaultCategory = 'Armor and Shields';
                if (file.includes('weapons')) defaultCategory = 'Weapons';
                if (file.includes('potions')) defaultCategory = 'Potions';
                if (file.includes('rings')) defaultCategory = 'Rings';
                if (file.includes('rods')) defaultCategory = 'Rods';
                if (file.includes('scrolls')) defaultCategory = 'Scrolls';
                if (file.includes('staves')) defaultCategory = 'Staves';
                if (file.includes('wands')) defaultCategory = 'Wands';
                if (file.includes('wondrous_items')) defaultCategory = 'Wondrous Items';

                const processedItems = items.map(item => {
                    const bonuses = extractNumericBonuses(item.stat_impact);
                    const { inferredType, inferredProperties, inferredDamage, inferredAC } = inferItemType(item, equipment);
                    const equipped_slot = inferEquippedSlot({ ...item, category: item.category || defaultCategory, type: inferredType });

                    // Remove body_slot if it exists in the source item
                    const { body_slot, ...cleanItem } = item;

                    return {
                        category: item.category || defaultCategory,
                        ...cleanItem,
                        type: inferredType,
                        Properties: inferredProperties,
                        Damage: inferredDamage,
                        AC: inferredAC,
                        equipped_slot,
                        ...bonuses
                    };
                });
                equipment.magicItems = equipment.magicItems.concat(processedItems);
            } catch (e) {
                console.error(`Error parsing JSON in ${file}:`, e);
            }
        }
    });

    // Assign equipped_slots to base items
    equipment.armor = equipment.armor.map(item => ({
        ...item,
        equipped_slot: inferEquippedSlot({ ...item, category: 'Armor and Shields' })
    }));
    equipment.weapons = equipment.weapons.map(item => ({
        ...item,
        equipped_slot: 'Weapon'
    }));

    // De-duplicate magic items by name (keep first occurrence)
    const uniqueMagicItems = [];
    const seenNames = new Set();
    for (const item of equipment.magicItems) {
        if (!seenNames.has(item.name)) {
            uniqueMagicItems.push(item);
            seenNames.add(item.name);
        }
    }
    equipment.magicItems = uniqueMagicItems;

    const outputContent = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Run scripts/parseEquipment.cjs to update

export const EQUIPMENT_DB = ${JSON.stringify(equipment, null, 4)};\n`;

    // Ensure output dir exists
    const outDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, outputContent);
    console.log('Successfully generated equipment.js!');

} catch (error) {
    console.error('Error generating equipment:', error);
}
