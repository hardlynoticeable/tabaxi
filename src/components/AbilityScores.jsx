import React, { useState, useEffect } from 'react';
import { CLASSES } from '../data/rules5e';
import AbilityScoreImpact from './AbilityScoreImpact';

export default function AbilityScores({ data, updateData }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashGuidance, setFlashGuidance] = useState(false);

    useEffect(() => {
        if (data.class) {
            setFlashGuidance(true);
            const timer = setTimeout(() => {
                setFlashGuidance(false);
            }, 3000); // 3-second flash duration
            return () => clearTimeout(timer);
        }
    }, [data.class]);

    const abilities = [
        { key: 'str', label: 'Strength' },
        { key: 'dex', label: 'Dexterity' },
        { key: 'con', label: 'Constitution' },
        { key: 'int', label: 'Intelligence' },
        { key: 'wis', label: 'Wisdom' },
        { key: 'cha', label: 'Charisma' }
    ];

    const generateRandomScores = () => {
        if (isGenerating) return;
        setIsGenerating(true);

        const newScores = {};
        abilities.forEach(({ key }) => {
            const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
            rolls.sort((a, b) => b - a); // sort descending
            // Drop lowest, sum top 3
            newScores[key] = rolls[0] + rolls[1] + rolls[2];
        });

        // Set the base scores, keep the bonuses
        updateData({ abilityScores: newScores });

        // Cooldown
        setTimeout(() => {
            setIsGenerating(false);
        }, 3000);
    };

    const handleScoreChange = (key, value) => {
        // If user clears the input, let it be blank
        if (value === "") {
            updateData({ abilityScores: { ...data.abilityScores, [key]: "" } });
            return;
        }

        // Subtract bonus from user input to find the true BASE score.
        // e.g. User types "16", active bonus is +2 -> Base score is 14.
        const numVal = Math.max(3, Math.min(20, Number(value)));
        const activeBonus = (data.abilityBonuses && data.abilityBonuses[key]) || 0;
        const newBase = numVal - activeBonus;

        updateData({
            abilityScores: { ...data.abilityScores, [key]: newBase }
        });
    };

    const toggleBonus = (key, amt) => {
        const bonuses = data.abilityBonuses ? { ...data.abilityBonuses } : { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };

        // If clicking the currently active bonus, turn it off
        if (bonuses[key] === amt) {
            bonuses[key] = 0;
            updateData({ abilityBonuses: bonuses });
            return;
        }

        // We can only have one +2 globally, and up to three +1s globally (or one +1 if using the +2/+1 rule).
        // Let's implement strict checking based on MotM:
        // Either: (+2) and (+1)
        // Or: (+1), (+1), (+1)

        // Count existing bonuses
        let hasPlusTwo = false;
        let plusOneCount = 0;

        for (const k in bonuses) {
            if (bonuses[k] === 2) hasPlusTwo = true;
            if (bonuses[k] === 1) plusOneCount++;
        }

        if (amt === 2) {
            // Remove +2 from everywhere else
            for (const k in bonuses) if (bonuses[k] === 2) bonuses[k] = 0;
            // A +2 stat cannot also be the +1 stat
            bonuses[key] = 2;
        } else if (amt === 1) {
            // If we already have a +2, we can only have one +1 total.
            // If we don't have a +2, we can have up to three +1s.

            // Unset this stat's +2 if it had it
            hasPlusTwo = false;
            for (const k in bonuses) {
                if (k === key && bonuses[k] === 2) bonuses[k] = 0;
                if (bonuses[k] === 2) hasPlusTwo = true;
            }

            if (hasPlusTwo) {
                // Remove all other +1s, there can be only one if we have a +2
                for (const k in bonuses) if (bonuses[k] === 1) bonuses[k] = 0;
                bonuses[key] = 1;
            } else {
                // No +2 active. We can have up to three +1s.
                // Re-count +1s since we might have just removed a +2 on ourselves
                plusOneCount = 0;
                for (const k in bonuses) if (bonuses[k] === 1 && k !== key) plusOneCount++;

                if (plusOneCount >= 3) {
                    // Too many +1s! Let's clear the "first" +1 we find just so they can click it.
                    for (const k in bonuses) {
                        if (bonuses[k] === 1 && k !== key) {
                            bonuses[k] = 0;
                            break;
                        }
                    }
                }
                bonuses[key] = 1;
            }
        }

        updateData({ abilityBonuses: bonuses });
    };

    const getSortedScoresArray = () => {
        const scores = [];
        abilities.forEach(({ key }) => {
            const val = data.abilityScores[key];
            if (val !== "") scores.push({ key, val: Number(val) });
        });
        return scores.sort((a, b) => a.val - b.val); // lowest to highest
    };

    const handleSwapUp = (key) => {
        const sorted = getSortedScoresArray();
        const currentIndex = sorted.findIndex(s => s.key === key);
        if (currentIndex < 0 || currentIndex === sorted.length - 1) return;

        // Find the next strictly greater value
        const currentVal = sorted[currentIndex].val;
        let nextIndex = currentIndex + 1;
        while (nextIndex < sorted.length && sorted[nextIndex].val === currentVal) {
            nextIndex++;
        }

        if (nextIndex >= sorted.length) return; // No strictly greater value

        const nextHighest = sorted[nextIndex];

        updateData({
            abilityScores: {
                ...data.abilityScores,
                [key]: nextHighest.val,
                [nextHighest.key]: currentVal
            }
        });
    };

    const handleSwapDown = (key) => {
        const sorted = getSortedScoresArray();
        const currentIndex = sorted.findIndex(s => s.key === key);
        if (currentIndex <= 0) return;

        // Find the next strictly lesser value
        const currentVal = sorted[currentIndex].val;
        let nextIndex = currentIndex - 1;
        while (nextIndex >= 0 && sorted[nextIndex].val === currentVal) {
            nextIndex--;
        }

        if (nextIndex < 0) return; // No strictly lesser value

        const nextLowest = sorted[nextIndex];

        updateData({
            abilityScores: {
                ...data.abilityScores,
                [key]: nextLowest.val,
                [nextLowest.key]: currentVal
            }
        });
    };

    const calculateModifier = (totalScore) => {
        if (totalScore === "" || isNaN(totalScore)) return "+0";
        const mod = Math.floor((totalScore - 10) / 2);
        return mod >= 0 ? `+${mod}` : mod;
    };

    // Calculate disabled arrows
    const sortedScores = getSortedScoresArray();
    let highestVal = -Infinity;
    let lowestVal = Infinity;
    if (sortedScores.length > 0) {
        lowestVal = sortedScores[0].val;
        highestVal = sortedScores[sortedScores.length - 1].val;
    }

    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)]">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 m-0">
                    Ability Scores
                </h2>

                <button
                    onClick={generateRandomScores}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded font-bold transition-all shadow-md flex items-center gap-2
                        ${isGenerating ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isGenerating ? 'animate-spin' : ''}>
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.28l5.67-5.67" />
                    </svg>
                    {isGenerating ? 'Randomizing...' : 'Roll 4d6 (Drop Lowest)'}
                </button>
            </div>

            <div className="bg-emerald-900/20 p-4 border border-emerald-800/50 rounded mb-8">
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    Monsters of the Multiverse Rules
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                    Tabaxi Ability Score Increases are flexible! Use the <span className="font-bold text-brand-400">+1</span> and <span className="font-bold text-brand-400">+2</span> buttons to assign them. You can choose: <br />
                    <span className="font-semibold text-emerald-300">• +2 to one score and +1 to a different score</span>, OR <br />
                    <span className="font-semibold text-emerald-300">• +1 to three different scores</span>.<br />
                </p>
            </div>

            {data.class && CLASSES[data.class] && (
                <div className={`bg-[var(--color-dark-card)] p-4 border-l-4 rounded mb-8 shadow-md transition-all ${flashGuidance ? 'border-brand-500 animate-flash-3x' : 'border-gray-700'}`}>
                    <h3 className="text-brand-300 font-bold mb-1 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        {data.class} Optimization Strategy
                    </h3>
                    <p className="text-sm text-gray-300 italic">
                        {CLASSES[data.class].abilityAdvice}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {abilities.map(({ key, label }) => {
                    const baseScore = data.abilityScores && data.abilityScores[key] !== undefined ? data.abilityScores[key] : "";
                    const bonus = (data.abilityBonuses && data.abilityBonuses[key]) || 0;
                    const totalScore = baseScore !== "" ? Number(baseScore) + bonus : "";

                    const isBlank = baseScore === "";
                    const isHighest = !isBlank && Number(baseScore) === highestVal;
                    const isLowest = !isBlank && Number(baseScore) === lowestVal;

                    const isPrimary = data.class && CLASSES[data.class]?.primaryAbilities?.includes(key);
                    const cardBorder = (isPrimary && flashGuidance) ? 'animate-flash-3x' : 'border-gray-700 hover:border-brand-500';
                    const textClass = (isPrimary && flashGuidance) ? 'animate-flash-text-3x' : 'text-gray-400';

                    return (
                        <div key={key} className={`bg-[var(--color-dark-card)] p-4 pt-6 rounded-lg border flex items-center justify-between relative overflow-hidden group transition-colors ${cardBorder}`}>
                            {/* Hexagon shape background hint */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 text-gray-400 pointer-events-none scale-150 group-hover:text-brand-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            </div>

                            <label className={`absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase z-10 ${textClass}`}>
                                {label}
                            </label>

                            {/* Left Side: Bonus Buttons */}
                            <div className="flex flex-col gap-1 z-10 mt-2">
                                <button
                                    onClick={() => toggleBonus(key, 2)}
                                    className={`w-8 h-8 rounded text-sm font-bold border transition-colors ${bonus === 2 ? 'bg-brand-500 border-brand-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-brand-500 hover:text-brand-400'}`}
                                >
                                    +2
                                </button>
                                <button
                                    onClick={() => toggleBonus(key, 1)}
                                    className={`w-8 h-8 rounded text-sm font-bold border transition-colors ${bonus === 1 ? 'bg-brand-500 border-brand-400 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-brand-500 hover:text-brand-400'}`}
                                >
                                    +1
                                </button>
                            </div>

                            {/* Center: The Score Input */}
                            <div className="flex flex-col items-center z-10">
                                <input
                                    type="number"
                                    value={totalScore}
                                    onChange={(e) => handleScoreChange(key, e.target.value)}
                                    placeholder="-"
                                    className={`w-20 text-center bg-gray-900/80 border-2 rounded-lg text-4xl font-bold py-2 focus:outline-none focus:border-brand-500 transition-colors placeholder:text-gray-700
                                        ${bonus > 0 && totalScore !== "" ? 'text-brand-400 border-brand-900/50' : 'text-white border-emerald-900/50'}`}
                                />
                                <div className="mt-2 px-4 py-1 bg-emerald-900/40 rounded-full border border-emerald-500/30 text-emerald-300 font-mono font-bold text-sm">
                                    {calculateModifier(totalScore)}
                                </div>
                            </div>

                            {/* Right Side: Swapping Arrows */}
                            <div className="flex flex-col gap-1 z-10 mt-2">
                                <button
                                    onClick={() => handleSwapUp(key)}
                                    // Disable if blank, or if this score is equal to the absolute highest score
                                    disabled={isBlank || Number(baseScore) === highestVal}
                                    className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-400 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 hover:text-white transition-colors"
                                    title="Swap with next highest score"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                                </button>
                                <button
                                    onClick={() => handleSwapDown(key)}
                                    // Disable if blank, or if this score is equal to the absolute lowest score
                                    disabled={isBlank || Number(baseScore) === lowestVal}
                                    className="w-8 h-8 rounded bg-gray-800 border border-gray-600 text-gray-400 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 hover:text-white transition-colors"
                                    title="Swap with next lowest score"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AbilityScoreImpact data={data} />
        </div>
    );
}
