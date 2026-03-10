import React from 'react';
import { CLASSES, SKILLS } from '../data/rules5e';
import { calculateStats } from '../utils/stats';

export default function AbilityScoreImpact({ data }) {
    if (!data.class) return null;

    const stats = calculateStats(data);
    const { maxHp, ac, acNote, hasShield, passivePerception, initiative, mods, profBonus, knownSkills } = stats;

    const level = Number(data.level) || 1;
    const charClass = CLASSES[data.class];
    const formatMod = (m) => (m >= 0 ? `+${m}` : `${m}`);


    return (
        <div className="mt-8 pt-8 border-t border-emerald-900/50 animate-fade-in">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M8 15h8" /></svg>
                Mechanical Impact (Level {level} {data.class})
            </h3>

            {/* Top Row: Core Derived Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Max HP</p>
                    <p className="text-3xl font-bold text-white">{maxHp}</p>
                    <p className="text-[10px] text-gray-500 mt-1">Uses {charClass.hitDie} Hit Die</p>
                </div>
                <div className="bg-gray-900 border border-gray-700 rounded p-4 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Armor Class</p>
                    <p className="text-3xl font-bold text-white">
                        {hasShield ? `${ac - 2}/${ac}` : ac}
                    </p>
                    {hasShield && <p className="text-[9px] text-gray-500 uppercase leading-none mt-1">(No Shield / With Shield)</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{acNote}</p>
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

            {/* NEW: Mechanical Breakdown Box */}
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-5 mb-8">
                <p className="text-[10px] text-emerald-500 uppercase font-black mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Calculation Breakdown
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {/* AC Breakdown */}
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Armor Class</span>
                        <div className="text-right">
                            <p className="text-xs font-mono text-white">
                                {stats.breakdown.ac.base} (Base)
                                {stats.breakdown.ac.dexBonus !== 0 && ` + ${stats.breakdown.ac.dexBonus} (DEX)`}
                                {stats.breakdown.ac.shieldBonus !== 0 && ` + ${stats.breakdown.ac.shieldBonus} (Shield)`}
                                {stats.breakdown.ac.specialBonus !== 0 && ` + ${stats.breakdown.ac.specialBonus} (Bonus)`}
                                {stats.breakdown.ac.itemBonus !== 0 && ` + ${stats.breakdown.ac.itemBonus} (Items)`}
                                {` = `}
                                <span className="text-emerald-400 font-bold">{stats.breakdown.ac.total}</span>
                            </p>
                            <p className="text-[9px] text-gray-500 italic uppercase tracking-tighter">{stats.breakdown.ac.specialNote}</p>
                        </div>
                    </div>

                    {/* HP Breakdown */}
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Hit Points</span>
                        <div className="text-right">
                            <p className="text-xs font-mono text-white">
                                {stats.breakdown.hp.base} (L1)
                                {level > 1 && ` + ${stats.breakdown.hp.levelBonus} (L2+)`}
                                {stats.breakdown.hp.conBonus !== 0 && ` + ${stats.breakdown.hp.conBonus} (CON)`}
                                {` = `}
                                <span className="text-emerald-400 font-bold">{stats.breakdown.hp.total}</span>
                            </p>
                            <p className="text-[9px] text-gray-500 italic uppercase tracking-tighter">Level {level} {data.class}</p>
                        </div>
                    </div>

                    {/* Initiative Breakdown */}
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Initiative</span>
                        <div className="text-right font-mono text-xs text-white">
                            {formatMod(stats.breakdown.initiative.dexMod)} (DEX Mod)
                            {` = `}
                            <span className="text-emerald-400 font-bold">{formatMod(stats.breakdown.initiative.total)}</span>
                        </div>
                    </div>

                    {/* Passive Perception Breakdown */}
                    <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Passive Perception</span>
                        <div className="text-right font-mono text-xs text-white">
                            10 (Base)
                            {stats.breakdown.passivePerception.wisMod !== 0 && ` + ${formatMod(stats.breakdown.passivePerception.wisMod)} (WIS)`}
                            {stats.breakdown.passivePerception.profBonus !== 0 && ` + ${stats.breakdown.passivePerception.profBonus} (Prof)`}
                            {` = `}
                            <span className="text-emerald-400 font-bold">{stats.breakdown.passivePerception.total}</span>
                        </div>
                    </div>
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
                            const isProf = knownSkills.has(skillName);
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
