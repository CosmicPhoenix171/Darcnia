export const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return hash.toString(36);
};

export const characterDatabase = {
    'nyra vex': {
        name: 'Nyra Vex',
        password: simpleHash('rogue123'),
        race: 'Human',
        class: 'Rogue',
        level: 1,
        guild: 'Guild Crystalia',
        relationships: ['Eldon Thorne', 'Tessa Windfern'],
        knownLocations: ['Guild Crystalia Hall', 'Heart Plaza', 'Hearthstone Inn'],
        knownGuilds: ['Guild Crystalia', 'The Crimson Vanguard', "Merchants' Concord", 'City Watch'],
        completedQuests: ['Missing Cat'],
        activeQuests: ['Shadows in the Basement'],
        knownSecrets: [],
        accessLevel: 'player',
        discoveredHandouts: ['Tavern Rumors', 'Guild Job Board', 'Thug Note'],
        bank: { gold: 0, silver: 0, copper: 0 }
    },
    'dm': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'),
        accessLevel: 'dm',
        level: 20,
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all'
    },
    'dungeon master': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'),
        accessLevel: 'dm',
        level: 20,
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all'
    }
};
