import React, { useEffect } from 'react';
import { CLASSES, BACKGROUNDS, LANGUAGES } from '../data/rules5e';

export default function CoreStats({ data, updateData }) {
    const classes = Object.keys(CLASSES);
    const backgrounds = Object.keys(BACKGROUNDS);

    const alignments = [
        'Lawful Good', 'Neutral Good', 'Chaotic Good',
        'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
        'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];

    // Auto-apply background skills and remove any overlapping class skills
    useEffect(() => {
        if (data.background) {
            const bgSkills = BACKGROUNDS[data.background] || [];
            const newClassSkills = (data.selectedClassSkills || []).filter(skill => !bgSkills.includes(skill));

            updateData({
                backgroundSkills: bgSkills,
                selectedClassSkills: newClassSkills
            });
        } else {
            updateData({ backgroundSkills: [] });
        }
    }, [data.background]);

    // Clear class skills and other dependent state if class changes to prevent invalid selection
    const handleClassChange = (newClass) => {
        updateData({
            class: newClass,
            selectedClassSkills: [],
            background: '',
            backgroundSkills: [],
            selectedCantrips: [],
            selectedSpells: {},
            equippedArmor: 'None',
            equippedShield: false,
            equippedWeapons: ['', '', ''],
            inventory: ''
        });
    };

    const handleClassSkillChange = (skill) => {
        const current = data.selectedClassSkills || [];
        if (current.includes(skill)) {
            updateData({ selectedClassSkills: current.filter(s => s !== skill) });
        } else {
            const limit = CLASSES[data.class].skillChoices;
            if (current.length < limit) {
                updateData({ selectedClassSkills: [...current, skill] });
            }
        }
    };

    const getSynergyNotes = (className) => {
        switch (className) {
            case 'Rogue':
            case 'Bard':
                return "Excellent synergy! Built-in Perception/Stealth skills and Feline Agility make you a top-tier mobility and skill expert.";
            case 'Monk':
                return "Fantastic option! The climb speed is great, and Feline Agility doubles your already incredible monastic speed.";
            case 'Fighter':
            case 'Barbarian':
                return "Great choice! The innate climbing speed and burst movement answer a major melee weakness: reaching ranged or flying enemies.";
            case 'Ranger':
                return "Perfect fit as a scout. Natural synergy with Dexterity, Stealth, and Perception.";
            default:
                return "Tabaxi traits (Darkvision, climbing, burst speed) are universally useful for any class!";
        }
    };

    const currentClass = data.class ? CLASSES[data.class] : null;

    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)] h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
            <h2 className="text-3xl mb-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Class & Background
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Class Selection */}
                <div className="space-y-4 bg-[var(--color-dark-card)] p-6 rounded-lg border border-gray-700">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase">Class</label>
                            <select
                                value={data.class}
                                onChange={(e) => handleClassChange(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white"
                            >
                                <option value="" disabled>Select a Class</option>
                                {classes.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="w-24 space-y-2">
                            <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase">Level</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                value={data.level || 1}
                                onChange={(e) => updateData({ level: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white text-center"
                            />
                        </div>
                    </div>

                    {data.class && (
                        <div className="mt-4 p-4 rounded bg-emerald-900/30 border border-emerald-800 text-sm italic opacity-90">
                            <span className="font-bold mr-2 text-emerald-300">Synergy Note:</span>
                            {getSynergyNotes(data.class)}
                        </div>
                    )}

                    {/* Class Image Nest */}
                    {data.class && (
                        <div className="mt-6 flex justify-center">
                            <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                                <img
                                    src={`/classes/${data.class.toLowerCase()}.png`}
                                    alt={`Tabaxi ${data.class}`}
                                    className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }}
                                />
                            </div>
                        </div>
                    )}

                    {currentClass && (
                        <div className="mt-6">
                            <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase mb-3">
                                Class Skills (Choose {currentClass.skillChoices})
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {currentClass.skillOptions.map(skill => {
                                    // Disable if they have it from somewhere else, or if they hit the cap and this isn't checked
                                    const isFromTabaxi = (data.tabaxiSkills || []).includes(skill);
                                    const isFromBg = (data.backgroundSkills || []).includes(skill);
                                    const isChecked = (data.selectedClassSkills || []).includes(skill);
                                    const hitCap = (data.selectedClassSkills || []).length >= currentClass.skillChoices;

                                    const isDisabled = (isFromTabaxi || isFromBg) || (hitCap && !isChecked);

                                    return (
                                        <label
                                            key={skill}
                                            className={`flex items-center space-x-2 text-sm p-2 rounded border transition-colors cursor-pointer
                                                ${isChecked ? 'bg-emerald-900/40 border-emerald-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300'}
                                                ${isDisabled && !isChecked ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500'}
                                            `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked || isFromTabaxi || isFromBg}
                                                disabled={isDisabled}
                                                onChange={() => handleClassSkillChange(skill)}
                                                className="w-4 h-4 text-emerald-500 border-gray-600 rounded bg-gray-900 focus:ring-emerald-500 focus:ring-2"
                                            />
                                            <span className="truncate">
                                                {skill}
                                                {isFromTabaxi && <span className="ml-1 text-xs text-brand-400">(Tabaxi)</span>}
                                                {isFromBg && <span className="ml-1 text-xs text-brand-400">(Bg)</span>}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Background & Alignment */}
                <div className="space-y-6 bg-[var(--color-dark-card)] p-6 rounded-lg border border-gray-700 h-fit">
                    <div>
                        <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase mb-2">Background</label>
                        <select
                            value={data.background}
                            onChange={(e) => updateData({ background: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white mb-3"
                        >
                            <option value="" disabled>Select a Background</option>
                            {backgrounds.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        {data.background && BACKGROUNDS[data.background] && (
                            <div className="text-sm p-3 bg-gray-800 border border-gray-600 rounded">
                                <span className="text-emerald-400 font-bold block mb-1">Provided Skills:</span>
                                <span className="text-gray-300">{BACKGROUNDS[data.background].join(', ')}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase mb-2">Alignment</label>
                        <select
                            value={data.alignment}
                            onChange={(e) => updateData({ alignment: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white"
                        >
                            <option value="" disabled>Select Alignment</option>
                            {alignments.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase mb-2">Bonus Language</label>
                        <select
                            value={data.language}
                            onChange={(e) => updateData({ language: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white"
                        >
                            <option value="">Select Bonus Language</option>
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <div className="text-xs text-brand-300 italic mt-2">
                            Tabaxi know Common plus one other language.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
