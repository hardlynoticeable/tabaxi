import React from 'react';
import { CLASSES, SKILLS } from '../data/rules5e';

export default function AbilityScoreImpact({ data }) {
    if (!data.class) return null;

    const charClass = CLASSES[data.class];
    const level = Number(data.level) || 1;

    // Calculate Proficiency Bonus
    // 1-4 = +2, 5-8 = +3, 9-12 = +4, 13-16 = +5, 17-20 = +6
    const profBonus = Math.ceil(level / 4) + 1;

    // Helper to get total ability score
    const getScore = (key) => {
        const base = data.abilityScores && data.abilityScores[key] !== undefined ? data.abilityScores[key] : 10;
        const bonus = (data.abilityBonuses && data.abilityBonuses[key]) || 0;
        return base === "" ? 10 : Number(base) + bonus; // Treat blank as 10 for math
    };

    // Helper to get modifier
    const getMod = (score) => Math.floor((score - 10) / 2);

    const mods = {
        str: getMod(getScore('str')),
        dex: getMod(getScore('dex')),
        con: getMod(getScore('con')),
        int: getMod(getScore('int')),
        wis: getMod(getScore('wis')),
        cha: getMod(getScore('cha')),
    };

    const formatMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

    // --- Derived Stats ---

    // 1. Hit Points: Max Hit Die + (Average Hit Die * (Level - 1)) + (Con Mod * Level)
    const avgHitDie = (charClass.hitDie / 2) + 1;
    const hp = charClass.hitDie + (avgHitDie * (level - 1)) + (mods.con * level);

    // 2. Armor Class (Unarmored Base: 10 + Dex).
    // Monk: 10 + Dex + Wis
    // Barbarian: 10 + Dex + Con
    let ac = 10 + mods.dex;
    let acNote = "Base Unarmored";
    if (data.class === 'Monk') {
        ac += mods.wis;
        acNote = "Unarmored Defense (Monk)";
    } else if (data.class === 'Barbarian') {
        ac += mods.con;
        acNote = "Unarmored Defense (Barbarian)";
    }

    // 3. Initiative
    const initiative = mods.dex;

    // 4. Skills Processing
    const allKnownSkills = new Set([
        ...(data.tabaxiSkills || []),
        ...(data.selectedClassSkills || []),
        ...(data.backgroundSkills || [])
    ]);

    // Passive Perception = 10 + Wis Mod + (Proficiency if Perception is known)
    const passivePerception = 10 + mods.wis + (allKnownSkills.has('Perception') ? profBonus : 0);


    return (
        <div className="mt-8 pt-8 border-t border-emerald-900/50 animate-fade-in">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M8 15h8" /></svg>
                Mechanical Impact Impact (Level {level} {data.class})
            </h3>

            {/* Top Row: Core Derived Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Max HP</p>
                    <p className="text-3xl font-bold text-white">{hp}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Uses {charClass.hitDie} Hit Die</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Armor Class</p>
                    <p className="text-3xl font-bold text-white">{ac}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{acNote}</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Initiative</p>
                    <p className="text-3xl font-bold text-white">{formatMod(initiative)}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Based on Dex</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Passive Perc.</p>
                    <p className="text-3xl font-bold text-white">{passivePerception}</p>
                    <p className="text-[10px] text-gray-500 mt-1">10 + Wis Mod + Prof</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Saving Throws */}
                <div className="bg-gray-900 border border-gray-700 rounded p-4">
                    <div className="flex justify-between items-baseline mb-4 border-b border-gray-800 pb-2">
                        <h4 className="font-bold text-emerald-500 uppercase text-sm tracking-wider">Saving Throws</h4>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Prof Bonus: +{profBonus}</span>
                    </div>
                    <div className="space-y-2">
                        {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => {
                            const isProf = charClass.saves.includes(stat);
                            const totalSave = mods[stat] + (isProf ? profBonus : 0);
                            return (
                                <div key={stat} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full border ${isProf ? 'bg-brand-500 border-brand-500' : 'border-gray-600'}`}></div>
                                        <span className={`uppercase font-mono ${isProf ? 'text-white font-bold' : 'text-gray-400'}`}>{stat}</span>
                                    </div>
                                    <span className={`font-mono ${isProf ? 'text-brand-400 font-bold' : 'text-gray-400'}`}>{formatMod(totalSave)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-900 border border-gray-700 rounded p-4 lg:col-span-2">
                    <h4 className="font-bold text-emerald-500 uppercase text-sm tracking-wider mb-4 border-b border-gray-800 pb-2">Skills Overview</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                        {Object.entries(SKILLS).map(([skillName, governingStat]) => {
                            const isProf = allKnownSkills.has(skillName);
                            const totalSkill = mods[governingStat] + (isProf ? profBonus : 0);

                            return (
                                <div key={skillName} className="flex justify-between items-center text-sm py-1 border-b border-gray-800/50 hover:bg-gray-800/50 px-1 rounded transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full border ${isProf ? 'bg-brand-500 border-brand-500' : 'border-gray-600'}`}></div>
                                        <span className={isProf ? 'text-white font-bold' : 'text-gray-400'}>{skillName} <span className="text-[10px] text-gray-500 uppercase ml-1">({governingStat})</span></span>
                                    </div>
                                    <span className={`font-mono ${isProf ? 'text-brand-400 font-bold' : 'text-gray-400'}`}>{formatMod(totalSkill)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
