import React from 'react';
import { SUBCLASSES } from '../data/rules5e';

export default function SubclassSelector({ data, updateData }) {
    const charClass = data.class;
    const subclasses = SUBCLASSES[charClass] || {};

    const handleSelect = (subclassName) => {
        updateData({ subclass: subclassName });
    };

    if (Object.keys(subclasses).length === 0) {
        return (
            <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)] h-full flex flex-col items-center justify-center">
                <h2 className="text-3xl mb-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                    Subclass (Specialization)
                </h2>
                <p className="text-gray-400 text-center max-w-lg">
                    This wizard currently only supports subclasses for the Artificer class. You have selected {charClass}, so no further subclass selection is required at this step.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)] h-full overflow-y-auto pr-2 pb-6 custom-scrollbar">
            <h2 className="text-3xl mb-6 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Choose Your {charClass === 'Artificer' ? 'Specialist' : 'Subclass'}
            </h2>
            <p className="text-gray-300 mb-6">
                Specializations grant potent new abilities, tool proficiencies, and spells at 3rd level and beyond.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                {Object.entries(subclasses).map(([name, details]) => (
                    <div
                        key={name}
                        onClick={() => handleSelect(name)}
                        className={`p-6 rounded-lg cursor-pointer border-2 transition-all duration-300 ${data.subclass === name
                            ? 'bg-emerald-900/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02]'
                            : 'bg-[var(--color-dark-card)] border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800'
                            }`}
                    >
                        <h3 className="text-xl font-bold text-emerald-400 mb-2">{name}</h3>
                        <p className="text-sm text-gray-300 italic mb-4">{details.description}</p>

                        <div className="space-y-2 mt-4 pt-4 border-t border-gray-700/50">
                            {details.level3 && (
                                <div className="text-xs text-gray-400">
                                    <span className="font-bold text-brand-500 block">Level 3 Features:</span>
                                    <span className="whitespace-pre-line">{details.level3}</span>
                                </div>
                            )}
                            {details.level5 && data.level >= 5 && (
                                <div className="text-xs text-gray-400 mt-2">
                                    <span className="font-bold text-brand-500 block">Level 5 Features:</span>
                                    <span className="whitespace-pre-line">{details.level5}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
