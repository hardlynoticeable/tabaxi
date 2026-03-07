import React from 'react';
import { CLASSES } from '../data/rules5e';
import { SPELL_LIST, SPELLCASTING_PROGRESSIONS } from '../data/spells5e';

export default function Spells({ data, updateData }) {
    const charClass = data.class;
    const level = Number(data.level) || 1;
    const spellcasting = charClass ? CLASSES[charClass]?.spellcasting : null;

    if (!spellcasting) return <div>No spellcasting for this class.</div>;

    const ability = spellcasting.ability; // 'int', 'wis', 'cha'
    const abilityScore = data.abilityScores[ability] || 10;
    const abilityBonus = data.abilityBonuses[ability] || 0;
    const totalAbility = Number(abilityScore) + abilityBonus;
    const abilityMod = Math.floor((totalAbility - 10) / 2);

    const profBonus = Math.ceil(level / 4) + 1;
    const spellSaveDC = 8 + profBonus + abilityMod;
    const spellAttackBonus = profBonus + abilityMod;

    // Cantrips
    const cantripsKnown = spellcasting.cantripsKnown[level - 1] || 0;
    const cantripOptions = SPELL_LIST[charClass]?.[0] || [];

    // Slots & Leveled Spells
    const progression = SPELLCASTING_PROGRESSIONS[spellcasting.progression];
    const availableSlots = progression[level - 1] || []; // e.g. [4, 2] means 4 1st, 2 2nd

    // Allowed known spells (if applicable)
    const spellsKnownTarget = spellcasting.spellsKnown ? spellcasting.spellsKnown[level - 1] : (spellcasting.type === 'prepared' ? Math.max(1, level + abilityMod) : 0);
    // For prepared casters: level + mod (Cleric, Druid, Wizard, Artificer uses level/2 + mod, Paladin uses level/2 + mod)
    // Actually exact prep formula: 
    // Artificer: Floor(Level/2) + Int Mod
    // Paladin: Floor(Level/2) + Cha Mod
    // Cleric/Druid/Wizard: Level + Mod
    let maxPreparedOrKnown = spellsKnownTarget;
    if (spellcasting.type === 'prepared') {
        if (charClass === 'Paladin' || charClass === 'Artificer') {
            maxPreparedOrKnown = Math.max(1, Math.floor(level / 2) + abilityMod);
        } else {
            maxPreparedOrKnown = Math.max(1, level + abilityMod);
        }
    }

    const { selectedCantrips = [], selectedSpells = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] } } = data;

    // Count currently selected leveled spells
    const totalSelectedSpells = Object.values(selectedSpells).flat().length;

    const toggleCantrip = (spell) => {
        const current = [...selectedCantrips];
        if (current.includes(spell)) {
            updateData({ selectedCantrips: current.filter(s => s !== spell) });
        } else if (current.length < cantripsKnown) {
            updateData({ selectedCantrips: [...current, spell] });
        }
    };

    const toggleSpell = (level, spell) => {
        const currentLevelSpells = [...(selectedSpells[level] || [])];
        if (currentLevelSpells.includes(spell)) {
            const updated = { ...selectedSpells, [level]: currentLevelSpells.filter(s => s !== spell) };
            updateData({ selectedSpells: updated });
        } else if (totalSelectedSpells < maxPreparedOrKnown) {
            const updated = { ...selectedSpells, [level]: [...currentLevelSpells, spell] };
            updateData({ selectedSpells: updated });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)] h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
            <h2 className="text-3xl mb-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Spellcasting (Level {level} {charClass})
            </h2>

            {/* Spellcasting Core Stats Header */}
            <div className="flex gap-4 mb-6 relative">
                <div className="flex-1 bg-gray-900/60 p-4 rounded-lg border border-emerald-900/50 flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-1">Ability</span>
                    <span className="text-xl font-bold text-emerald-300 uppercase">{ability}</span>
                </div>
                <div className="flex-1 bg-gray-900/60 p-4 rounded-lg border border-emerald-900/50 flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-1">Save DC</span>
                    <span className="text-3xl font-bold text-emerald-400">{spellSaveDC}</span>
                </div>
                <div className="flex-1 bg-gray-900/60 p-4 rounded-lg border border-emerald-900/50 flex flex-col items-center">
                    <span className="text-xs uppercase font-bold text-gray-400 mb-1">Attack Bonus</span>
                    <span className="text-3xl font-bold text-emerald-400">+{spellAttackBonus}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cantrips Section */}
                <div className="bg-[var(--color-dark-card)] p-6 rounded-lg border border-gray-700 h-fit">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2 border-b border-gray-700 pb-2">
                        Cantrips ({selectedCantrips.length} / {cantripsKnown})
                    </h3>
                    {cantripsKnown > 0 ? (
                        <div className="mt-4 space-y-2">
                            {cantripOptions.map(spell => {
                                const isSelected = selectedCantrips.includes(spell);
                                const hitCap = selectedCantrips.length >= cantripsKnown;
                                return (
                                    <label key={spell} className={`flex items-center space-x-2 text-sm p-2 rounded cursor-pointer transition-colors ${isSelected ? 'bg-emerald-900/40 text-white' : 'hover:bg-gray-800'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={!isSelected && hitCap}
                                            onChange={() => toggleCantrip(spell)}
                                            className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-gray-900 border-gray-600"
                                        />
                                        <span>{spell}</span>
                                    </label>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">This class gets no cantrips at this level.</p>
                    )}
                </div>

                {/* Leveled Spells Section */}
                <div className="bg-[var(--color-dark-card)] p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-emerald-400 mb-2 border-b border-gray-700 pb-2">
                        {spellcasting.type === 'prepared' ? 'Prepared Spells' : 'Spells Known'} ({totalSelectedSpells} / {maxPreparedOrKnown})
                    </h3>
                    <div className="mt-4 space-y-6">
                        {availableSlots.map((numSlots, index) => {
                            const spellLevel = index + 1;
                            // Warlock hack check (if numSlots happens to be 0 but they do have slots of higher levels... actually warlock max spell level)
                            if (numSlots <= 0 && spellcasting.progression !== 'warlock') return null;
                            const warlockMaxLevel = Math.min(5, Math.ceil(level / 2));
                            if (spellcasting.progression === 'warlock' && spellLevel > warlockMaxLevel) return null;

                            const list = SPELL_LIST[charClass]?.[spellLevel] || [];

                            return (
                                <div key={spellLevel}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-brand-300">Level {spellLevel}</h4>
                                        <div className="flex gap-1">
                                            {spellcasting.progression === 'warlock' ? (
                                                numSlots > 0 ? (
                                                    Array.from({ length: numSlots }).map((_, i) => (
                                                        <div key={i} className="w-4 h-4 rounded bg-purple-700 border border-purple-400" title="Pact Magic Slot"></div>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-purple-400 italic">Upcast via Pact Magic</span>
                                                )
                                            ) : (
                                                <>
                                                    {Array.from({ length: numSlots }).map((_, i) => (
                                                        <div key={i} className="w-3 h-3 rounded bg-emerald-700 border border-emerald-400" title="Spell Slot"></div>
                                                    ))}
                                                    {numSlots === 0 && <span className="text-xs text-gray-500">-</span>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {list.map(spell => {
                                            const isSelected = (selectedSpells[spellLevel] || []).includes(spell);
                                            const hitCap = totalSelectedSpells >= maxPreparedOrKnown;
                                            return (
                                                <label key={spell} className={`flex items-center space-x-2 text-sm p-1 rounded cursor-pointer transition-colors ${isSelected ? 'bg-emerald-900/40 text-white' : 'hover:bg-gray-800'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        disabled={!isSelected && hitCap}
                                                        onChange={() => toggleSpell(spellLevel, spell)}
                                                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 bg-gray-900 border-gray-600"
                                                    />
                                                    <span>{spell}</span>
                                                </label>
                                            );
                                        })}
                                        {list.length === 0 && <div className="text-xs text-gray-500 italic">No spells listed.</div>}
                                    </div>
                                </div>
                            );
                        })}
                        {availableSlots.length === 0 && (
                            <p className="text-sm text-gray-400 italic">You have no spell slots at this level.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
