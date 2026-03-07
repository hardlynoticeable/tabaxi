export const SKILLS = {
    Acrobatics: 'dex',
    'Animal Handling': 'wis',
    Arcana: 'int',
    Athletics: 'str',
    Deception: 'cha',
    History: 'int',
    Insight: 'wis',
    Intimidation: 'cha',
    Investigation: 'int',
    Medicine: 'wis',
    Nature: 'int',
    Perception: 'wis',
    Performance: 'cha',
    Persuasion: 'cha',
    Religion: 'int',
    'Sleight of Hand': 'dex',
    Stealth: 'dex',
    Survival: 'wis'
};

export const CLASSES = {
    Artificer: {
        hitDie: 8,
        saves: ['int', 'con'],
        primaryAbilities: ['int', 'con'],
        abilityAdvice: "Intelligence powers your spells and magical inventions, while Constitution keeps you alive in combat.",
        skillChoices: 2,
        skillOptions: ['Arcana', 'History', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Sleight of Hand'],
        armorProficiencies: ['Light', 'Medium', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged'],
        toolProficiencies: ["Thieves' tools", "Tinker's tools", "One type of artisan's tools"],
        spellcasting: {
            ability: 'int',
            type: 'prepared',
            progression: 'artificer',
            cantripsKnown: [2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4]
        }
    },
    Barbarian: {
        hitDie: 12,
        saves: ['str', 'con'],
        primaryAbilities: ['str', 'con'],
        abilityAdvice: "Strength powers your massive melee attacks, and Constitution boosts your hit points and fuels your Unarmored Defense.",
        skillChoices: 2,
        skillOptions: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
        armorProficiencies: ['Light', 'Medium', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged']
    },
    Bard: {
        hitDie: 8,
        saves: ['dex', 'cha'],
        primaryAbilities: ['cha', 'dex'],
        abilityAdvice: "Charisma determines your spellcasting power, while Dexterity protects you in light armor and powers finesse weapons.",
        skillChoices: 3,
        skillOptions: Object.keys(SKILLS), // Any 3 skills
        armorProficiencies: ['Light'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword'],
        spellcasting: {
            ability: 'cha',
            type: 'known',
            progression: 'full',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
        }
    },
    Cleric: {
        hitDie: 8,
        saves: ['wis', 'cha'],
        primaryAbilities: ['wis', 'str', 'con'],
        abilityAdvice: "Wisdom dictates how potent your divine spells are. Depending on your domain, emphasize Strength for melee combat or Constitution for survivability.",
        skillChoices: 2,
        skillOptions: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
        armorProficiencies: ['Light', 'Medium', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged'],
        spellcasting: {
            ability: 'wis',
            type: 'prepared',
            progression: 'full',
            cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        }
    },
    Druid: {
        hitDie: 8,
        saves: ['int', 'wis'],
        primaryAbilities: ['wis', 'con'],
        abilityAdvice: "Wisdom powers your connection to nature's magic. Constitution ensures you can take a hit, especially when Wild Shaped.",
        skillChoices: 2,
        skillOptions: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
        armorProficiencies: ['Light', 'Medium', 'Shield'], // Note: Non-metal omitted for simplicity
        weaponProficiencies: ['Club', 'Dagger', 'Dart', 'Javelin', 'Mace', 'Quarterstaff', 'Scimitar', 'Sickle', 'Sling', 'Spear'],
        spellcasting: {
            ability: 'wis',
            type: 'prepared',
            progression: 'full',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
        }
    },
    Fighter: {
        hitDie: 10,
        saves: ['str', 'con'],
        primaryAbilities: ['str', 'dex', 'con'],
        abilityAdvice: "Prioritize Strength for heavy weapons or Dexterity for archery and finesse combat. Constitution is vital for front-line survivability.",
        skillChoices: 2,
        skillOptions: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
        armorProficiencies: ['Light', 'Medium', 'Heavy', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged']
    },
    Monk: {
        hitDie: 8,
        saves: ['str', 'dex'],
        primaryAbilities: ['dex', 'wis'],
        abilityAdvice: "Dexterity fuels your martial arts and evasiveness, while Wisdom empowers your Ki abilities and adds to your Unarmored Defense.",
        skillChoices: 2,
        skillOptions: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
        armorProficiencies: [],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Shortsword']
    },
    Paladin: {
        hitDie: 10,
        saves: ['wis', 'cha'],
        primaryAbilities: ['str', 'cha'],
        abilityAdvice: "Strength lets you hit hard and wear heavy armor. Charisma commands your divine magic, auras, and saving throws.",
        skillChoices: 2,
        skillOptions: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
        armorProficiencies: ['Light', 'Medium', 'Heavy', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
        spellcasting: {
            ability: 'cha',
            type: 'prepared',
            progression: 'half',
            cantripsKnown: Array(20).fill(0)
        }
    },
    Ranger: {
        hitDie: 10,
        saves: ['str', 'dex'],
        primaryAbilities: ['dex', 'wis'],
        abilityAdvice: "Dexterity powers your archery, finesse weapons, and stealth. Wisdom attunes you to the wild and powers your spellcasting.",
        skillChoices: 3,
        skillOptions: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
        armorProficiencies: ['Light', 'Medium', 'Shield'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Martial Melee', 'Martial Ranged'],
        spellcasting: {
            ability: 'wis',
            type: 'known',
            progression: 'half',
            cantripsKnown: Array(20).fill(0),
            spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
        }
    },
    Rogue: {
        hitDie: 8,
        saves: ['dex', 'int'],
        primaryAbilities: ['dex', 'int', 'cha'],
        abilityAdvice: "Dexterity is the golden rule for stealth and Sneak Attack. Beyond that, boost Intelligence if you are an Arcane Trickster/Investigator, or Charisma if you want to be a charming Swashbuckler.",
        skillChoices: 4,
        skillOptions: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
        armorProficiencies: ['Light'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword']
    },
    Sorcerer: {
        hitDie: 6,
        saves: ['con', 'cha'],
        primaryAbilities: ['cha', 'con'],
        abilityAdvice: "Charisma dictates your innate magical potential. Constitution is vital for maintaining Concentration on spells and buffering your small d6 hit points.",
        skillChoices: 2,
        skillOptions: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
        armorProficiencies: [],
        weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
        spellcasting: {
            ability: 'cha',
            type: 'known',
            progression: 'full',
            cantripsKnown: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
            spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
        }
    },
    Warlock: {
        hitDie: 8,
        saves: ['wis', 'cha'],
        primaryAbilities: ['cha', 'con'],
        abilityAdvice: "Charisma powers your Eldritch Blasts and Pact Magic. Constitution helps you maintain concentration and survive close calls.",
        skillChoices: 2,
        skillOptions: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
        armorProficiencies: ['Light'],
        weaponProficiencies: ['Simple Melee', 'Simple Ranged'],
        spellcasting: {
            ability: 'cha',
            type: 'known',
            progression: 'warlock',
            cantripsKnown: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
        }
    },
    Wizard: {
        hitDie: 6,
        saves: ['int', 'wis'],
        primaryAbilities: ['int', 'con', 'dex'],
        abilityAdvice: "Intelligence is everything: it dictates how many spells you can prepare and how hard they hit. Use your remaining points on Dexterity (for Armor Class) and Constitution (for Concentration and HP).",
        skillChoices: 2,
        skillOptions: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
        armorProficiencies: [],
        weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
        spellcasting: {
            ability: 'int',
            type: 'prepared',
            progression: 'full',
            cantripsKnown: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
        }
    }
};

export const SUBCLASSES = {
    Artificer: {
        'Alchemist': {
            description: 'An expert at combining reagents to produce magical effects, healing draughts, and toxic fumes.',
            level3: 'Tool Proficiency: Alchemist\'s supplies\nAlchemist Spells: Healing Word, Ray of Sickness\nExperimental Elixir: Create magical elixirs when you finish a long rest or by expending spell slots.',
            level5: 'Alchemical Savant: Add your Intelligence modifier to rolls that heal or deal acid, fire, necrotic, or poison damage when casting through alchemist\'s supplies.'
        },
        'Armorer': {
            description: 'Your magic functions like technology, bonding with heavy armor to refine it into a magical second skin.',
            level3: 'Tool Proficiency: Smith\'s tools\nArmorer Spells: Magic Missile, Thunderwave\nArcane Armor: Turn armor into magical power armor\nArmor Model:\n[ ] Guardian (Thunder Gauntlets)\n[ ] Infiltrator (Lightning Launcher)',
            level5: 'Extra Attack: Attack twice when you take the Attack action on your turn.'
        },
        'Artillerist': {
            description: 'A master of magical artillery, hurling energy across the battlefield and commanding eldritch cannons.',
            level3: 'Tool Proficiency: Woodcarver\'s tools\nArtillerist Spells: Shield, Thunderwave\nEldritch Cannon: Create a small or tiny magical cannon (Flamethrower, Force Ballista, or Protector).',
            level5: 'Arcane Firearm: Turn a wand, staff, or rod into a firearm, adding 1d8 to its damage rolls.'
        },
        'Battle Smith': {
            description: 'A protector and medic who fights on the front lines alongside a mechanical companion.',
            level3: 'Tool Proficiency: Smith\'s tools\nBattle Smith Spells: Heroism, Shield\nBattle Ready: Use Intelligence for magic weapon attacks\nSteel Defender: Create a mechanical companion that fights alongside you.',
            level5: 'Extra Attack: Attack twice when you take the Attack action on your turn.'
        }
    }
};

export const BACKGROUNDS = {
    Acolyte: ['Insight', 'Religion'],
    Charlatan: ['Deception', 'Sleight of Hand'],
    Criminal: ['Deception', 'Stealth'],
    Entertainer: ['Acrobatics', 'Performance'],
    'Folk Hero': ['Animal Handling', 'Survival'],
    'Guild Artisan': ['Insight', 'Persuasion'],
    Hermit: ['Medicine', 'Religion'],
    Noble: ['History', 'Persuasion'],
    Outlander: ['Athletics', 'Survival'],
    Sage: ['Arcana', 'History'],
    Sailor: ['Athletics', 'Perception'],
    Soldier: ['Athletics', 'Intimidation'],
    Urchin: ['Sleight of Hand', 'Stealth']
};

export const LANGUAGES = [
    'Abyssal',
    'Celestial',
    'Draconic',
    'Deep Speech',
    'Dwarvish',
    'Elvish',
    'Giant',
    'Gnomish',
    'Goblin',
    'Halfling',
    'Infernal',
    'Orc',
    'Primordial',
    'Sylvan',
    'Undercommon'
];
