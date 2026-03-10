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
            subclass: '',
            subclassOption: '',
            selectedClassSkills: [],
            background: '',
            backgroundSkills: [],
            selectedCantrips: [],
            selectedSpells: {},
            equippedArmor: 'None',
            equippedShield: false,
            equippedWeapons: ['', '', ''],
            inventory: '',
            abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
            abilityTokens: { t1: '', t2: '', t3: '' }
        });
    };

    const handleLevelChange = (newLevelStr) => {
        const newLevel = parseInt(newLevelStr) || 1;
        const oldLevel = Number(data.level) || 1;

        const updates = { level: newLevel };

        // Subclass Cleanup: If dropping below the level they gain a specialization
        if (data.class) {
            const requiredLevel = CLASSES[data.class]?.subclassLevel || 3;
            if (newLevel < requiredLevel) {
                updates.subclass = '';
                updates.subclassOption = '';
            }
        }

        // Spell Cleanup: If level decreases, clear selections (limits and slots change)
        if (newLevel < oldLevel) {
            updates.selectedCantrips = [];
            updates.selectedSpells = {};
        }

        updateData(updates);
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

    const randomizeAppearance = () => {
        const eyeColors = ['Amber', 'Copper', 'Yellow', 'Emerald', 'Sapphire', 'Golden', 'Pale Green'];
        const skinPatterns = [
            'Leopard-spotted gold', 'Tiger-striped orange', 'Charcoal grey with silver highlights',
            'Snowy white with grey spots', 'Solid sleek black', 'Tortoiseshell calico',
            'Sandy beige with brown stripes', 'Smoky grey lynx-pattern'
        ];
        const hairLengths = ['Short-haired', 'Medium-haired', 'Long-haired', 'Tufted'];

        // Age: 18 to 80
        const age = 18 + Math.floor(Math.random() * 63);

        let heightStr, weightStr;
        if (data.size === 'Small') {
            // Height: 2'0" to 4'0" (24-48 inches)
            const totalInches = 24 + Math.floor(Math.random() * 25);
            heightStr = `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
            // Weight: 30 to 60 lbs
            weightStr = `${30 + Math.floor(Math.random() * 31)} lb`;
        } else {
            // Height: 5'0" to 7'0" (60-84 inches)
            const totalInches = 60 + Math.floor(Math.random() * 25);
            heightStr = `${Math.floor(totalInches / 12)}'${totalInches % 12}"`;
            // Weight: 100 to 250 lbs
            weightStr = `${100 + Math.floor(Math.random() * 151)} lb`;
        }

        updateData({
            eyes: eyeColors[Math.floor(Math.random() * eyeColors.length)],
            skin: skinPatterns[Math.floor(Math.random() * skinPatterns.length)],
            hair: hairLengths[Math.floor(Math.random() * hairLengths.length)],
            height: heightStr,
            weight: weightStr,
            age: age.toString()
        });
    };

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
                                onChange={(e) => handleLevelChange(e.target.value)}
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

                {/* Background & Alignment + Physical Characteristics */}
                <div className="space-y-8">
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

                    {/* Physical Characteristics */}
                    <div className="space-y-6 bg-[var(--color-dark-card)] p-6 rounded-lg border border-gray-700 h-fit">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-emerald-400 tracking-wide uppercase">Physical Traits</label>
                            <button
                                onClick={randomizeAppearance}
                                className="text-[10px] bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded transition-colors uppercase font-black"
                            >
                                🎲 Randomize Appearance
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-400 uppercase">
                                    Age <span className="text-[10px] text-gray-500 lowercase ml-1">(18 to 80 years)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.age || ''}
                                    onChange={(e) => updateData({ age: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-400 uppercase">
                                    Weight <span className="text-[10px] text-gray-500 lowercase ml-1">
                                        {data.size === 'Small' ? '(30 - 60 lbs)' : '(100 - 250 lbs)'}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={data.weight || ''}
                                    onChange={(e) => updateData({ weight: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-400 uppercase">
                                    Height <span className="text-[10px] text-gray-500 lowercase ml-1">
                                        {data.size === 'Small' ? '(2 - 4 feet)' : '(5 - 7 feet)'}
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={data.height || ''}
                                    onChange={(e) => updateData({ height: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">
                                    Eyes <span className="text-[10px] text-gray-500 lowercase ml-1">(shape and color)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.eyes || ''}
                                    onChange={(e) => updateData({ eyes: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Skin (Coloring/Pattern)</label>
                                <input
                                    type="text"
                                    value={data.skin || ''}
                                    onChange={(e) => updateData({ skin: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Hair (Length)</label>
                                <input
                                    type="text"
                                    value={data.hair || ''}
                                    onChange={(e) => updateData({ hair: e.target.value })}
                                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
