import React, { useState, useMemo } from 'react';
import { EQUIPMENT_DB } from '../data/equipment';
import { CLASSES } from '../data/rules5e';
import { ATTACK_CANTRIPS } from '../data/spells5e';

export default function Equipment({ data, updateData }) {
    // Ensure inventory is an array
    const inventory = Array.isArray(data.inventory) ? data.inventory : [];
    const { equippedArmor = 'None', equippedWeapons = ['', '', ''] } = data;
    const equippedShield = (data.equippedShield === true || data.equippedShield === false) ? 'None' : (data.equippedShield || 'None');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('weapons');

    const charClass = data.class ? CLASSES[data.class] : null;

    const strScore = (data.abilityScores?.str !== "" ? Number(data.abilityScores?.str) : 10) + (data.abilityBonuses?.str || 0);

    const checkArmorProficiency = (armorName) => {
        if (armorName === 'None') return { proficient: true, disableStr: false };
        let aData = EQUIPMENT_DB.armor.find(a => a.Item === armorName) || EQUIPMENT_DB.magicItems.find(m => m.name === armorName);
        if (!aData) return { proficient: true, disableStr: false };

        let reqStr = 0;
        const strMatch = (aData.Properties || '').match(/Str (\d+)/);
        if (strMatch) reqStr = parseInt(strMatch[1], 10);

        const cat = aData.Type || aData.type;
        const proficient = charClass ? (charClass.armorProficiencies || []).some(p => cat?.includes(p)) : true;
        const lacksStr = reqStr > 0 && strScore < reqStr;

        return { proficient, lacksStr };
    };

    const checkWeaponProficiency = (weaponName) => {
        if (!weaponName || weaponName === "Cat's Claws") return true;
        let wData = EQUIPMENT_DB.weapons.find(w => w.Item === weaponName) || EQUIPMENT_DB.magicItems.find(m => m.name === weaponName);
        if (!wData) return true;

        const cat = wData.Type || wData.type;
        return charClass ? (charClass.weaponProficiencies || []).some(p => cat?.includes(p)) ||
            (charClass.weaponProficiencies || []).includes(weaponName) : true;
    };

    // Make options available for dropdowns based on inventory
    const inventoryNames = Array.from(new Set(inventory.map(i => i.name)));

    const armorOptionsRaw = ['None', ...inventoryNames.filter(name => {
        return EQUIPMENT_DB.armor.some(a => a.Item === name && a.Type !== 'Shield') ||
            EQUIPMENT_DB.magicItems.some(m => m.name === name && m.category === 'Armor and Shields' && m.base_item !== 'Shield' && !(m.type || '').includes('shield') && !(m.name || '').toLowerCase().includes('shield'));
    })];

    const shieldOptionsRaw = ['None', ...inventoryNames.filter(name => {
        return EQUIPMENT_DB.armor.some(a => a.Item === name && a.Type === 'Shield') ||
            EQUIPMENT_DB.magicItems.some(m => m.name === name && m.category === 'Armor and Shields' && (m.base_item === 'Shield' || (m.type || '').includes('shield') || (m.name || '').toLowerCase().includes('shield')));
    })];

    const weaponOptionsRaw = ['', "Cat's Claws", ...inventoryNames.filter(name => {
        return EQUIPMENT_DB.weapons.some(w => w.Item === name) ||
            EQUIPMENT_DB.magicItems.some(m => m.name === name && (m.category === 'Weapons' || m.Damage));
    })];

    const handleWeaponChange = (index, value) => {
        const newWeapons = [...equippedWeapons];
        newWeapons[index] = value;
        updateData({ equippedWeapons: newWeapons });
    };

    const addToInventory = (item) => {
        const newItem = {
            id: Date.now() + Math.random(),
            name: item.Item || item.name,
            equipped: false,
            ...item
        };
        updateData({ inventory: [...inventory, newItem] });
    };

    const removeFromInventory = (id) => {
        updateData({ inventory: inventory.filter(item => item.id !== id) });
    };

    let isArmorProficient = true;
    let armorCategory = '';
    let armorStrengthReq = 0;
    let armorData = null;

    if (equippedArmor !== 'None') {
        armorData = EQUIPMENT_DB.armor.find(a => a.Item === equippedArmor) ||
            EQUIPMENT_DB.magicItems.find(m => m.name === equippedArmor);
        if (armorData) {
            armorCategory = armorData.Type || armorData.type;
            const strMatch = (armorData.Properties || '').match(/Str (\d+)/);
            if (strMatch) armorStrengthReq = parseInt(strMatch[1], 10);
        }

        if (charClass && armorCategory) {
            // Very loose proficiency check for now
            isArmorProficient = (charClass.armorProficiencies || []).some(p => armorCategory.includes(p));
        }
    }

    let isShieldProficient = true;
    let shieldData = null;
    if (equippedShield !== 'None') {
        shieldData = EQUIPMENT_DB.armor.find(a => a.Item === equippedShield) ||
            EQUIPMENT_DB.magicItems.find(m => m.name === equippedShield);
        if (charClass) {
            isShieldProficient = (charClass.armorProficiencies || []).includes('Shield');
        }
    }

    const getStatMod = (statKey) => {
        const b = data.abilityScores?.[statKey];
        const score = (b !== "" && b !== undefined) ? Number(b) + (data.abilityBonuses?.[statKey] || 0) : 10;
        return Math.floor((score - 10) / 2);
    };

    const lacksStrength = (armorCategory === 'Heavy') && (strScore < armorStrengthReq);

    const strMod = getStatMod('str');
    const dexMod = getStatMod('dex');
    const conMod = getStatMod('con');
    const wisMod = getStatMod('wis');
    const chaMod = getStatMod('cha');
    const intMod = getStatMod('int');
    const level = Number(data.level) || 1;
    const profBonus = Math.ceil(level / 4) + 1;

    let spellAttackBonus = 0;
    if (charClass && charClass.spellcasting) {
        const ability = charClass.spellcasting.ability; // 'int', 'wis', 'cha'
        if (ability === 'int') spellAttackBonus = profBonus + intMod;
        if (ability === 'wis') spellAttackBonus = profBonus + wisMod;
        if (ability === 'cha') spellAttackBonus = profBonus + chaMod;
    }
    const attackCantrips = (data.selectedCantrips || []).filter(c => ATTACK_CANTRIPS[c]);

    let ac = 10 + dexMod;

    let infusionAcBonus = 0;
    let infusionWeaponBonus = 0;
    if (data.class === 'Artificer' && data.level >= 2) {
        if (data.infusionDefense) infusionAcBonus = data.level >= 10 ? 2 : 1;
        if (data.infusionWeapon) infusionWeaponBonus = data.level >= 10 ? 2 : 1;
    }

    if (armorData && equippedArmor !== 'None') {
        const baseAcMatch = (armorData.AC || '').match(/^(\d+)/);
        const baseAc = baseAcMatch ? parseInt(baseAcMatch[1], 10) : 10;

        let magicBonus = armorData.ac_bonus || 0;

        if (armorCategory === 'Light') ac = baseAc + dexMod + magicBonus;
        else if (armorCategory === 'Medium' || armorCategory?.includes('Medium')) ac = baseAc + Math.min(dexMod, 2) + magicBonus;
        else if (armorCategory === 'Heavy' || armorCategory?.includes('Heavy')) ac = baseAc + magicBonus;
        else ac = baseAc + dexMod + magicBonus; // fallback
    } else {
        if (data.class === 'Monk') ac = 10 + dexMod + wisMod;
        else if (data.class === 'Barbarian') ac = 10 + dexMod + conMod;
        else if (data.class === 'Sorcerer' && data.subclass === 'Draconic Bloodline') ac = 13 + dexMod;
    }

    if (shieldData && equippedShield !== 'None') {
        let shieldBonus = 2; // base shield
        let magicBonus = shieldData.ac_bonus || 0;
        ac += shieldBonus + magicBonus;
    }

    ac += infusionAcBonus;

    const findWeaponData = (weaponName) => {
        let wdata = EQUIPMENT_DB.weapons.find(w => w.Item === weaponName);
        if (wdata) return { type: wdata.Type, ...wdata };

        let mdata = EQUIPMENT_DB.magicItems.find(m => m.name === weaponName);
        if (mdata) return { type: mdata.type, ...mdata };

        if (weaponName === "Cat's Claws") return { type: "Simple Melee", Damage: "1d4 slash.", Properties: "Finesse" };

        return { type: null };
    };

    const getWeaponStats = (weaponName, idx) => {
        if (!weaponName || weaponName === 'None') return null;
        const weapon = findWeaponData(weaponName);
        if (!weapon.type) return null;

        const isProficient = (charClass?.weaponProficiencies || []).some(wp => weapon.type.includes(wp)) ||
            (charClass?.weaponProficiencies || []).includes(weaponName);

        let useDex = false;
        const properties = (weapon.Properties || weapon.properties || '').toLowerCase();
        const isFinesse = properties.includes('finesse');
        const isRanged = weapon.type.includes('Ranged');

        if (isRanged) useDex = true;
        else if (isFinesse && dexMod > strMod) useDex = true;

        const attackStatMod = useDex ? dexMod : strMod;
        const magicWeaponAttack = weapon.attack_bonus || 0;
        const magicWeaponDamage = weapon.damage_bonus || 0;

        const wBonus = (idx === 0) ? infusionWeaponBonus : 0;

        const attackBonus = attackStatMod + (isProficient ? profBonus : 0) + wBonus + magicWeaponAttack;
        const totalDmgBonus = attackStatMod + wBonus + magicWeaponDamage;
        const dmgBonusString = totalDmgBonus === 0 ? '' : (totalDmgBonus > 0 ? `+${totalDmgBonus}` : `${totalDmgBonus}`);
        const dmgString = `${weapon.Damage || ''}${dmgBonusString} ${weapon.type || ''}`.trim();

        return { attackBonus, dmgString, properties: weapon.Properties || weapon.properties };
    };

    // Filter database items based on search
    const filteredDbItems = useMemo(() => {
        const categoryData = EQUIPMENT_DB[selectedCategory] || [];
        if (!searchTerm) return categoryData.slice(0, 50); // limit to 50 for performance
        return categoryData.filter(item =>
            (item.Item || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 50);
    }, [selectedCategory, searchTerm]);


    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)] h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
            <h2 className="text-3xl mb-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Gear & Equipment
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Left Column (Inventory Manager) - Moved to be first/top */}
                <div className="xl:col-span-7 bg-[var(--color-dark-card)] p-5 rounded-lg border border-gray-700 flex flex-col h-[750px]">
                    <h3 className="text-xl font-bold text-emerald-400 border-b border-gray-700 pb-2 mb-4 line-clamp-1">
                        Backpack & Inventory ({inventory.length} items)
                    </h3>

                    {/* Add Item Panel */}
                    <div className="mb-4 bg-gray-900 p-3 rounded border border-gray-700">
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
                            {['weapons', 'armor', 'gear', 'mounts', 'magicItems'].map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 rounded text-xs font-bold capitalize whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    {cat.replace('Items', ' Items')}
                                </button>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Search to add items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 mb-2"
                        />

                        <div className="h-32 overflow-y-auto custom-scrollbar bg-black/40 rounded border border-gray-800">
                            {filteredDbItems.length === 0 && <div className="p-3 text-gray-500 text-sm italic">No items found.</div>}
                            {filteredDbItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-2 border-b border-gray-800 hover:bg-gray-800/80 group">
                                    <div>
                                        <div className="text-emerald-300 text-sm font-bold">{item.Item || item.name}</div>
                                        <div className="text-[10px] text-gray-500">{item.Cost || item.rarity} • {item.Damage || item.AC || item.stat_impact || item.Weight || ''}</div>
                                    </div>
                                    <button
                                        onClick={() => addToInventory(item)}
                                        className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Current Inventory List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-700 rounded bg-gray-900/50 p-2 space-y-2">
                        {inventory.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">
                                Your inventory is empty.
                            </div>
                        ) : (
                            inventory.map(item => (
                                <div key={item.id} className="bg-gray-800 p-3 rounded flex justify-between items-center border border-gray-700 hover:border-gray-500 transition-colors">
                                    <div>
                                        <div className="text-white font-bold">{item.name || item.Item}</div>
                                        {item.Cost && <div className="text-xs text-amber-400">{item.Cost}</div>}
                                    </div>
                                    <button
                                        onClick={() => removeFromInventory(item.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                        title="Remove from Inventory"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column (Equipped Gear) - Moved to be second/bottom */}
                <div className="xl:col-span-5 space-y-6">
                    {/* Armor Selection */}
                    <div className="bg-[var(--color-dark-card)] p-5 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Equipped Armor & Shield</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-emerald-500 uppercase tracking-wide mb-1">Armor</label>
                                <select
                                    value={equippedArmor}
                                    onChange={(e) => updateData({ equippedArmor: e.target.value })}
                                    className={`w-full bg-gray-900 border ${!isArmorProficient || lacksStrength ? 'border-red-500' : 'border-gray-600 focus:border-emerald-500'} rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                                >
                                    {armorOptionsRaw.map(a => {
                                        const { proficient, lacksStr } = checkArmorProficiency(a);
                                        const disabled = !proficient || lacksStr;
                                        let label = a;
                                        if (!proficient) label += ' (Not Proficient)';
                                        else if (lacksStr) label += ' (Lacks Strength)';
                                        return <option key={a} value={a} disabled={disabled}>{label}</option>;
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-emerald-500 uppercase tracking-wide mb-1">Shield</label>
                                <select
                                    value={equippedShield}
                                    onChange={(e) => updateData({ equippedShield: e.target.value })}
                                    className={`w-full bg-gray-900 border ${!isShieldProficient ? 'border-red-500' : 'border-gray-600 focus:border-emerald-500'} rounded p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                                >
                                    {shieldOptionsRaw.map(s => {
                                        let disabled = false;
                                        let label = s;
                                        if (s !== 'None' && !isShieldProficient) {
                                            disabled = true;
                                            label += ' (Not Proficient)';
                                        }
                                        return <option key={s} value={s} disabled={disabled}>{label}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Weapons Selection */}
                    <div className="bg-[var(--color-dark-card)] p-5 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-bold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Equipped Weapons</h3>
                        <p className="text-xs text-gray-400 mb-4">Select up to 3 weapons to appear in the Attacks block on your PDF.</p>

                        <div className="space-y-3">
                            {[0, 1, 2].map((index) => (
                                <div key={index}>
                                    <select
                                        value={equippedWeapons[index] || ''}
                                        onChange={(e) => handleWeaponChange(index, e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    >
                                        {weaponOptionsRaw.map(w => {
                                            const proficient = checkWeaponProficiency(w);
                                            const alreadyEquipped = w !== '' && w !== 'None' && equippedWeapons.includes(w) && equippedWeapons[index] !== w;

                                            let label = w === '' ? '-- None --' : w;
                                            if (!proficient) label += ' (Not Proficient)';
                                            else if (alreadyEquipped) label += ' (Already Equipped)';

                                            return <option key={w} value={w} disabled={!proficient || alreadyEquipped}>
                                                {label}
                                            </option>;
                                        })}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Artificer Infusions */}
                    {data.class === 'Artificer' && data.level >= 2 && (
                        <div className="bg-[var(--color-dark-card)] p-5 rounded-lg border border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <h3 className="text-lg font-bold text-emerald-400 border-b border-gray-700 pb-2 mb-4 flex items-center justify-between">
                                <span>Active Infusions</span>
                            </h3>

                            <div className="space-y-3">
                                <label className={`flex items-center space-x-3 text-sm p-3 rounded border transition-colors cursor-pointer ${data.infusionDefense ? 'bg-emerald-900/40 border-emerald-500' : 'border-gray-700 bg-gray-800 hover:border-emerald-500/50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={data.infusionDefense || false}
                                        onChange={(e) => updateData({ infusionDefense: e.target.checked })}
                                        className="w-5 h-5 text-emerald-500 border-gray-600 rounded bg-gray-900 focus:ring-emerald-500 shrink-0"
                                    />
                                    <div>
                                        <span className="font-bold text-white tracking-wide block">Enhanced Defense</span>
                                        <span className="text-xs text-gray-400">Grants +1 AC to armor/shield (+2 at lv10)</span>
                                    </div>
                                </label>

                                <label className={`flex items-center space-x-3 text-sm p-3 rounded border transition-colors cursor-pointer ${data.infusionWeapon ? 'bg-emerald-900/40 border-emerald-500' : 'border-gray-700 bg-gray-800 hover:border-emerald-500/50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={data.infusionWeapon || false}
                                        onChange={(e) => updateData({ infusionWeapon: e.target.checked })}
                                        className="w-5 h-5 text-emerald-500 border-gray-600 rounded bg-gray-900 focus:ring-emerald-500 shrink-0"
                                    />
                                    <div>
                                        <span className="font-bold text-white tracking-wide block">Enhanced Weapon</span>
                                        <span className="text-xs text-gray-400">Grants +1 Attack/Damage to Weapon 1 (+2 at lv10)</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Combat Summary Panel */}
            <div className="mt-8 bg-[var(--color-dark-card)] p-6 rounded-lg border border-brand-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] overflow-hidden relative">
                <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none scale-150 text-brand-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m10 10.5 2-2 2 2" /><path d="M12 8v10" /></svg>
                </div>

                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 mb-4 border-b border-gray-700 pb-2">Combat Summary</h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* AC Box */}
                    <div className="bg-gray-900 p-4 rounded-lg flex flex-col items-center justify-center border border-gray-700">
                        <span className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Armor Class</span>
                        <div className="relative flex items-center justify-center">
                            <span className="text-4xl font-black text-white z-10">{ac}</span>
                        </div>
                    </div>

                    {/* Weapons List */}
                    <div className="md:col-span-3 space-y-3">
                        <div className="grid grid-cols-4 gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-700/50 pb-2 px-2">
                            <div className="col-span-2">Weapon</div>
                            <div className="text-center">Bonus</div>
                            <div>Damage</div>
                        </div>
                        {equippedWeapons.filter(w => w !== '' && w !== 'None').length === 0 ? (
                            <div className="text-sm text-gray-500 italic p-2">No weapons equipped.</div>
                        ) : (
                            equippedWeapons.filter(w => w !== '' && w !== 'None').map((weaponName, idx) => {
                                const stats = getWeaponStats(weaponName, idx);
                                if (!stats) return null;

                                return (
                                    <div key={idx} className="grid grid-cols-4 gap-4 items-center bg-gray-800/50 p-3 rounded border border-gray-700/50">
                                        <div className="col-span-2 flex flex-col">
                                            <span className="font-bold text-emerald-300">{weaponName}</span>
                                            {stats.properties && stats.properties.length > 0 && (
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{stats.properties}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <span className="inline-block px-3 py-1 bg-gray-900 rounded-full font-bold text-white border border-gray-600">
                                                {stats.attackBonus >= 0 ? `+${stats.attackBonus}` : stats.attackBonus}
                                            </span>
                                        </div>
                                        <div className="font-mono text-sm text-gray-300">
                                            {stats.dmgString}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
