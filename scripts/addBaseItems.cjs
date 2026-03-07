const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../../assets');

function parseCSV(content) {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
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

const equipmentSets = {
    weapons: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'weapons.csv'), 'utf8')),
    armor: parseCSV(fs.readFileSync(path.join(ASSETS_DIR, 'Armorshields.csv'), 'utf8'))
};

function inferBaseItem(magicItem) {
    const lowerName = (magicItem.name || '').toLowerCase();
    const lowerType = (magicItem.type || '').toLowerCase();

    // Check weapons
    for (const wep of equipmentSets.weapons) {
        const wepLower = (wep.Item || '').toLowerCase();
        if (lowerName.includes(wepLower) ||
            lowerType.includes(wepLower) ||
            ((lowerName.includes('sword') || lowerType.includes('sword')) && wepLower === 'longsword')) {
            return wep.Item;
        }
    }

    // Check armor
    for (const arm of equipmentSets.armor) {
        const armLower = (arm.Item || '').toLowerCase();
        if (lowerName.includes(armLower) || lowerType.includes(armLower)) {
            return arm.Item;
        }
    }

    return null;
}

const files = fs.readdirSync(ASSETS_DIR);
files.forEach(file => {
    if (file.startsWith('dnd_') && file.endsWith('.json')) {
        const filePath = path.join(ASSETS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        try {
            const items = JSON.parse(content);
            const updatedItems = items.map(item => {
                if (item.base_item) return item;

                const baseItemStr = inferBaseItem(item);
                if (baseItemStr) {
                    return {
                        ...item,
                        base_item: baseItemStr
                    };
                }
                return item;
            });
            fs.writeFileSync(filePath, JSON.stringify(updatedItems, null, 4));
            console.log(`Updated ${file}`);
        } catch (e) {
            console.error(`Error processing ${file}:`, e);
        }
    }
});
