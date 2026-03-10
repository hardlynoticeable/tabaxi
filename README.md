# Tabaxi Character Generator

A comprehensive, high-fidelity character construction tool for Dungeons & Dragons 5th Edition, meticulously tailored for the Tabaxi race. This application streamlines the journey from concept to a professional, table-ready PDF character sheet.

**Try it out:** [tabaxi.vonipo.com](https://tabaxi.vonipo.com)

## Key Features

### Progressive Web App (PWA)
Installable on desktop and mobile for a premium, app-like experience. Features full offline support via service workers, ensuring your character data is always accessible even without an internet connection.

### Mechanical Breakdown & Transparency
No more "black box" numbers. The generator features a dedicated **Calculation Breakdown** UI that provides full visibility into character mechanics:
- **AC Math**: Visual step-by-step breakdown of Base Armor + DEX + Shield + Special Bonuses (Unarmored Defense, Draconic Resilience, etc.).
- **HP Scaling**: Transparent tracking of Base HP + Level Up Scaling + Constitution bonuses.
- **Stat Derivation**: Detailed components for Initiative and Passive Perception (Base + Mod + Proficiency).

### Centralized Logic Architecture
Built on a "Single Source of Truth" philosophy. All mechanical calculations are handled by a centralized `stats.js` engine, ensuring perfect data parity between:
- The Interactive UI
- The Review Summary
- The Final Form-Filled PDF

### High-Utility Inventory Management
- **Modal-Driven Database**: Access 5,000+ items (Weapons, Armor, Gear) through a streamlined, searchable modal interface.
- **Starting Pack Support**: One-click selection of official class starter packs (Explorer's, Dungeoneer's, etc.) with automated inventory population.
- **Live Previews**: Dynamic previews of Attack/Damage and AC potential directly within the backpack, before you even equip the item.
- **Attunement Tracking**: Intelligent slot enforcement with built-in attunement limits and slots (Head, Neck, Rings, etc.).

### Advanced Spellcasting System
- **1,000+ Spell Library**: Comprehensive database including full descriptions for SRD and expanded content via interactive modals.
- **Subclass Integration**: Automatically detects and adds subclass-granted spells (e.g., Sorcerous Bloodline or Cleric Domain spells).
- **Automated Calculations**: Instant computation of Spell Save DC, Spell Attack Bonus, and level-indexed slot availability.

### Pro-Grade PDF Generation
Generates an expertly form-filled **Standard WOTC D&D 5e Character Sheet**:
- **Smart Typography**: Dynamic font-scaling for complex fields like Backstory and Features to ensure maximum readability.
- **Automated Mapping**: All identity traits, equipment lists, and currency are mapped to their official sheet locations.
- **Inventory Sync**: Includes starting pack contents and equipped status directly on the sheet.

## Technology Stack

- **Core**: React.js with Vite
- **Styling**: Vanilla CSS (Premium Dark/Glassmorphism Theme)
- **Icons**: Lucide React
- **PDF Engine**: pdf-lib
- **Logic**: Centralized JS Computation Engine (`stats.js`)

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
1. Clone the repository: `git clone https://github.com/hardlynoticeable/tabaxi.git`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Access the generator at `http://localhost:5173`.

## License
This project is intended for personal use and is compatible with the D&D 5th Edition System Reference Document (SRD).
