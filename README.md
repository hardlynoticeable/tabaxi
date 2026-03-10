# Tabaxi Character Generator

A comprehensive, automated character construction tool for Dungeons & Dragons 5th Edition. This application streamlines the journey from concept to a professional, ready-to-play character sheet.

## Core Technical Achievements

### Dynamic Stat Calculation Engine
The application features a robust backend logic system that automates the complex mechanics of D&D 5e:
- **Automated Modifiers**: Real-time calculation of all ability modifiers, proficiency bonuses, and secondary statistics.
- **Dynamic Defense (AC)**: Sophisticated Armor Class calculation that accounts for equipped armor, shields, and class-specific bonuses (like Draconic Resilience).
- **Automated Scaling**: Scaling features for HP, Hit Dice, and Save DCs based on character level and core stats.
- **Skill & Save Tracking**: Automatically applies proficiency and ability bonuses to all 18 skills and 6 saving throws.

### Comprehensive Class & Subclass Architecture
Designed to handle the mechanical diversity of the 5e system:
- **Broad Support**: Full implementation of various classes including Cleric Domains, Paladin Oaths, Druid Circles, and Sorcerous Origins.
- **Automatic Feature Unlocking**: Dynamically reveals and applies class and subclass features as the character levels up.
- **Integrated Backgrounds**: Seamlessly merges background-specific skills and equipment into the character's profile.

### Massive Spellcasting System
A power-user interface for magic-inclined characters:
- **1,000+ Spell Database**: A comprehensive library of spells including full descriptions for both SRD and expanded content.
- **Level-Indexed Slot Management**: Automatically calculates available spell slots per level based on class progression.
- **Automated Combat Stats**: Instantly computes Spell Save DC and Spell Attack Bonus based on the character's primary casting ability.

### Advanced Inventory & Equipment
- **5,000+ Item Library**: An extensive database of weapons, armor, and adventuring gear.
- **Smart Slot Enforcement**: Intelligent equipment system that manages slots (Head, Neck, Rings, etc.) and enforces attunement limits (with dynamic support for Artificer bonuses).
- **Weapon Arsenal**: Tracks up to 3 active weapons with pre-calculated attack and damage rolls.

### Pro-Grade WOTC PDF Generation
The final output is not just a summary, but a professionally form-filled Standard D&D 5e Character Sheet (WOTC):
- **Perfect Mapping**: Physical traits, equipment lists, trait summaries, and currency are all automatically mapped to their official locations.
- **Optimized Layout**: Long text fields (like Backstory and Traits) use dynamic font-sizing to ensure maximum readability within the standard PDF boxes.

## Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Vanilla CSS (Premium Dark Theme)
- **Icons**: Lucide React
- **PDF Logic**: pdf-lib
- **State Management**: React Hooks (useState, useEffect, useMemo)

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
This project is intended for personal use and is compatible with the D&D 5e System Reference Document (SRD).
