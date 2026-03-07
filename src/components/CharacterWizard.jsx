import React, { useState, useEffect } from 'react';
import { saveCharacter, loadCharacter } from '../utils/storage';
import TabaxiLore from './TabaxiLore';
import CoreStats from './CoreStats';
import AbilityScores from './AbilityScores';
import SubclassSelector from './SubclassSelector';
import Equipment from './Equipment';
import Spells from './Spells';
import Review from './Review';
import { CLASSES, SUBCLASSES } from '../data/rules5e';

export default function CharacterWizard() {
    const [step, setStep] = useState(1);
    const [characterData, setCharacterData] = useState({
        name: '',
        class: '',
        subclass: '',
        background: '',
        alignment: '',
        level: 1,
        size: 'Medium', // MotM choice
        abilityScores: { str: '', dex: '', con: '', int: '', wis: '', cha: '' },
        abilityBonuses: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
        tabaxiSkills: ['Perception', 'Stealth'],
        selectedClassSkills: [],
        backgroundSkills: [],
        selectedCantrips: [],
        selectedSpells: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] },
        equippedArmor: 'None',
        equippedShield: false,
        equippedWeapons: ['', '', ''],
        inventory: ''
    });

    useEffect(() => {
        const saved = loadCharacter();
        if (saved) {
            setCharacterData(saved);
        }
    }, []);

    const hasSpells = Boolean(characterData.class && CLASSES[characterData.class]?.spellcasting);
    const hasSubclass = Boolean(characterData.class && SUBCLASSES[characterData.class]);

    // Build conditional steps array dynamically
    const stepsConfig = [
        { id: 1, label: 'Lore', canEnter: true },
        { id: 2, label: 'Stats', canEnter: true },
        { id: 3, label: 'Abilities', canEnter: !!characterData.class }
    ];

    let currentId = 4;
    if (hasSubclass) {
        stepsConfig.push({ id: currentId++, label: 'Subclass', canEnter: !!characterData.class });
    }
    if (hasSpells) {
        stepsConfig.push({ id: currentId++, label: 'Spells', canEnter: !!characterData.class });
    }

    // Always append Gear and Review
    const gearStepId = currentId++;
    const reviewStepId = currentId;

    stepsConfig.push({ id: gearStepId, label: 'Gear', canEnter: !!characterData.class });
    stepsConfig.push({ id: reviewStepId, label: 'Review', canEnter: !!characterData.class });

    const maxSteps = stepsConfig.length;

    useEffect(() => {
        if (step > maxSteps) setStep(maxSteps);
    }, [maxSteps, step]);

    const nextStep = () => setStep(s => Math.min(s + 1, maxSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const updateData = (newData) => {
        const merged = { ...characterData, ...newData };
        setCharacterData(merged);
        saveCharacter(merged);
    };

    const handleTabClick = (targetStepId) => {
        const targetStep = stepsConfig.find(s => s.id === targetStepId);
        if (targetStep && targetStep.canEnter) {
            setStep(targetStepId);
        }
    };

    return (
        <div className="glass-card w-full max-w-4xl mx-auto p-8 shadow-2xl relative overflow-hidden">
            {/* Step Indicator */}
            <div className="flex justify-between items-center mb-8 relative z-10 gap-2">
                {stepsConfig.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleTabClick(s.id)}
                        disabled={!s.canEnter}
                        className={`flex-1 text-center border-b-2 pb-4 transition-all duration-300 focus:outline-none 
                            ${step === s.id ? 'border-brand-500 text-brand-500 font-bold scale-105'
                                : s.canEnter ? 'border-gray-600 text-gray-400 hover:text-brand-300 hover:border-brand-300 cursor-pointer'
                                    : 'border-gray-800 text-gray-700 cursor-not-allowed'}`}
                    >
                        <span className="text-sm tracking-wider uppercase">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="min-h-[400px] relative z-10">
                {step === 1 && <TabaxiLore data={characterData} updateData={updateData} />}
                {step === 2 && <CoreStats data={characterData} updateData={updateData} />}
                {step === 3 && <AbilityScores data={characterData} updateData={updateData} />}
                {hasSubclass && step === stepsConfig.find(s => s.label === 'Subclass')?.id && <SubclassSelector data={characterData} updateData={updateData} />}
                {hasSpells && step === stepsConfig.find(s => s.label === 'Spells')?.id && <Spells data={characterData} updateData={updateData} />}
                {step === gearStepId && <Equipment data={characterData} updateData={updateData} />}
                {step === reviewStepId && <Review data={characterData} updateData={updateData} />}
            </div>

            <div className="flex justify-between mt-8 relative z-10 pt-4 border-t border-dark-border">
                <button
                    onClick={prevStep}
                    disabled={step === 1}
                    className="px-6 py-2 rounded border border-gray-600 hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                    Back
                </button>
                {step < maxSteps && (
                    <button
                        onClick={nextStep}
                        className="px-6 py-2 rounded bg-brand-500 text-black font-bold hover:bg-brand-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    >
                        Next Step
                    </button>
                )}
            </div>
        </div>
    );
}
