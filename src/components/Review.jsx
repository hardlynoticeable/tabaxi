import React, { useState } from 'react';
import { generateCharacterPDF } from '../utils/pdfGenerator';
import AbilityScoreImpact from './AbilityScoreImpact';
import { SUBCLASSES, CLASSES } from '../data/rules5e';

export default function Review({ data }) {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await generateCharacterPDF(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)]">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 flex items-center gap-3">
                    Review Your Tabaxi
                    {downloading && (
                        <svg className="animate-spin h-6 w-6 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                </h2>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="px-6 py-3 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center gap-2"
                >
                    {downloading ? 'Generating PDF...' : 'Generate Character & PDF!'}
                </button>
            </div>

            <div className="bg-emerald-900/10 border border-emerald-800/50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative overflow-hidden">
                {/* Background graphic */}
                <div className="absolute right-[-10%] bottom-[-20%] opacity-5 text-emerald-500 pointer-events-none scale-150">
                    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                </div>

                {/* Left Column: Identity */}
                <div className="space-y-4 relative z-10">
                    <div>
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Name</p>
                        <p className="text-xl font-medium text-white">{data.name || 'Unnamed Wanderer'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Class</p>
                            <p className="text-lg text-white">
                                {data.class || 'Unknown'}
                                {data.subclass && <span className="text-emerald-300 ml-2 text-base">({data.subclass})</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Level</p>
                            <p className="text-lg text-white">{data.level}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Background</p>
                            <p className="text-lg text-white">{data.background || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Alignment</p>
                            <p className="text-lg text-white">{data.alignment || 'Neutral'}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700/50">
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">Ability Scores</p>
                        <div className="flex gap-3 flex-wrap">
                            {Object.entries(data.abilityScores).map(([key, val]) => {
                                const bonus = data.abilityBonuses ? (data.abilityBonuses[key] || 0) : 0;
                                const baseScore = val !== "" && val !== undefined ? Number(val) : 0;
                                const total = baseScore + bonus;
                                return (
                                    <div key={key} className="bg-gray-800 px-3 py-1 rounded border border-gray-600 font-mono">
                                        <span className="text-gray-400 mr-2 uppercase">{key}</span>
                                        <span className={`font-bold ${bonus > 0 ? 'text-brand-400' : 'text-emerald-400'}`}>{total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Traits */}
                <div className="space-y-4 relative z-10 pl-0 md:pl-6 md:border-l border-gray-700">

                    <div>
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mt-4 mb-2">Tabaxi Traits</p>
                        <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                            <li><span className="text-emerald-300 font-bold">Speed:</span> 30ft Walking, 30ft Climbing</li>
                            <li><span className="text-emerald-300 font-bold">Darkvision:</span> 60ft</li>
                            <li><span className="text-emerald-300 font-bold">Cat's Talent:</span> Proficiency in Perception & Stealth</li>
                            <li><span className="text-emerald-300 font-bold">Feline Agility:</span> Double speed burst</li>
                            <li><span className="text-emerald-300 font-bold">Cat's Claws:</span> 1d6 Slashing unarmed strikes</li>
                            <li><span className="text-emerald-300 font-bold">Size:</span> {data.size}</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Currency</p>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { id: 'cp', label: 'CP', color: 'text-orange-400' },
                                { id: 'sp', label: 'SP', color: 'text-gray-300' },
                                { id: 'ep', label: 'EP', color: 'text-blue-300' },
                                { id: 'gp', label: 'GP', color: 'text-yellow-400' },
                                { id: 'pp', label: 'PP', color: 'text-teal-300' }
                            ].map(coin => (
                                <div key={coin.id} className="bg-black/40 px-3 py-1 rounded border border-gray-800 flex items-center gap-2">
                                    <span className={`text-[10px] font-black ${coin.color} uppercase`}>{coin.label}</span>
                                    <span className="text-sm font-bold text-white">{data.money?.[coin.id] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.treasure && (
                        <div>
                            <p className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-2">Recorded Treasure</p>
                            <div className="bg-black/40 p-3 rounded border border-amber-500/20">
                                <p className="text-xs text-gray-400 italic font-medium whitespace-pre-wrap">{data.treasure}</p>
                            </div>
                        </div>
                    )}

                    {/* Base Class Features */}
                    {CLASSES[data.class]?.features && (
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mt-4 mb-2">
                                Class Features
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                                {Object.entries(CLASSES[data.class].features)
                                    .filter(([level]) => parseInt(level) <= data.level)
                                    .flatMap(([_, featuresArray]) => featuresArray)
                                    .map((feature, idx) => (
                                        <li key={`base-feature-${idx}`} className="text-xs italic opacity-80 border-l-2 border-emerald-800 pl-2 ml-1">
                                            {feature}
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    )}

                    {/* Subclass Features */}
                    {data.subclass && SUBCLASSES[data.class]?.[data.subclass] && (
                        <div>
                            <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mt-4 mb-2">
                                {CLASSES[data.class]?.subclassTitle || "Subclass"} Features ({data.subclass}{data.subclassOption ? `: ${data.subclassOption}` : ''})
                            </p>
                            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
                                {Object.entries(SUBCLASSES[data.class][data.subclass])
                                    .filter(([key]) => key.startsWith('level') && parseInt(key.replace('level', '')) <= data.level)
                                    .flatMap(([key, feature]) => {
                                        const lines = feature.split('\n');
                                        const options = SUBCLASSES[data.class][data.subclass].subclassOptions;

                                        return lines.map((line, idx) => {
                                            if (line.includes('Bonus Proficiency:') || line.includes('Spells:')) return null;

                                            let content = line;
                                            if (options && data.subclassOption && line.startsWith(`${options.title}:`)) {
                                                const benefit = options.choices[data.subclassOption];
                                                content = `${options.title} (${data.subclassOption}): ${benefit}`;
                                            }

                                            return (
                                                <li key={`${key}-${idx}`} className="whitespace-pre-line text-xs italic opacity-80 border-l-2 border-emerald-800 pl-2 ml-1">
                                                    {content}
                                                </li>
                                            );
                                        });
                                    })
                                }
                            </ul>
                        </div>
                    )}
                    {/* Lore & Background */}
                    <div className="pt-4 border-t border-gray-700/50">
                        <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-3">Lore & Background</p>
                        <div className="space-y-3">
                            {data.personalityTraits && (
                                <div>
                                    <p className="text-[10px] text-emerald-300/60 uppercase font-black">Personality Traits</p>
                                    <p className="text-xs text-gray-300 italic">"{data.personalityTraits}"</p>
                                </div>
                            )}
                            {data.ideals && (
                                <div>
                                    <p className="text-[10px] text-emerald-300/60 uppercase font-black">Ideals</p>
                                    <p className="text-xs text-gray-300 italic">"{data.ideals}"</p>
                                </div>
                            )}
                            {data.bonds && (
                                <div>
                                    <p className="text-[10px] text-emerald-300/60 uppercase font-black">Bonds</p>
                                    <p className="text-xs text-gray-300 italic">"{data.bonds}"</p>
                                </div>
                            )}
                            {data.flaws && (
                                <div>
                                    <p className="text-[10px] text-emerald-300/60 uppercase font-black">Flaws</p>
                                    <p className="text-xs text-gray-300 italic">"{data.flaws}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AbilityScoreImpact data={data} />
        </div>
    );
}
