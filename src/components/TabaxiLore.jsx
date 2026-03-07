import React from 'react';

export default function TabaxiLore({ data, updateData }) {
    return (
        <div className="space-y-6 animate-fade-in text-[var(--color-brand-100)]">
            <div className="text-center mb-10">
                <h2 className="text-4xl mb-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                    The Tabaxi
                </h2>
                <p className="text-lg opacity-80 max-w-2xl mx-auto">
                    Hailing from a strange and distant land, wandering tabaxi are catlike humanoids driven by curiosity to collect interesting artifacts, gather tales and stories, and lay eyes on all the world's wonders.
                </p>
            </div>

            <div className="mb-8 w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-gray-700/50 shadow-lg shadow-black/20">
                <img
                    src="/assets/tabaxi1.png"
                    alt="Tabaxi Adventurer"
                    className="w-full h-48 md:h-64 object-cover object-top opacity-90 transition-opacity duration-300 hover:opacity-100"
                />
            </div>

            <div className="bg-[var(--color-dark-bg)] p-6 rounded-lg border border-gray-700/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                <h3 className="text-xl font-bold mb-4 text-emerald-300">Basic Info</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Character Name</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => updateData({ name: e.target.value })}
                            placeholder="e.g. Cloud on the Mountaintop (Cloud)"
                            className="w-full bg-gray-800/50 border border-gray-600 rounded px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tabaxi Size (MotM Variant)</label>
                        <div className="flex gap-4">
                            {['Medium', 'Small'].map((size) => (
                                <label key={size} className="flex flex-1 items-center gap-2 cursor-pointer p-3 rounded border border-gray-600 hover:border-gray-500 transition-colors bg-gray-800/20">
                                    <input
                                        type="radio"
                                        name="size"
                                        value={size}
                                        checked={data.size === size}
                                        onChange={(e) => updateData({ size: e.target.value })}
                                        className="text-brand-500 bg-gray-900 border-gray-600 focus:ring-brand-500"
                                    />
                                    <span>{size}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">*Medium is generally preferred to avoid being grappled by smaller creatures.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 border border-emerald-900/50 rounded bg-emerald-900/10">
                    <h4 className="font-bold text-emerald-400 mb-2">Feline Agility</h4>
                    <p className="text-sm opacity-80">When you move on your turn in combat, you can double your speed until the end of that turn. Recharges when you move 0 feet on a turn.</p>
                </div>
                <div className="p-4 border border-emerald-900/50 rounded bg-emerald-900/10">
                    <h4 className="font-bold text-emerald-400 mb-2">Cat's Claws</h4>
                    <p className="text-sm opacity-80">You have a climbing speed of 30 ft. Your claws deal 1d6 + STR slashing damage on an unarmed strike.</p>
                </div>
            </div>
        </div>
    );
}
