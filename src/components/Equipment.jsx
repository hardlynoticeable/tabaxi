import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { EQUIPMENT_DB } from '../data/equipment';
import { STARTING_PACKS } from '../data/startingPacks';
import { CLASSES, SUBCLASSES } from '../data/rules5e';
import { calculateStats, getAttunementLimit, inferEquippedSlot } from '../utils/stats';
import { Shield, Sword, Eye, Footprints, Hand, User, Star, Trash2, Info, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Equipment({ data, updateData }) {
    const inventory = Array.isArray(data.inventory) ? data.inventory : [];
    const stats = calculateStats(data);
    const attunementLimit = getAttunementLimit(data);
    const attunedCount = inventory.filter(i => i.isAttuned).length;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('weapons');
    const [showDatabaseModal, setShowDatabaseModal] = useState(false);
    const [addedItemId, setAddedItemId] = useState(null);

    const charClass = data.class ? CLASSES[data.class] : null;

    const equipmentSlots = [
        { id: 'Armor', label: 'Armor', icon: User },
        { id: 'Shield', label: 'Shield', icon: Shield },
        { id: 'Head', label: 'Head', icon: Eye },
        { id: 'Neck', label: 'Neck', icon: Star },
        { id: 'Back', label: 'Back', icon: User },
        { id: 'Waist', label: 'Waist', icon: User },
        { id: 'Hands', label: 'Hands', icon: Hand },
        { id: 'Feet', label: 'Feet', icon: Footprints },
        { id: 'Ring', label: 'Rings', icon: Star },
        { id: 'Weapon', label: 'Active Weapons (Max 3)', icon: Sword }
    ];

    const toggleEquip = (itemId) => {
        const item = inventory.find(i => i.id === itemId);
        if (!item) return;

        const isEquipping = !item.isEquipped;
        let newInventory = [...inventory];

        if (isEquipping) {
            // 1. Slot enforcement logic
            const slot = item.equipped_slot || inferEquippedSlot(item);
            if (slot === 'Weapon') {
                const equippedWeapons = inventory.filter(i => i.isEquipped && (i.equipped_slot === 'Weapon' || inferEquippedSlot(i) === 'Weapon'));
                if (equippedWeapons.length >= 3) {
                    const weaponToUnequip = equippedWeapons[0];
                    newInventory = newInventory.map(i => i.id === weaponToUnequip.id ? { ...i, isEquipped: false, isAttuned: false } : i);
                }
            } else if (slot && slot !== 'Wondrous' && slot !== 'Any' && slot !== 'Ring') {
                // Standard single slots (Head, Neck, Back, Armor, etc)
                // Rings are excluded from the single-slot replacement rule here, 
                // as they are limited primarily by attunement.
                newInventory = newInventory.map(i => (i.isEquipped && (i.equipped_slot === slot || inferEquippedSlot(i) === slot)) ? { ...i, isEquipped: false, isAttuned: false } : i);
            }

            // 2. Auto-attunement logic
            const requiresAttunement = item.attunement === true || item.attunement === 'true';
            let willAttune = false;
            if (requiresAttunement) {
                // Count how many items WILL be attuned after this operation
                // Start with current count, subtract any items we just unequipped that were attuned
                const currentAttuned = newInventory.filter(i => i.isAttuned).length;
                if (currentAttuned < attunementLimit) {
                    willAttune = true;
                }
            }

            newInventory = newInventory.map(i => i.id === itemId ? { ...i, isEquipped: true, isAttuned: willAttune } : i);
        } else {
            // Unequipping: always unattune too
            newInventory = newInventory.map(i => i.id === itemId ? { ...i, isEquipped: false, isAttuned: false } : i);
        }

        updateData({ inventory: newInventory });
    };

    const addToInventory = (item) => {
        const newItem = {
            ...item,
            id: Date.now() + Math.random(),
            isEquipped: false,
            isAttuned: false,
            name: item.name || item.Item || 'Unnamed Item'
        };
        updateData({ inventory: [...inventory, newItem] });
    };

    const removeFromInventory = (itemId) => {
        updateData({ inventory: inventory.filter(i => i.id !== itemId) });
    };

    const filteredDbItems = useMemo(() => {
        const categoryData = EQUIPMENT_DB[selectedCategory] || [];
        const filtered = !searchTerm ? categoryData : categoryData.filter(item =>
            (item.Item || item.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        return [...filtered].sort((a, b) => (a.Item || a.name || '').localeCompare(b.Item || b.name || '')).slice(0, 50);
    }, [selectedCategory, searchTerm]);

    const getEquippedInSlot = (slotId) => {
        return inventory.filter(i => i.isEquipped && (i.equipped_slot === slotId || inferEquippedSlot(i) === slotId));
    };

    const armorProfs = Array.from(new Set([...(charClass?.armorProficiencies || []), ...(SUBCLASSES[data.class]?.[data.subclass]?.armorProficiencies || [])])).sort();
    const weaponProfs = Array.from(new Set([...(charClass?.weaponProficiencies || []), ...(SUBCLASSES[data.class]?.[data.subclass]?.weaponProficiencies || [])])).sort();

    const checkProficiency = (item) => {
        const type = (item.Type || item.type || '').toLowerCase();
        const name = (item.Item || item.name || '').toLowerCase();
        const slot = item.equipped_slot || inferEquippedSlot(item);

        if (slot === 'Weapon' || type.includes('simple') || type.includes('martial')) {
            return weaponProfs.some(p => {
                const prof = p.toLowerCase();
                return type.includes(prof) || name.includes(prof);
            }) || name === "cat's claws";
        }

        if (slot === 'Armor' || slot === 'Shield' || type.includes('armor') || type.includes('shield')) {
            return armorProfs.some(p => {
                const prof = p.toLowerCase();
                return type.includes(prof);
            });
        }

        return null;
    };

    return (
        <div className="space-y-6 animate-fade-in text-brand-100 h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800 pb-4 gap-4">
                <div>
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 uppercase tracking-tighter">
                        Inventory
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your gear, attunement, and equipped items.</p>
                </div>
                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="bg-gray-900 border border-emerald-500/30 rounded-lg px-4 py-2 flex items-center gap-4 w-full md:w-auto justify-around md:justify-start">
                        <div className="text-center">
                            <p className="text-[10px] text-emerald-500 uppercase font-black">Armor Class</p>
                            <p className="text-2xl font-black text-white">
                                {stats.hasShield ? `${stats.ac - 2}/${stats.ac}` : stats.ac}
                            </p>
                            {stats.hasShield && <p className="text-[9px] text-gray-500 uppercase leading-none mt-0.5">(No Shield / With Shield)</p>}
                        </div>
                        <div className="w-px h-8 bg-gray-800"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-teal-500 uppercase font-black">Attunement</p>
                            <p className={`text-2xl font-black ${attunedCount >= attunementLimit ? 'text-amber-400' : 'text-white'}`}>
                                {attunedCount}<span className="text-gray-600 text-sm">/{attunementLimit}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Full Width: Backpack, Equipped Arsenal, Currency, Treasure */}
                <main className="xl:col-span-12 space-y-6">
                    {/* Starting Equipment Packs */}
                    <div className="glass-card p-5 border-emerald-500/20">
                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-4">Starting Equipment Pack</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => updateData({ startingPack: null })}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${!data.startingPack ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-emerald-500/30'}`}
                            >
                                None
                            </button>
                            {Object.keys(STARTING_PACKS).map(packName => (
                                <button
                                    key={packName}
                                    onClick={() => updateData({ startingPack: packName })}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${data.startingPack === packName ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-emerald-500/30'}`}
                                >
                                    {packName}
                                </button>
                            ))}
                        </div>

                        {data.startingPack && (
                            <div className="bg-black/40 rounded-xl p-4 border border-gray-800">
                                <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                    <Info size={14} /> Contents of {data.startingPack}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                                    {STARTING_PACKS[data.startingPack].map((item, idx) => (
                                        <div key={idx} className="text-[11px] text-gray-400 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500/30"></div>
                                            {item.Item}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-3 italic">
                                    Note: Pack items are tracked separately and will appear in the Equipment section of your PDF.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">
                            Backpack <span className="text-gray-500 text-sm">({inventory.length} items)</span>
                        </h3>
                        <button
                            onClick={() => setShowDatabaseModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all"
                        >
                            Add Items
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {inventory.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-600 italic">
                                Your backpack is empty. Head to the Database to add gear.
                            </div>
                        ) : (
                            [...inventory].sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                                <div key={item.id} className={`glass-card p-4 transition-all border-l-4 ${item.isEquipped ? 'border-emerald-500 bg-emerald-900/5' : 'border-gray-700 bg-gray-900/40 opacity-70 hover:opacity-100'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-bold text-lg text-white leading-tight">{item.name}</h4>
                                            <div className="flex flex-col">
                                                {(() => {
                                                    const slot = item.equipped_slot || inferEquippedSlot(item);
                                                    let detailText = item.rarity || (item.Cost ? item.Cost : 'Standard');

                                                    if (slot === 'Weapon' && (item.Damage || item.damage)) {
                                                        const isProf = weaponProfs.some(p => item.type?.includes(p)) || item.type === 'Any' || item.name === "Cat's Claws";
                                                        const isFinesse = (item.Properties || item.properties || '').toLowerCase().includes('finesse');
                                                        const mod = (isFinesse && stats.mods.dex > stats.mods.str) ? stats.mods.dex : stats.mods.str;
                                                        const atk = mod + (isProf ? stats.profBonus : 0) + (Number(item.attack_bonus) || 0);
                                                        const dmg = mod + (Number(item.damage_bonus) || 0);
                                                        detailText = `${atk >= 0 ? '+' : ''}${atk} to hit | ${item.Damage || item.damage}${dmg >= 0 ? '+' : ''}${dmg} dmg`;
                                                    } else if (slot === 'Armor') {
                                                        const baseAcMatch = (item.AC || '').match(/^(\d+)/);
                                                        const baseAc = baseAcMatch ? parseInt(baseAcMatch[1], 10) : 10;
                                                        const type = (item.Type || item.type || '').toLowerCase();
                                                        let previewAc = baseAc;
                                                        if (type.includes('light')) previewAc += stats.mods.dex;
                                                        else if (type.includes('medium')) previewAc += Math.min(stats.mods.dex, 2);
                                                        const shieldEquipped = inventory.some(i => i.isEquipped && (i.equipped_slot === 'Shield' || inferEquippedSlot(i) === 'Shield'));
                                                        detailText = `${previewAc}${shieldEquipped ? ` / ${previewAc + 2}` : ''} AC`;
                                                    } else if (slot === 'Shield') {
                                                        const currentAc = stats.hasShield ? stats.ac - 2 : stats.ac;
                                                        detailText = `${currentAc} / ${currentAc + 2} AC`;
                                                    }

                                                    return (
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-[10px] uppercase font-black flex items-center gap-2 text-gray-500">
                                                                {slot} • {detailText}
                                                            </p>
                                                            {(() => {
                                                                const isProf = checkProficiency(item);
                                                                if (isProf === true) return <span className="text-[9px] font-black text-emerald-500/60 uppercase">Proficient</span>;
                                                                if (isProf === false) return <span className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1"><AlertCircle size={8} /> Non-Proficient</span>;
                                                                return null;
                                                            })()}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromInventory(item.id)}
                                            className="text-gray-600 hover:text-red-400 p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {item.isEquipped && stats.nonProficientItems?.includes(item.name || item.Item) && (
                                        <div className="bg-red-900/20 text-red-400 px-3 py-2 rounded border border-red-500/20 mb-3">
                                            <div className="flex items-center gap-2 mb-1 animate-pulse">
                                                <AlertCircle size={14} />
                                                <p className="text-[10px] font-bold uppercase tracking-wider">Lacks Proficiency</p>
                                            </div>
                                            <p className="text-[10px] leading-tight opacity-80 italic">
                                                Penalty: Disadvantage on Str/Dex checks, saves, and attack rolls. Cannot cast spells.
                                            </p>
                                        </div>
                                    )}

                                    {(item.ac_bonus > 0 || item.save_bonus > 0) && (
                                        <div className="flex gap-2 mb-3">
                                            {item.ac_bonus > 0 && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">+{item.ac_bonus} AC</span>}
                                            {item.save_bonus > 0 && <span className="text-[10px] font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded">+{item.save_bonus} Saves</span>}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-4">
                                        {((item.equipped_slot && item.equipped_slot !== 'Wondrous') ||
                                            (inferEquippedSlot(item) !== 'Wondrous') ||
                                            (item.attunement === true || item.attunement === 'true')) ? (
                                            <button
                                                disabled={!item.isEquipped && (item.attunement === true || item.attunement === 'true') && attunedCount >= attunementLimit}
                                                onClick={() => toggleEquip(item.id)}
                                                className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all ${item.isEquipped ? 'bg-emerald-600 text-white' :
                                                    (!item.isEquipped && (item.attunement === true || item.attunement === 'true') && attunedCount >= attunementLimit) ? 'bg-gray-800 text-gray-600 cursor-not-allowed' :
                                                        'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {item.isEquipped ? <CheckCircle2 size={14} /> : null}
                                                {item.isEquipped ? 'Equipped' :
                                                    (!item.isEquipped && (item.attunement === true || item.attunement === 'true') && attunedCount >= attunementLimit) ? 'Limit Reached' : 'Equip'
                                                }
                                            </button>
                                        ) : (
                                            <div className="flex-1 py-1.5 rounded text-[10px] font-bold bg-gray-900/40 text-gray-500 border border-gray-800 flex items-center justify-center gap-2 italic">
                                                Carried Utility
                                            </div>
                                        )}
                                        {item.isAttuned && (
                                            <div className="flex items-center gap-1 bg-teal-900/30 text-teal-400 px-3 py-1.5 rounded border border-teal-500/20 text-xs font-bold">
                                                <Star size={12} fill="currentColor" /> Attuned
                                            </div>
                                        )}
                                        {(item.attunement === true || item.attunement === 'true') && !item.isAttuned && item.isEquipped && (
                                            <div className="flex items-center gap-1 bg-amber-900/30 text-amber-400 px-3 py-1.5 rounded border border-amber-500/20 text-[10px] font-bold">
                                                <AlertCircle size={12} /> Limit Reached
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Equipped Items Summary (User Requested Position: Below Backpack, Above Currency) */}
                    <div className="glass-card p-5 border-emerald-500/20 overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-800/50">
                            <div>
                                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                    <User size={14} /> Equipped and Attuned
                                </h3>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tight">
                                    Note: Your character can only be attuned to a maximum of {attunementLimit} items.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Equipped</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-teal-400 text-xs">★</span>
                                    <span className="text-[10px] font-bold text-teal-400 uppercase">Attuned</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {equipmentSlots
                                .map(slot => ({ ...slot, items: getEquippedInSlot(slot.id) }))
                                .map(slot => {
                                    const hasItems = slot.items.length > 0;
                                    return (
                                        <div key={slot.id} className={`p-3 rounded-xl border transition-all ${hasItems ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-black/20 border-gray-800/50 opacity-40'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <slot.icon size={12} className={hasItems ? 'text-emerald-400' : 'text-gray-600'} />
                                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-tighter">{slot.label}</p>
                                            </div>
                                            {hasItems ? (
                                                <div className="space-y-1">
                                                    {slot.items.map(item => (
                                                        <div key={item.id} className="space-y-1">
                                                            <p className="text-xs font-bold text-white leading-tight truncate">
                                                                {item.name} {item.isAttuned && <span className="text-teal-400 text-[10px]">★</span>}
                                                            </p>
                                                            {checkProficiency(item) === false && (
                                                                <p className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-0.5">
                                                                    <AlertCircle size={7} /> Non-Proficient
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-gray-700 italic">Empty</p>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Proficiencies moved here to keep them grouped with the arsenal summary */}
                        <div className="mt-6 pt-6 border-t border-gray-800/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-widest">Armor Proficiencies</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {armorProfs.length > 0 ? armorProfs.map(p => <span key={p} className="text-[9px] font-bold bg-emerald-900/30 text-emerald-300 px-2 py-1 rounded border border-emerald-500/20 uppercase">{p}</span>) : <span className="text-gray-600 italic text-[10px]">None</span>}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black mb-3 tracking-widest">Weapon Proficiencies</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {weaponProfs.length > 0 ? weaponProfs.map(p => <span key={p} className="text-[9px] font-bold bg-teal-900/30 text-teal-300 px-2 py-1 rounded border border-teal-500/20 uppercase">{p}</span>) : <span className="text-gray-600 italic text-[10px]">None</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Currency Section */}
                    <div className="glass-card p-5 border-amber-500/20">
                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            Currency & Funds
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { id: 'cp', label: 'CP', color: 'text-orange-400', border: 'border-orange-500/20' },
                                { id: 'sp', label: 'SP', color: 'text-gray-300', border: 'border-gray-400/20' },
                                { id: 'ep', label: 'EP', color: 'text-blue-300', border: 'border-blue-500/20' },
                                { id: 'gp', label: 'GP', color: 'text-yellow-400', border: 'border-yellow-500/20' },
                                { id: 'pp', label: 'PP', color: 'text-teal-300', border: 'border-teal-500/20' }
                            ].map(coin => (
                                <div key={coin.id} className={`bg-black/40 p-3 rounded-xl border ${coin.border} flex flex-col items-center`}>
                                    <label className={`text-[10px] font-black ${coin.color} mb-1 uppercase tracking-tighter`}>{coin.label}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={data.money?.[coin.id] ?? 0}
                                        onChange={(e) => {
                                            const newMoney = { ...(data.money || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }), [coin.id]: parseInt(e.target.value) || 0 };
                                            updateData({ money: newMoney });
                                        }}
                                        className="w-full bg-transparent text-center text-white font-bold focus:outline-none text-lg"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Manual Treasure Section */}
                    <div className="glass-card p-5 border-amber-500/10">
                        <label className="block text-xs font-black text-amber-500/70 uppercase tracking-widest mb-3">Manually Recorded Treasure</label>
                        <textarea
                            value={data.treasure || ''}
                            onChange={(e) => updateData({ treasure: e.target.value })}
                            rows="4"
                            placeholder="Gems, art objects, rare artifacts, and other non-standard gear..."
                            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500/40 focus:outline-none text-gray-300 transition-all resize-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-2 italic">
                            This text will be mapped to the formal "Equipment" or "Treasure" section of your PDF character sheet.
                        </p>
                    </div>
                </main>
            </div>

            {showDatabaseModal && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-emerald-500/30 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden relative">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-black/40">
                            <div>
                                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 uppercase tracking-tighter">
                                    Equipment Database
                                </h3>
                                <p className="text-sm text-gray-400">Browse and add items to your character's inventory.</p>
                            </div>
                            <button
                                onClick={() => setShowDatabaseModal(false)}
                                className="text-gray-500 hover:text-white transition-colors bg-gray-800/50 hover:bg-gray-800 p-2 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search artifacts and gear..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none pl-10"
                                    />
                                    <Sword size={16} className="absolute left-3 top-3.5 text-gray-600" />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    className="bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="weapons">Weapons</option>
                                    <option value="magicItems">Magic Items</option>
                                    <option value="armor">Armor</option>
                                    <option value="gear">Adventuring Gear</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                                {filteredDbItems.map((item, i) => (
                                    <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-col gap-2 justify-between group hover:border-emerald-500/40 hover:bg-black/40 transition-all h-full">
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{item.name || item.Item}</h4>
                                            <div className="flex justify-between items-start">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                                                    {item.type || item.Type || 'Item'} • {item.rarity || item.Cost || 'Standard'}
                                                </p>
                                                {(() => {
                                                    const isProf = checkProficiency(item);
                                                    if (isProf === true) return <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase">Proficient</span>;
                                                    if (isProf === false) return <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase flex items-center gap-1"><AlertCircle size={8} /> Non-Proficient</span>;
                                                    return null;
                                                })()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addToInventory(item);
                                                setAddedItemId(i);
                                                setTimeout(() => setAddedItemId(null), 1000);
                                            }}
                                            className={`w-full px-3 py-2 rounded-lg text-xs font-black transition-all border ${addedItemId === i
                                                ? 'bg-emerald-500 text-black border-emerald-400 scale-[0.98]'
                                                : 'bg-emerald-600/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-600 hover:text-white'
                                                }`}
                                        >
                                            {addedItemId === i ? 'ADDED!' : 'ADD TO BACKPACK'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
