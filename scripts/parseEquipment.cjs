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
    if (!statImpact) return { ac_bonus: 0, attack_bonus: 0, damage_bonus: 0 };

    let ac_bonus = 0;
    let attack_bonus = 0;
    let damage_bonus = 0;

    const lowerImpact = statImpact.toLowerCase();

    // AC bonuses
    const acMatch = lowerImpact.match(/\+(\d+)\s+bonus\s+to\s+ac/i);
    if (acMatch) ac_bonus = parseInt(acMatch[1], 10);

    // Weapon attack/damage bonuses
    const atkDmgMatch = lowerImpact.match(/\+(\d+)\s+bonus\s+to\s+attack\s+and\s+damage/i);
    if (atkDmgMatch) {
        attack_bonus = parseInt(atkDmgMatch[1], 10);
        damage_bonus = parseInt(atkDmgMatch[1], 10);
    }

    // Spell attack bonuses
    const spellAtkMatch = lowerImpact.match(/\+(\d+)\s+bonus\s+to\s+spell\s+attack/i);
    if (spellAtkMatch) {
        attack_bonus = parseInt(spellAtkMatch[1], 10); // Treating as generic attack bonus for now, we'll need UI logic to distinguish
    }

    return { ac_bonus, attack_bonus, damage_bonus };
}

function inferItemType(magicItem, equipmentSets) {
    let inferredType = magicItem.type || '';
    let inferredProperties = '';
    let inferredDamage = '';

    const lowerName = (magicItem.name || '').toLowerCase();
    const lowerType = (magicItem.type || '').toLowerCase();
    const explicitBase = (magicItem.base_item || '').toLowerCase();

    // Look through base weapons to map sword, axe, bow, etc.
    for (const wep of equipmentSets.weapons) {
        const wepLower = (wep.Item || '').toLowerCase();

        // Exact match against base_item, OR fallback to name/type string matching
        let matchFound = false;
        if (explicitBase) {
            matchFound = (wepLower === explicitBase);
        } else {
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
                break;
            }
        }
    }

    return {
        inferredType: inferredType || magicItem.type,
        inferredProperties: inferredProperties || magicItem.Properties || '',
        inferredDamage: inferredDamage || magicItem.Damage || ''
    };
}

const ASSETS_DIR = path.join(__dirname, '../../assets');
const OUTPUT_FILE = path.join(__dirname, '../src/data/equipment.js');

try {
    const equipment = {
        weapons: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'weapons.csv'), 'utf8')),
        armor: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'Armorshields.csv'), 'utf8')),
        gear: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'gear.csv'), 'utf8')),
        mounts: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'mounts.csv'), 'utf8')),
        magicItems: []
    };

    // Load all magic item json files
    const files = fs.readdirSync(ASSETS_DIR);
    files.forEach(file => {
        if (file.startsWith('dnd_') && file.endsWith('.json')) {
            const content = fs.readFileSync(path.join(ASSETS_DIR, file), 'utf8');
            try {
                const items = JSON.parse(content);
                // process items to extract numeric bonuses
                const processedItems = items.map(item => {
                    const bonuses = extractNumericBonuses(item.stat_impact);
                    const { inferredType, inferredProperties, inferredDamage } = inferItemType(item, equipment);
                    return {
                        ...item,
                        type: inferredType,
                        Properties: inferredProperties,
                        Damage: inferredDamage,
                        ...bonuses
                    };
                });
                equipment.magicItems = equipment.magicItems.concat(processedItems);
            } catch (e) {
                console.error(`Error parsing JSON in ${file}:`, e);
            }
        }
    });

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
