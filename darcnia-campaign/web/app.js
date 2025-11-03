// ===== Configuration =====
const CONFIG = {
    campaignPath: '../', // Path to campaign files
    playerAccessible: {
        // Define what players can access (DM sections excluded)
        guilds: true,
        npcs: ['eldonthorne', 'tessawindfern'], // Only specific NPCs (not Sophia secrets)
        locations: true,
        items: true,
        quests: true,
        handouts: true,
        lore: ['world', 'guilds'], // Not full dungeon.md (has DM secrets)
    }
};

// ===== Character Database =====
// Simple hash function for password verification (in production, use proper authentication)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
}

const characterDatabase = {
    'nyra vex': {
        name: 'Nyra Vex',
        password: simpleHash('rogue123'), // Default password: rogue123
        race: 'Human',
        class: 'Rogue',
        guild: 'Guild Crystalia',
        relationships: ['Eldon Thorne', 'Tessa Windfern'],
        knownLocations: ['Guild Crystalia Hall', 'Heart Plaza', 'Hearthstone Inn'],
        knownGuilds: ['Guild Crystalia', 'The Crimson Vanguard', "Merchants' Concord", 'City Watch'],
        completedQuests: ['Missing Cat'],
        activeQuests: ['Shadows in the Basement'],
        knownSecrets: [],
        accessLevel: 'player',
        discoveredHandouts: ['Tavern Rumors', 'Guild Job Board', 'Thug Note'],
        clearedDungeonLevel: 0
    },
    'dm': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'), // Default DM password: dmpass2025
        accessLevel: 'dm',
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all',
        clearedDungeonLevel: 20
    },
    'dungeon master': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'), // Default DM password: dmpass2025
        accessLevel: 'dm',
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all',
        clearedDungeonLevel: 20
    }
};

// ===== State Management =====
const state = {
    currentTab: 'overview',
    theme: 'dark',
    content: {},
    searchIndex: [],
    currentCharacter: null,
    accessLevel: 'guest',
    marketViewLevel: null
};

// ===== Data Structure =====
const contentData = {
    overview: {
        title: 'Campaign Overview',
        content: `
            <h2>Welcome to Darcnia!</h2>
            <p>You find yourselves in <strong>Solspire</strong>, the capital city built atop a mysterious dungeon. The city is home to numerous guilds, each with their own agendas and secrets.</p>
            
            <h3>Your Guild: Guild Crystalia</h3>
            <p>You are members of Guild Crystalia, one of the oldest adventuring guilds in Solspire. Though the guild has fallen on hard times with only 5 active members remaining, it holds a proud history and mysterious purpose.</p>
            
            <div class="card">
                <h3>🎲 Quick Start</h3>
                <p>Use the tabs above to navigate:</p>
                <ul>
                    <li><strong>Guilds</strong> - Learn about the 11 factions in Solspire</li>
                    <li><strong>NPCs</strong> - Meet important characters</li>
                    <li><strong>Locations</strong> - Explore key places</li>
                    <li><strong>Market</strong> - Browse shops, gear, and magic items</li>
                    <li><strong>Quests</strong> - Review available missions</li>
                    <li><strong>Handouts</strong> - Read discovered documents</li>
                    <li><strong>Lore</strong> - Uncover the world's history</li>
                </ul>
            </div>

            <div class="card">
                <h3>🔍 Pro Tip</h3>
                <p>Use the search bar to quickly find information about guilds, NPCs, locations, or items!</p>
            </div>
        `
    },
    
    guilds: [
        {
            id: 'guild-crystalia',
            name: 'Guild Crystalia',
            motto: 'Honor Through Service, Strength Through Sacrifice',
            type: 'Adventuring Guild (Your Home)',
            leader: 'Eldon Thorne',
            size: 'Tiny (5 members)',
            reputation: 'Friendly (+2)',
            description: 'Your guild. Once prestigious, now struggling with only 5 active members. Founded centuries ago with a forgotten purpose.',
            keyInfo: [
                'Oldest guild in Solspire',
                'Built above something important (purpose forgotten)',
                'Provides guild crest tattoos with magical abilities',
                'Underfunded and understaffed',
                'Your home base'
            ],
            services: [
                'Job board quests',
                'Training facilities',
                'Guild hall lodging',
                'Archives access',
                'Resurrection services (expensive)'
            ],
            location: 'Guild Hall in central Solspire'
        },
        {
            id: 'crimson-vanguard',
            name: 'The Crimson Vanguard',
            motto: 'Strength Speaks Louder Than Tradition',
            type: 'Elite Combat Guild',
            leader: 'Commander Thalia Ironbrand (Half-Orc)',
            size: 'Medium (60-80 members)',
            reputation: 'Neutral (0)',
            description: 'Elite combat guild that rivals Guild Crystalia. Military discipline and superior training. Aggressive competitors.',
            keyInfo: [
                'Most respected combat guild',
                'Stealing contracts from Crystalia',
                'Rigorous military training',
                'Trying to replace Crystalia as "primary" guild',
                'Pride in martial prowess'
            ],
            services: [
                'Combat training',
                'Equipment rental',
                'Contract board',
                'Mercenary hiring'
            ],
            location: 'The Crimson Bastion (fortified compound)'
        },
        {
            id: 'stormcallers-covenant',
            name: "The Stormcallers' Covenant",
            motto: 'Magic Built This World, Magic Will Save It',
            type: 'Spellcaster Guild',
            leader: 'Archmage Zephyrus Skyweaver (Air Genasi)',
            size: 'Medium (50-70 members)',
            reputation: 'Neutral (0)',
            description: 'Powerful mages specializing in storm and weather magic. Theatrical and competitive. Curious about magical secrets.',
            keyInfo: [
                'Dramatic magical displays',
                'Compete with Crimson Vanguard for prestige',
                'Investigating magical anomalies',
                'Want access to old magic secrets',
                'Storm magic specialists'
            ],
            services: [
                'Spell identification',
                'Scroll copying',
                'Magical components',
                'Arcane consultation'
            ],
            location: 'The Aetherspire (tower in upper district)'
        },
        {
            id: 'gilded-compass',
            name: 'The Gilded Compass',
            motto: 'The Map is Truth, The Territory is Mystery',
            type: 'Exploration & Cartography Guild',
            leader: 'Master Navigator Sira Moonwhisper (412-year-old Elf)',
            size: 'Small (30-40 members)',
            reputation: 'Neutral (0)',
            description: 'Ancient explorers and cartographers. Have the most complete maps of the dungeon beneath the city. Non-combatants.',
            keyInfo: [
                'Most complete dungeon maps',
                '412-year-old elf leader',
                'Non-violent approach',
                'Share information freely',
                'Maps constantly stolen by Shadowweave'
            ],
            services: [
                'Map sales',
                'Navigation consultation',
                'Scout guides',
                'Compass calibration'
            ],
            location: 'The Chart House (converted warehouse)'
        },
        {
            id: 'hearthkeepers',
            name: 'The Hearthkeepers',
            motto: 'Every Hero Needs a Warm Bed and Hot Meal',
            type: 'Hospitality Guild',
            leader: 'Grandmother Elara Warmstone (102-year-old Halfling)',
            size: 'Medium (70-90 members)',
            reputation: 'Friendly (+1)',
            description: 'Innkeepers and tavern owners. Best information network in the city. Everyone passes through their establishments.',
            keyInfo: [
                'Best gossip network',
                'Neutral ground for all factions',
                'Beloved by common folk',
                'Run all major inns and taverns',
                'Hear everything eventually'
            ],
            services: [
                'Food and lodging',
                'Message delivery',
                'Tavern rumors',
                'Meeting spaces'
            ],
            location: 'The Hearthstone Inn (headquarters)'
        },
        {
            id: 'iron-covenant',
            name: 'The Iron Covenant',
            motto: 'A Well-Made Tool Needs No Magic',
            type: 'Crafters Guild',
            leader: 'High Smith Durgan Forgeheart (245-year-old Dwarf)',
            size: 'Large (100-120 members)',
            reputation: 'Neutral (0)',
            description: 'Traditional non-magical crafters. Blacksmiths, armorers, leatherworkers. Fighting against magitech encroachment.',
            keyInfo: [
                'Best quality non-magical equipment',
                'Proud traditionalists',
                'Rival to Arkwright Circle',
                'Lifetime warranty on all items',
                'Dwarven-dominated'
            ],
            services: [
                'Weapons and armor',
                'Equipment repair',
                'Custom work',
                'Tool sales'
            ],
            location: 'The Crucible (forge complex)'
        },
        {
            id: 'silent-vigil',
            name: 'The Silent Vigil',
            motto: 'Life is Sacred, Death is Not the End',
            type: 'Religious Order & Healers',
            leader: 'Abbess Serene',
            size: 'Small (25-35 members)',
            reputation: 'Neutral (0)',
            description: 'Pacifist healers and priests. Respected by all. Have ancient prayers about "the guardian" (meaning unclear).',
            keyInfo: [
                'Free healing to those in need',
                'Universally respected',
                'Complete pacifists',
                'Ancient religious order',
                'Vow of silence during prayer hours'
            ],
            services: [
                'Healing',
                'Disease removal',
                'Resurrection',
                'Blessings',
                'Spiritual counsel'
            ],
            location: 'The Sanctuary (temple complex)'
        },
        {
            id: 'merchants-concord',
            name: "Merchant's Concord",
            motto: 'Good Business is Good for Everyone',
            type: 'Economic Guild',
            leader: 'Guildmaster Verin Goldweave',
            size: 'Large (200+ members)',
            reputation: 'Neutral (0)',
            description: 'Wealthy merchants controlling most trade. Economic powerhouse. Pragmatic and profit-focused.',
            keyInfo: [
                'Control trade routes',
                'Richest faction',
                'Political influence through money',
                'Business over sentiment',
                'Trying to commercialize resurrection magic'
            ],
            services: [
                'General goods (15% discount if liked)',
                'Rare item access',
                'Loans',
                'Trade information'
            ],
            location: 'The Golden Exchange (market district)'
        },
        {
            id: 'arkwright-circle',
            name: 'Arkwright Circle',
            motto: 'The Old Ways Must Evolve or Die',
            type: 'Magitech Research Guild',
            leader: 'Artificer Kellian Thross (Gnome)',
            size: 'Medium (75-100 members)',
            reputation: 'Neutral (0)',
            description: 'Magitech innovators. Combine magic and technology. Curious about old magic. Research sometimes dangerous.',
            keyInfo: [
                'Magitech specialists',
                'Rival to Iron Covenant',
                'Ethically questionable research',
                'Want to study ancient magic',
                'Innovation over caution'
            ],
            services: [
                'Magitech items',
                'Magic item identification',
                'Custom commissions',
                'Experimental gear'
            ],
            location: 'The Innovation Spire (workshop tower)'
        },
        {
            id: 'shadowweave',
            name: 'Shadowweave',
            motto: 'Information is Currency',
            type: 'Thieves Guild',
            leader: 'The Whisper (identity unknown)',
            size: 'Unknown',
            reputation: 'Neutral (0)',
            description: 'Mysterious thieves guild and information brokers. Know everyone\'s secrets. Can be hired for discrete work.',
            keyInfo: [
                'Leader identity unknown',
                'Best intelligence network',
                'Can procure anything (for a price)',
                'Secret membership',
                'Pragmatic, not evil'
            ],
            services: [
                'Information (10-1000gp)',
                'Procurement (theft)',
                'Forgery',
                'Smuggling'
            ],
            location: 'Unknown (multiple safe houses)'
        },
        {
            id: 'city-watch',
            name: 'Solspire City Watch',
            motto: 'Law Applies to Everyone',
            type: 'Law Enforcement',
            leader: 'Captain Mira Stonehelm (Dwarf)',
            size: 'Large (150+ active)',
            reputation: 'Neutral (0)',
            description: 'City guards and law enforcement. Try to stay neutral in guild politics. Stretched thin. Fair but firm.',
            keyInfo: [
                'Enforce city laws',
                'Monitor dungeon entrance',
                'Caught between guild politics',
                'Incorruptible captain',
                'Understaffed'
            ],
            services: [
                'Law enforcement',
                'Bounty hunting',
                'Crime investigation',
                'City protection'
            ],
            location: 'Watch Barracks (fortified station)'
        }
    ],

    // Market shops and inventory (player-facing, gated by [L#])
    marketShops: [
        {
            id: 'brass-buckle',
            name: 'Brass Buckle Outfitters',
            description: 'General gear and adventuring bundles for every expedition.',
            categories: [
                {
                    name: 'General Gear',
                    items: [
                        { name: 'Backpack', level: 0, price: '2 gp' },
                        { name: 'Bedroll', level: 0, price: '1 gp' },
                        { name: 'Blanket', level: 0, price: '5 sp' },
                        { name: 'Candle (1)', level: 0, price: '1 cp' },
                        { name: 'Clothes, common', level: 0, price: '5 sp' },
                        { name: 'Clothes, traveler', level: 0, price: '2 gp' },
                        { name: 'Cloak (sturdy)', level: 0, price: '1 gp' },
                        { name: 'Crowbar', level: 0, price: '2 gp' },
                        { name: 'Grappling hook', level: 0, price: '2 gp' },
                        { name: 'Hammer', level: 0, price: '1 gp' },
                        { name: "Healer’s kit (10 uses)", level: 0, price: '5 gp' },
                        { name: 'Herbalism kit', level: 1, price: '5 gp' },
                        { name: 'Lantern, bullseye', level: 1, price: '10 gp' },
                        { name: 'Lantern, hooded', level: 0, price: '5 gp' },
                        { name: 'Lamp', level: 0, price: '5 sp' },
                        { name: 'Mess kit', level: 0, price: '2 sp' },
                        { name: 'Oil, flask', level: 0, price: '1 sp' },
                        { name: 'Piton (iron spike)', level: 0, price: '5 cp' },
                        { name: 'Pouch (belt)', level: 0, price: '5 sp' },
                        { name: 'Rations (1 day)', level: 0, price: '5 sp' },
                        { name: 'Rope, hempen (50 ft)', level: 0, price: '1 gp' },
                        { name: 'Rope, silk (50 ft)', level: 1, price: '10 gp' },
                        { name: 'Sack', level: 0, price: '1 cp' },
                        { name: 'Shovel', level: 0, price: '2 gp' },
                        { name: 'Soap', level: 0, price: '2 cp' },
                        { name: 'Tent (2-person)', level: 0, price: '2 gp' },
                        { name: 'Tinderbox', level: 0, price: '5 sp' },
                        { name: 'Torch (1)', level: 0, price: '1 cp' },
                        { name: 'Waterskin', level: 0, price: '2 sp' },
                    ]
                },
                {
                    name: 'Adventuring Packs (Bundles)',
                    note: 'Contents follow standard listings; bundles are convenience pricing only.',
                    items: [
                        { name: 'Burglar’s Pack', level: 0, price: '16 gp' },
                        { name: 'Dungeoneer’s Pack', level: 0, price: '12 gp' },
                        { name: 'Explorer’s Pack', level: 0, price: '10 gp' },
                    ]
                }
            ]
        },
        {
            id: 'three-feathers',
            name: 'Three Feathers Archery',
            description: 'Arrows, bolts, quivers, and ranged sundries.',
            categories: [
                {
                    name: 'Ammo & Ranged Supplies',
                    items: [
                        { name: 'Arrows (20)', level: 0, price: '1 gp' },
                        { name: 'Crossbow bolts (20)', level: 0, price: '1 gp' },
                        { name: 'Quiver (20 arrows)', level: 0, price: '1 gp' },
                        { name: 'Case, bolt (20 bolts)', level: 0, price: '1 gp' },
                        { name: 'Bowstring, spare', level: 0, price: '1 sp' },
                        { name: 'Fletching wax', level: 0, price: '2 sp' },
                    ]
                }
            ]
        },
        {
            id: 'smiths-bench',
            name: 'Smith’s Bench',
            description: 'Quality arms and armor; specialty orders available.',
            categories: [
                {
                    name: 'Armor',
                    items: [
                        { name: 'Leather', level: 0, price: '10 gp' },
                        { name: 'Studded leather', level: 1, price: '45 gp' },
                        { name: 'Chain shirt', level: 1, price: '50 gp' },
                        { name: 'Shield', level: 0, price: '10 gp' },
                        { name: 'Hide (medium)', level: 0, price: '10 gp' },
                        { name: 'Scale mail (medium)', level: 1, price: '50 gp' },
                        { name: 'Breastplate (medium)', level: 2, price: '400 gp' },
                        { name: 'Half plate (medium)', level: 3, price: '750 gp' },
                    ]
                },
                {
                    name: 'Simple & Martial Weapons',
                    items: [
                        { name: 'Club', level: 0, price: '1 sp' },
                        { name: 'Dagger', level: 0, price: '2 gp' },
                        { name: 'Handaxe', level: 0, price: '5 gp' },
                        { name: 'Javelin', level: 0, price: '5 sp' },
                        { name: 'Light crossbow', level: 0, price: '25 gp' },
                        { name: 'Mace', level: 0, price: '5 gp' },
                        { name: 'Quarterstaff', level: 0, price: '2 sp' },
                        { name: 'Rapier', level: 0, price: '25 gp' },
                        { name: 'Shortbow', level: 0, price: '25 gp' },
                        { name: 'Shortsword', level: 0, price: '10 gp' },
                        { name: 'Spear', level: 0, price: '1 gp' },
                        { name: 'Longsword', level: 0, price: '15 gp' },
                        { name: 'Scimitar', level: 0, price: '25 gp' },
                        { name: 'Warhammer', level: 0, price: '15 gp' },
                        { name: 'Morningstar', level: 0, price: '15 gp' },
                        { name: 'Longbow', level: 1, price: '50 gp' },
                        { name: 'Heavy crossbow', level: 1, price: '50 gp' },
                        { name: 'Hand crossbow', level: 2, price: '75 gp' },
                    ]
                }
            ]
        },
        {
            id: 'rue-and-resin',
            name: 'Rue & Resin Apothecary',
            description: 'Tonics, poultices, and alchemical basics.',
            categories: [
                {
                    name: 'Tonics & Basics',
                    items: [
                        { name: 'Potion of healing', level: 1, price: '50 gp' },
                        { name: 'Antitoxin (vial)', level: 1, price: '50 gp' },
                        { name: 'Bandage roll & salve (kit)', level: 0, price: '1 gp' },
                        { name: 'Herbal poultice (minor comfort)', level: 0, price: '5 sp' },
                        { name: 'Acid (vial)', level: 1, price: '25 gp' },
                        { name: "Alchemist's fire (flask)", level: 1, price: '50 gp' },
                        { name: 'Holy water (flask)', level: 1, price: '25 gp' },
                        { name: 'Perfume (vial)', level: 0, price: '5 gp' },
                        { name: 'Basic poison (vial)', level: 2, price: '100 gp' },
                    ]
                }
            ]
        },
        {
            id: 'stables-services',
            name: 'Stables & Services',
            description: 'Food, lodging, stabling, and basic city services.',
            categories: [
                {
                    name: 'Services',
                    items: [
                        { name: 'Meal (modest)', level: 0, price: '3 sp' },
                        { name: 'Lodging, common room (per night)', level: 0, price: '5 sp' },
                        { name: 'Lodging, private modest room (per night)', level: 0, price: '1 gp' },
                        { name: 'Bath & laundry', level: 0, price: '5 sp' },
                        { name: 'Stabling (per day)', level: 0, price: '5 sp' },
                        { name: 'Messenger in-city (same day)', level: 0, price: '2 sp' },
                    ]
                }
            ]
        },
        {
            id: 'south-gate-stables',
            name: 'South Gate Stables & Wheels',
            description: 'Mounts and overland vehicles at the city’s south gate.',
            categories: [
                {
                    name: 'Mounts & Vehicles',
                    items: [
                        { name: 'Donkey/Mule', level: 0, price: '8 gp' },
                        { name: 'Pony', level: 0, price: '30 gp' },
                        { name: 'Riding horse', level: 0, price: '75 gp' },
                        { name: 'Draft horse', level: 0, price: '50 gp' },
                        { name: 'Camel', level: 1, price: '50 gp' },
                        { name: 'Cart', level: 0, price: '15 gp' },
                        { name: 'Wagon', level: 1, price: '35 gp' },
                        { name: 'Bit & bridle', level: 0, price: '2 gp' },
                        { name: 'Saddle, pack', level: 0, price: '5 gp' },
                        { name: 'Saddle, riding', level: 0, price: '10 gp' },
                        { name: 'Saddlebags', level: 0, price: '4 gp' },
                    ]
                }
            ]
        },
        {
            id: 'tinkers-nook',
            name: 'Tinker’s Nook',
            description: 'Utility tools, traps, and sneaky gadgets.',
            categories: [
                {
                    name: 'Utility & Traps',
                    items: [
                        { name: 'Ball bearings (1,000)', level: 0, price: '1 gp' },
                        { name: 'Caltrops (20)', level: 0, price: '1 gp' },
                        { name: 'Hunting trap', level: 0, price: '5 gp' },
                        { name: 'Lock', level: 0, price: '10 gp' },
                        { name: 'Manacles', level: 0, price: '2 gp' },
                        { name: 'Mirror, steel', level: 0, price: '5 gp' },
                        { name: 'Signal whistle', level: 0, price: '5 cp' },
                        { name: 'Horn, signal', level: 0, price: '3 gp' },
                        { name: 'Hourglass', level: 1, price: '25 gp' },
                        { name: 'Crowbar (reinforced)', level: 1, price: '3 gp' },
                    ]
                }
            ]
        },
        {
            id: 'scribe-and-sealery',
            name: 'Scribe & Sealery',
            description: 'Paper, ink, and sealing supplies.',
            categories: [
                {
                    name: 'Paper & Ink',
                    items: [
                        { name: 'Ink (1 oz)', level: 0, price: '10 gp' },
                        { name: 'Ink pen', level: 0, price: '2 cp' },
                        { name: 'Parchment (sheet)', level: 0, price: '1 sp' },
                        { name: 'Paper (sheet)', level: 0, price: '2 sp' },
                        { name: 'Sealing wax', level: 0, price: '5 sp' },
                        { name: 'Chalk (1 piece)', level: 0, price: '1 cp' },
                        { name: 'Case, map or scroll', level: 0, price: '1 gp' },
                        { name: 'Journal/notebook', level: 0, price: '5 sp' },
                    ]
                }
            ]
        },
        {
            id: 'guild-toolwright',
            name: 'Guild Toolwright',
            description: 'Proficiency tools and kits for specialists.',
            categories: [
                {
                    name: 'Proficiency Tools',
                    items: [
                        { name: 'Thieves’ tools', level: 0, price: '25 gp' },
                        { name: 'Disguise kit', level: 0, price: '25 gp' },
                        { name: 'Forgery kit', level: 1, price: '15 gp' },
                        { name: 'Alchemist’s supplies', level: 1, price: '50 gp' },
                        { name: 'Tinker’s tools', level: 1, price: '50 gp' },
                        { name: 'Smith’s tools', level: 0, price: '20 gp' },
                        { name: 'Poisoner’s kit', level: 2, price: '50 gp' },
                    ]
                }
            ]
        },
        {
            id: 'arcane-exchange',
            name: 'Arcane Exchange',
            description: 'Magic and rare goods. Availability gated by dungeon level.',
            categories: [
                {
                    name: 'Mystic Armory (Enchanted Weapons & Armor)',
                    items: [
                        { name: 'Weapon, +1 (choose type)', level: 3, price: '1,500 gp', rarity: 'Uncommon' },
                        { name: 'Weapon, +2 (choose type)', level: 7, price: '6,000 gp', rarity: 'Rare' },
                        { name: 'Weapon, +3 (choose type)', level: 13, price: '30,000 gp', rarity: 'Very Rare' },
                        { name: 'Armor, +1 (light/medium/shield)', level: 3, price: '1,500 gp', rarity: 'Uncommon' },
                        { name: 'Armor, +2 (light/medium) or Shield +2', level: 7, price: '6,000 gp', rarity: 'Rare' },
                        { name: 'Armor, +3 (light/medium) or Shield +3', level: 13, price: '30,000 gp', rarity: 'Very Rare' },
                        { name: 'Quiver of True Flight', level: 4, price: '600 gp', rarity: 'Uncommon', note: 'Advantage once/short rest on a ranged attack' },
                        { name: 'Silentstep Boots', level: 4, price: '500 gp', rarity: 'Uncommon', note: 'Advantage on one Stealth check per short rest' },
                    ]
                },
                {
                    name: 'Rune Fletchery (Enchanted Ammunition)',
                    items: [
                        { name: 'Ammunition +1 (20)', level: 3, price: '250 gp', rarity: 'Uncommon' },
                        { name: 'Ammunition +2 (10)', level: 7, price: '1,000 gp', rarity: 'Rare' },
                        { name: 'Ammunition +3 (5)', level: 13, price: '5,000 gp', rarity: 'Very Rare' },
                        { name: 'Bursting Arrowheads (10)', level: 4, price: '400 gp', rarity: 'Uncommon', note: '1d6 force burst (DC 12 Dex half)' },
                        { name: 'Tetherline Bolts (5)', level: 4, price: '300 gp', rarity: 'Uncommon', note: 'Deploys 50 ft line on hit' },
                    ]
                },
                {
                    name: 'Wondrous Curios (Utility & Defense)',
                    items: [
                        { name: 'Traveler’s Satchel', level: 4, price: '800 gp', rarity: 'Uncommon', note: 'Bag-of-holding–like, 2 ft cube, 100 lb' },
                        { name: 'Cloak of the Watchful', level: 4, price: '600 gp', rarity: 'Uncommon', note: '+1 to initiative (non-stacking)' },
                        { name: 'Ring of Surefooting', level: 4, price: '500 gp', rarity: 'Uncommon', note: 'Advantage vs being knocked prone 1/rest' },
                        { name: 'Brace of Sparks', level: 4, price: '650 gp', rarity: 'Uncommon', note: 'Once/short rest add 1d4 lightning to a hit' },
                        { name: 'Whisperband', level: 2, price: '90 gp', rarity: 'Common', note: 'Message cantrip 3/day' },
                        { name: 'Lantern of Revealing Motes', level: 5, price: '700 gp', rarity: 'Uncommon', note: 'Outline faint invisibility in 10 ft' },
                        { name: 'Bracelet of Second Wind', level: 5, price: '750 gp', rarity: 'Uncommon', note: 'Bonus action heal 1d6+2, 1/long rest' },
                        { name: 'Veil of Quiet Footfalls', level: 5, price: '700 gp', rarity: 'Uncommon', note: 'Advantage to move silently' },
                    ]
                },
                {
                    name: 'Relics of Crystalia (Greater Items)',
                    items: [
                        { name: 'Crest-Linked Aegis', level: 8, price: '4,500 gp', rarity: 'Rare', note: 'Reaction +3 AC vs one attack, 1/day' },
                        { name: 'Starlit Dagger', level: 8, price: '5,000 gp', rarity: 'Rare', note: '+2d6 radiant 1/day; sheds dim light' },
                        { name: 'Echo-Twine Cloak', level: 9, price: '6,500 gp', rarity: 'Rare', note: 'Advantage on one save per long rest' },
                        { name: 'Heartbound Locket', level: 9, price: '3,500 gp', rarity: 'Rare', note: 'Stabilize adjacent ally as bonus action, 3/day' },
                        { name: 'Mirrorstep Boots', level: 12, price: '24,000 gp', rarity: 'Very Rare', note: 'Bonus action teleport 10 ft, 3/day' },
                        { name: 'Ring of Three Breaths', level: 14, price: '36,000 gp', rarity: 'Very Rare', note: 'Store up to 3 reactions/day' },
                    ]
                },
                {
                    name: 'Greater Armaments (Endgame)',
                    items: [
                        { name: 'Weapon, bane-forged', level: 15, price: '40,000 gp', rarity: 'Very Rare', note: '+2d6 vs chosen type, attunement' },
                        { name: 'Armor of the Vigil', level: 16, price: '45,000 gp', rarity: 'Very Rare', note: 'Resistance vs chosen damage type (daily)' },
                        { name: 'Ring of Spellward', level: 16, price: '48,000 gp', rarity: 'Very Rare', note: 'Advantage vs spells; resists spell dmg by 3' },
                        { name: 'Weapon, mythic +3 with stored strike', level: 18, price: '120,000 gp', rarity: 'Legendary', note: 'Bank a critical effect 1/week' },
                    ]
                },
                {
                    name: 'Potions & Elixirs (Upgrades)',
                    items: [
                        { name: 'Healing Potion (Greater)', level: 3, price: '150 gp', rarity: 'Uncommon' },
                        { name: 'Healing Potion (Superior)', level: 7, price: '1,000 gp', rarity: 'Rare' },
                        { name: 'Healing Potion (Supreme)', level: 13, price: '5,000 gp', rarity: 'Very Rare' },
                        { name: 'Elixir of Fleetstep', level: 4, price: '300 gp', rarity: 'Uncommon', note: 'Dash as bonus action for 1 minute (conc.)' },
                        { name: 'Elixir of Stoneskin', level: 9, price: '3,000 gp', rarity: 'Rare', note: 'Resist nonmagical B/P/S for 1 hour' },
                        { name: 'Draught of Mindshield', level: 5, price: '350 gp', rarity: 'Uncommon', note: 'Advantage vs charm/fear for 1 hour' },
                    ]
                },
                {
                    name: 'Spell Scripts (Scrolls)',
                    items: [
                        { name: '1st‑tier spell script (choose tradition)', level: 2, price: '75 gp', rarity: 'Common' },
                        { name: '2nd‑tier spell script', level: 3, price: '150 gp', rarity: 'Uncommon' },
                        { name: '3rd‑tier spell script', level: 5, price: '300 gp', rarity: 'Uncommon' },
                        { name: '4th‑tier spell script', level: 7, price: '1,000 gp', rarity: 'Rare' },
                        { name: '5th‑tier spell script', level: 9, price: '2,500 gp', rarity: 'Rare' },
                        { name: '6th‑tier spell script', level: 11, price: '10,000 gp', rarity: 'Very Rare' },
                        { name: '7th‑tier spell script', level: 13, price: '25,000 gp', rarity: 'Very Rare' },
                        { name: '8th‑tier spell script', level: 15, price: '50,000 gp', rarity: 'Legendary', note: 'By commission' },
                        { name: '9th‑tier spell script', level: 17, price: '100,000+ gp', rarity: 'Legendary', note: 'Restricted' },
                    ]
                },
                {
                    name: 'Components & Reagents',
                    items: [
                        { name: 'Diamond dust (100 gp portions)', level: 5, price: '100 gp' },
                        { name: 'Rare ink set (ritual diagrams)', level: 4, price: '250 gp' },
                        { name: 'Focus crystal, tuned (arcane focus)', level: 3, price: '50 gp' },
                        { name: 'Sanctified oil (ceremonial)', level: 4, price: '50 gp' },
                    ]
                }
            ]
        }
    ],

    npcs: [
        {
            id: 'eldon-thorne',
            name: 'Eldon Thorne',
            title: 'Guild Master of Guild Crystalia',
            race: 'Human',
            age: '60s',
            class: 'Divination Wizard (5th level)',
            personality: 'Weary but determined, scholarly, protective of guild members',
            appearance: 'Elderly human with grey beard, robes showing years of wear, kind but tired eyes',
            role: 'Your guild master. Assigns quests, provides guidance, protects guild secrets.',
            location: 'Guild Crystalia Hall',
            keyInfo: [
                'Suspects something wrong with resurrection magic',
                'Protective of the guild\'s dwindling members',
                'Has access to restricted archives',
                'Knowledgeable about city history',
                'Divination magic gives him insight'
            ],
            interactions: [
                'Quest giver',
                'Mentor figure',
                'Source of lore',
                'Can provide magical assistance'
            ]
        },
        {
            id: 'tessa-windfern',
            name: 'Tessa Windfern',
            title: 'Receptionist at Guild Crystalia',
            race: 'Halfling',
            age: '30s',
            class: 'Expert (non-combatant)',
            personality: 'Cheerful, talkative, observant, knows everyone\'s business',
            appearance: 'Friendly halfling woman, always has tea ready, warm smile',
            role: 'Information hub, quest coordinator, gossip collector',
            location: 'Guild Crystalia Hall reception desk',
            keyInfo: [
                'Connected to city\'s gossip network',
                'Protects Eldon',
                'Knows more than she lets on',
                'Always cheerful despite guild\'s troubles',
                'Remembers everyone who visits'
            ],
            interactions: [
                'Quest information',
                'City rumors',
                'Social connections',
                'Message delivery'
            ]
        }
    ],

    locations: [
        {
            id: 'guild-crystalia-hall',
            name: 'Guild Crystalia Hall',
            type: 'Guild Headquarters',
            description: 'Your guild\'s headquarters. Once grand, now showing signs of age and limited funds. Built above something important.',
            areas: [
                {
                    name: 'Ground Floor',
                    features: [
                        'Reception desk (Tessa\'s domain)',
                        'Job board with available quests',
                        'Common room with fireplace',
                        'Eldon\'s office',
                        'Small library'
                    ]
                },
                {
                    name: 'Basement Level 1',
                    features: [
                        'Storage rooms',
                        'Training equipment',
                        'Small archive',
                        'Stairs leading down...'
                    ]
                },
                {
                    name: 'Basement Level 2',
                    features: [
                        'Restricted - requires permission',
                        'Ancient archives',
                        'Sealed door (requires investigation quest)'
                    ]
                }
            ],
            npcs: ['Eldon Thorne', 'Tessa Windfern'],
            access: 'Guild members only'
        },
        {
            id: 'heart-plaza',
            name: 'Heart Plaza',
            type: 'City Center',
            description: 'Central plaza of Solspire. Contains the dungeon entrance (heavily guarded) and a mysterious fountain.',
            features: [
                'Dungeon entrance (30ft obsidian archway)',
                'Fountain with unidentified statue',
                'Market stalls',
                'Guild recruiting kiosks',
                'City Watch post'
            ],
            atmosphere: 'Always busy. Mixture of merchants, adventurers, and common folk. Dungeon entrance is imposing.',
            access: 'Public'
        },
        {
            id: 'hearthstone-inn',
            name: 'The Hearthstone Inn',
            type: 'Inn & Tavern',
            description: 'Hearthkeepers headquarters. Most popular gathering place. Grandmother Elara runs it. Best place for information.',
            features: [
                'Large common room (50+ capacity)',
                'Excellent food and drink',
                'Private meeting rooms',
                'Guest rooms available',
                'Always warm and welcoming'
            ],
            services: [
                'Food and lodging',
                'Tavern rumors',
                'Message board',
                'Neutral meeting ground'
            ],
            npcs: ['Grandmother Elara', 'Chef Borin', 'Brewmaster Yara'],
            access: 'Public'
        }
    ],

    items: [
        {
            id: 'guild-crest-tattoo',
            name: 'Guild Crest Tattoo',
            type: 'Wondrous Item',
            rarity: 'Rare',
            description: 'Silver crystalline pattern on your forearm. Glows faintly when activated. Unique design for each member.',
            abilities: [
                {
                    name: 'Return to Guild Hall',
                    uses: '1/day',
                    description: 'Teleport back to Guild Crystalia Hall'
                },
                {
                    name: 'Teleport to Ally',
                    uses: '1/day',
                    description: 'Teleport to another guild member within 1 mile'
                },
                {
                    name: 'Crest Pulse',
                    uses: 'At will',
                    description: 'Send alert to all nearby guild members'
                },
                {
                    name: 'Emergency Recall',
                    uses: '1/week (guild-activated)',
                    description: 'Guild can summon you back in emergency'
                }
            ],
            notes: 'All Guild Crystalia members receive this upon induction'
        }
    ],

    quests: [
        {
            id: 'missing-cat',
            name: 'The Missing Cat',
            type: 'Simple Quest',
            level: 'Easy (Level 1-2)',
            reward: '10gp + cookies',
            giver: 'Mrs. Halloway (elderly resident)',
            description: 'Mrs. Halloway\'s cat, Mr. Whiskers, is stuck on a roof. Simple rescue mission.',
            objectives: [
                'Find Mr. Whiskers',
                'Safely retrieve cat',
                'Return to Mrs. Halloway'
            ],
            notes: 'Good starter quest. May have optional twist (cat is actually a Tressym or fey creature).',
            status: 'Available on job board'
        },
        {
            id: 'shadows-in-basement',
            name: 'Shadows in the Basement',
            type: 'Investigation Quest',
            level: 'Medium (Level 2-3)',
            reward: '50gp + Sending Stone',
            giver: 'Eldon Thorne',
            description: 'Investigate disturbances in Guild Crystalia\'s lower basement. Strange sounds and shadows reported.',
            objectives: [
                'Investigate basement level 2',
                'Skill challenge (3 successes before 2 failures)',
                'Discover what\'s in the sealed room',
                'Report findings to Eldon'
            ],
            notes: 'Major plot quest. Reveals clues about guild\'s true purpose.',
            status: 'Available from Eldon when ready'
        }
    ],

    handouts: [
        {
            id: 'tavern-rumors',
            name: 'Tavern Rumors',
            type: 'Information',
            source: 'Hearthstone Inn',
            content: [
                '"The dungeon entrance grants wishes if you reach the bottom..." (FALSE - dangerous lie)',
                '"Silver-haired woman appears in dreams..." (TRUE - Sophia reaching out)',
                '"Guild Crystalia is cursed, that\'s why it\'s failing..." (FALSE)',
                '"Resurrection magic is getting more expensive..." (TRUE - draining power)',
                '"Strange sounds from beneath the city at night..." (TRUE)',
                '"The Crimson Vanguard is planning a takeover..." (PARTIALLY TRUE)',
                '"Shadowweave knows secrets about the guilds..." (TRUE)',
                '"The fountain in Heart Plaza depicts someone important..." (TRUE - Sophia)',
                '"Arkwright Circle is experimenting with dangerous magic..." (TRUE)',
                '"There\'s treasure at the dungeon\'s heart..." (MISLEADING)'
            ],
            notes: 'Mix of true and false rumors. Players must determine which to believe.'
        },
        {
            id: 'guild-job-board',
            name: 'Guild Job Board',
            type: 'Quest List',
            source: 'Guild Crystalia',
            quests: [
                {
                    name: 'Missing Cat',
                    reward: '10gp',
                    difficulty: 'Easy'
                },
                {
                    name: 'Basement Investigation',
                    reward: '50gp',
                    difficulty: 'Medium'
                },
                {
                    name: 'Dungeon Level 1 Exploration',
                    reward: '100gp',
                    difficulty: 'Hard'
                },
                {
                    name: 'Bounty: Davrik the Blade',
                    reward: '150gp',
                    difficulty: 'Hard'
                }
            ]
        }
    ],

    lore: [
        {
            id: 'darcnia-world',
            title: 'The World of Darcnia',
            category: 'World Lore',
            content: `
                <h3>Darcnia - The Floating Continent</h3>
                <p>Darcnia is a massive floating island suspended in the sky. No one remembers how it came to float or how long it's been this way.</p>
                
                <h4>Solspire - The Capital</h4>
                <p>Built above a mysterious dungeon entrance, Solspire is a city of guilds. Eleven major factions vie for power and influence.</p>
                
                <h4>The Dungeon</h4>
                <p>A massive underground structure beneath Solspire. Its entrance is in Heart Plaza, heavily monitored. Only guild members are allowed to explore it.</p>
                
                <div class="card">
                    <h4>What You Know</h4>
                    <ul>
                        <li>The dungeon has been explored for generations</li>
                        <li>Deeper levels are more dangerous</li>
                        <li>Strange magical energy permeates it</li>
                        <li>No one has reached the bottom (that you know of)</li>
                        <li>Rumors say there's treasure at its heart</li>
                    </ul>
                </div>
            `
        },
        {
            id: 'guild-system',
            title: 'The Guild System',
            category: 'Society',
            content: `
                <h3>How Guilds Work</h3>
                <p>Solspire is organized around guilds. There are 11 major factions, each serving different roles.</p>
                
                <h4>Adventuring Guilds</h4>
                <ul>
                    <li><strong>Guild Crystalia</strong> - Your guild, oldest but declining</li>
                    <li><strong>Crimson Vanguard</strong> - Elite combat specialists</li>
                    <li><strong>Stormcallers' Covenant</strong> - Powerful mages</li>
                    <li><strong>Gilded Compass</strong> - Explorers and cartographers</li>
                </ul>
                
                <h4>Support Guilds</h4>
                <ul>
                    <li><strong>Hearthkeepers</strong> - Innkeepers and hospitality</li>
                    <li><strong>Iron Covenant</strong> - Crafters and smiths</li>
                    <li><strong>Silent Vigil</strong> - Healers and priests</li>
                </ul>
                
                <h4>Power Factions</h4>
                <ul>
                    <li><strong>Merchant's Concord</strong> - Economic control</li>
                    <li><strong>Arkwright Circle</strong> - Magitech research</li>
                    <li><strong>Shadowweave</strong> - Information brokers (thieves)</li>
                    <li><strong>City Watch</strong> - Law enforcement</li>
                </ul>
                
                <div class="card">
                    <h4>Reputation Matters</h4>
                    <p>Your actions affect how each guild views you. Help them gain benefits. Offend them and face consequences.</p>
                </div>
            `
        }
    ]
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    // No login screen — initialize the app directly with a guest user
    state.currentCharacter = { name: 'Guest', accessLevel: 'player', clearedDungeonLevel: 0 };
    initializeApp();
});

function initializeApp() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Update theme toggle icon
    updateThemeIcon();
    
    // Setup event listeners
    setupEventListeners();
    
    // Build search index
    buildSearchIndex();
    
    // Load initial content
    loadContent('market');
    
    // Log success
    logSuccess();
}

// ===== Theme Management =====
function setTheme(theme) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const btn = document.getElementById('themeToggle');
    btn.textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Theme toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    
    // Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Modal close
    const modalClose = document.querySelector('.modal-close');
    const searchModal = document.getElementById('searchModal');
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (searchModal) searchModal.addEventListener('click', (e) => {
        if (e.target.id === 'searchModal') closeModal();
    });
}

// ===== Tab Switching =====
function switchTab(tab) {
    state.currentTab = tab;
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Load content
    loadContent(tab);
}

// ===== Content Loading =====
function loadContent(tab) {
    const contentArea = document.getElementById('contentArea');
    
    switch(tab) {
        case 'overview':
            contentArea.innerHTML = contentData.overview.content;
            break;
        case 'guilds':
            contentArea.innerHTML = renderGuilds();
            break;
        case 'npcs':
            contentArea.innerHTML = renderNPCs();
            break;
        case 'locations':
            contentArea.innerHTML = renderLocations();
            break;
        case 'market':
            contentArea.innerHTML = '<div class="loading">Loading market...</div>';
            ensureMarketLoaded().then(() => {
                contentArea.innerHTML = renderMarket();
            });
            break;
        case 'quests':
            contentArea.innerHTML = '<div class="loading">Loading quests...</div>';
            ensureQuestsLoaded().then(html => {
                contentArea.innerHTML = renderQuests();
            });
            break;
        case 'handouts':
            contentArea.innerHTML = renderHandouts();
            break;
        case 'lore':
            contentArea.innerHTML = renderLore();
            break;
        default:
            contentArea.innerHTML = '<p>Content not found.</p>';
    }
    
    // Update sidebar
    updateSidebar(tab);
}

// ===== Rendering Functions =====
function renderGuilds() {
    let html = '<h2>🏛️ Guilds of Solspire</h2>';
    
    const character = state.currentCharacter;
    const isDM = character.accessLevel === 'dm';
    
    // Filter guilds based on character knowledge
    let visibleGuilds = contentData.guilds;
    if (!isDM && character.knownGuilds !== 'all') {
        visibleGuilds = contentData.guilds.filter(guild => 
            character.knownGuilds?.includes(guild.name) || guild.id === 'guild-crystalia'
        );
        
        html += `<p>You know about ${visibleGuilds.length} guild(s) in Solspire. Explore the city to discover more!</p>`;
    } else {
        html += '<p>Eleven major factions control the city. Click any guild to learn more.</p>';
    }
    
    // Group guilds by type
    const adventuring = visibleGuilds.filter(g => 
        ['guild-crystalia', 'crimson-vanguard', 'stormcallers-covenant', 'gilded-compass'].includes(g.id)
    );
    const support = visibleGuilds.filter(g => 
        ['hearthkeepers', 'iron-covenant', 'silent-vigil'].includes(g.id)
    );
    const power = visibleGuilds.filter(g => 
        ['merchants-concord', 'arkwright-circle', 'shadowweave', 'city-watch'].includes(g.id)
    );
    
    if (adventuring.length > 0) {
        html += '<h3>Adventuring Guilds</h3>';
        html += adventuring.map(g => renderGuildCard(g)).join('');
    }
    
    if (support.length > 0) {
        html += '<h3>Support Guilds</h3>';
        html += support.map(g => renderGuildCard(g)).join('');
    }
    
    if (power.length > 0) {
        html += '<h3>Power Factions</h3>';
        html += power.map(g => renderGuildCard(g)).join('');
    }
    
    return html;
}

function renderGuildCard(guild) {
    return `
        <div class="card" onclick="showGuildDetail('${guild.id}')">
            <h3>${guild.name}</h3>
            <div class="card-meta"><em>"${guild.motto}"</em></div>
            <div class="card-meta">
                <strong>Type:</strong> ${guild.type} | 
                <strong>Leader:</strong> ${guild.leader} | 
                <strong>Size:</strong> ${guild.size}
            </div>
            <p>${guild.description}</p>
            <div class="card-tags">
                <span class="tag">Reputation: ${guild.reputation}</span>
                ${guild.id === 'guild-crystalia' ? '<span class="tag">YOUR GUILD</span>' : ''}
            </div>
        </div>
    `;
}

function showGuildDetail(guildId) {
    const guild = contentData.guilds.find(g => g.id === guildId);
    if (!guild) return;
    
    let html = `
        <h2>${guild.name}</h2>
        <div class="card-meta"><em>"${guild.motto}"</em></div>
        
        <div class="stat-block">
            <div class="stat-line"><span class="stat-label">Type:</span> <span class="stat-value">${guild.type}</span></div>
            <div class="stat-line"><span class="stat-label">Leader:</span> <span class="stat-value">${guild.leader}</span></div>
            <div class="stat-line"><span class="stat-label">Size:</span> <span class="stat-value">${guild.size}</span></div>
            <div class="stat-line"><span class="stat-label">Reputation:</span> <span class="stat-value">${guild.reputation}</span></div>
            <div class="stat-line"><span class="stat-label">Location:</span> <span class="stat-value">${guild.location}</span></div>
        </div>
        
        <h3>Description</h3>
        <p>${guild.description}</p>
        
        <h3>Key Information</h3>
        <ul>${guild.keyInfo.map(info => `<li>${info}</li>`).join('')}</ul>
        
        <h3>Services</h3>
        <ul>${guild.services.map(s => `<li>${s}</li>`).join('')}</ul>
    `;
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');
}

function renderNPCs() {
    let html = '<h2>👥 Important NPCs</h2>';
    html += '<p>Key characters you\'ve met or can meet.</p>';
    html += contentData.npcs.map(npc => `
        <div class="card" onclick="showNPCDetail('${npc.id}')">
            <h3>${npc.name}</h3>
            <div class="card-meta">${npc.title}</div>
            <div class="card-meta">${npc.race} | ${npc.class}</div>
            <p><strong>Personality:</strong> ${npc.personality}</p>
            <p><strong>Location:</strong> ${npc.location}</p>
        </div>
    `).join('');
    return html;
}

function showNPCDetail(npcId) {
    const npc = contentData.npcs.find(n => n.id === npcId);
    if (!npc) return;
    
    let html = `
        <h2>${npc.name}</h2>
        <div class="card-meta">${npc.title}</div>
        
        <div class="stat-block">
            <div class="stat-line"><span class="stat-label">Race:</span> <span class="stat-value">${npc.race}</span></div>
            <div class="stat-line"><span class="stat-label">Age:</span> <span class="stat-value">${npc.age}</span></div>
            <div class="stat-line"><span class="stat-label">Class:</span> <span class="stat-value">${npc.class}</span></div>
            <div class="stat-line"><span class="stat-label">Location:</span> <span class="stat-value">${npc.location}</span></div>
        </div>
        
        <h3>Appearance</h3>
        <p>${npc.appearance}</p>
        
        <h3>Personality</h3>
        <p>${npc.personality}</p>
        
        <h3>Role</h3>
        <p>${npc.role}</p>
        
        <h3>Key Information</h3>
        <ul>${npc.keyInfo.map(info => `<li>${info}</li>`).join('')}</ul>
        
        <h3>Interactions</h3>
        <ul>${npc.interactions.map(i => `<li>${i}</li>`).join('')}</ul>
    `;
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');
}

function renderLocations() {
    let html = '<h2>📍 Locations</h2>';
    html += contentData.locations.map(loc => `
        <div class="card">
            <h3>${loc.name}</h3>
            <div class="card-meta"><strong>Type:</strong> ${loc.type}</div>
            <p>${loc.description}</p>
            ${loc.features ? `<p><strong>Features:</strong> ${loc.features.join(', ')}</p>` : ''}
            ${loc.areas ? `<p><strong>Areas:</strong> ${loc.areas.length} sections</p>` : ''}
            <div class="card-tags">
                <span class="tag">${loc.access}</span>
            </div>
        </div>
    `).join('');
    return html;
}

// ===== Market Rendering =====
// Seeded RNG (mulberry32)
function seededRng(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

// Build a numeric seed from the current date and the view level (stable per day)
function buildDailySeed(viewLevel) {
    const d = new Date();
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-L${viewLevel}`;
    let h = 2166136261; // FNV-like
    for (let i = 0; i < key.length; i++) {
        h ^= key.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
}

function getItemRarity(item) {
    const r = (item.rarity || 'Common').toLowerCase();
    if (r.includes('very rare')) return 'Very Rare';
    if (r.includes('legendary')) return 'Legendary';
    if (r.includes('uncommon')) return 'Uncommon';
    if (r.includes('rare')) return 'Rare';
    return 'Common';
}

const RARITY_BASE_RATE = {
    'Common': 0.6,
    'Uncommon': 0.35,
    'Rare': 0.2,
    'Very Rare': 0.1,
    'Legendary': 0.05,
};

function levelAppearanceFactor(requiredLevel) {
    return Math.max(0.15, 1 - 0.05 * Math.max(0, requiredLevel));
}

function itemInStock(rng, item, viewLevel) {
    const req = Number(item.level ?? 0);
    if (req > viewLevel) return false;
    if (req <= 0) return true; // L0 always available
    const base = RARITY_BASE_RATE[getItemRarity(item)] ?? 0.3;
    const p = base * levelAppearanceFactor(req);
    return rng() < p;
}

function assignItemKeys(shops) {
    shops.forEach(shop => {
        (shop.categories || []).forEach(cat => {
            (cat.items || []).forEach(it => {
                const r = (it.rarity || '').trim();
                it._key = `${shop.id}::${cat.name}::${it.name}::L${it.level ?? 0}::${r}`.toLowerCase();
            });
        });
    });
    return shops;
}

function generateDailyStock(shops, viewLevel) {
    const seed = buildDailySeed(viewLevel);
    const rng = seededRng(seed);
    const stock = {};
    shops.forEach(shop => {
        const set = new Set();
        (shop.categories || []).forEach(cat => {
            (cat.items || []).forEach(it => {
                if (itemInStock(rng, it, viewLevel)) {
                    set.add(it._key);
                }
            });
        });
        stock[shop.id] = set;
    });
    return stock;
}
async function loadText(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return await res.text();
}

async function ensureMarketLoaded() {
    if (state.marketShopsLoaded) return state.marketShopsLoaded;
    const mdPath = CONFIG.campaignPath + 'handouts/bluebrick-market.md';
    const text = await loadText(mdPath);
    const shops = parseBluebrickMarketMarkdown(text);
    state.marketShopsLoaded = shops;
    return shops;
}

function getMarketShops() {
    return state.marketShopsLoaded || contentData.marketShops || [];
}

function parseBluebrickMarketMarkdown(md) {
    const lines = md.split(/\r?\n/);
    const shops = [];
    let currentShop = null;
    let currentCategory = null;
    let inHeader = true;
    
    const pushShop = () => { if (currentShop) shops.push(currentShop); };
    const startShop = (name, description='') => {
        currentShop = { id: slugify(name), name, description, categories: [] };
        currentCategory = null;
    };
    const startCategory = (name, note=null) => {
        const cat = { name: name.trim(), note, items: [] };
        currentShop.categories.push(cat);
        currentCategory = cat;
    };
    const addItem = (raw, priceStr) => {
        if (!currentShop) return;
        if (!currentCategory) startCategory('General');
        const parsed = parseItem(raw, priceStr);
        currentCategory.items.push(parsed);
    };
    
    const arcanePrefix = 'Arcane Exchange';
    
    for (let rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line.startsWith('---')) { inHeader = false; continue; }
        if (inHeader) continue;
        
        // Shop header
        if (line.startsWith('## ')) {
            const name = line.replace(/^##\s+/, '').trim();
            pushShop();
            startShop(name);
            continue;
        }
        
        // Arcane Exchange subcategories as ### headings
        if (line.startsWith('### ') && currentShop && currentShop.name.startsWith(arcanePrefix)) {
            const catName = line.replace(/^###\s+/, '').trim();
            startCategory(catName);
            continue;
        }
        
        // Category bullets like "- Armor" or "- Simple/Martial Weapons (common stock)"
        const catMatch = rawLine.match(/^\s*-\s+([^:\[][^:]*)$/);
        if (catMatch && currentShop && !currentShop.name.startsWith(arcanePrefix)) {
            startCategory(catMatch[1]);
            continue;
        }
        
        // Item bullets like "- Name [tag]: price" or with indentation
        const itemMatch = rawLine.match(/^\s*-\s+(.+?):\s*(.+)$/);
        if (itemMatch && currentShop) {
            addItem(itemMatch[1], itemMatch[2]);
            continue;
        }
        
        // Note lines for bundles
        if (currentShop && /bundles/i.test(line) && !line.startsWith('-')) {
            if (!currentCategory) startCategory('General');
            currentCategory.note = (currentCategory.note ? currentCategory.note + ' ' : '') + line;
            continue;
        }
        
        // Optional: description text after shop header
        if (currentShop && currentShop.description === '') {
            // First non-empty, non-heading line after shop is a description if it is not a list
            if (!line.startsWith('-') && !line.startsWith('###')) {
                currentShop.description = rawLine.trim();
                continue;
            }
        }
    }
    pushShop();
    return shops;
}

function parseItem(label, price) {
    // Extract bracket content e.g., [L0] or [Uncommon, L3]
    let level = 0; let rarity = null; let name = label.trim(); let note = null;
    const bracket = name.match(/\[(.*?)\]/);
    if (bracket) {
        const inside = bracket[1];
        // Identify L#
        const lMatch = inside.match(/L\s*(\d+)/i);
        if (lMatch) level = parseInt(lMatch[1], 10);
        // Identify rarity
        const rMatch = inside.match(/(Common|Uncommon|Rare|Very Rare|Legendary)/i);
        if (rMatch) rarity = capitalizeWords(rMatch[1]);
        name = name.replace(/\s*\[.*?\]\s*/, ' ').trim();
    }
    // Detect em-dash or dash style notes appended to price line (e.g., "— small blast ...")
    let finalPrice = price.trim();
    const noteMatch = finalPrice.match(/\s*[—-]\s*(.+)$/);
    if (noteMatch) {
        note = noteMatch[1].trim();
        finalPrice = finalPrice.replace(/\s*[—-].*$/, '').trim();
    }
    return { name, price: finalPrice, level, rarity, note };
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function capitalizeWords(s) { return s.replace(/\b\w/g, c => c.toUpperCase()); }

function getMarketViewLevel() {
    // DM can override; otherwise use character's cleared level
    if (state.marketViewLevel !== null && state.currentCharacter?.accessLevel === 'dm') return state.marketViewLevel;
    const lvl = state.currentCharacter?.clearedDungeonLevel;
    return typeof lvl === 'number' ? lvl : 0;
}

function setMarketViewLevel(level) {
    const parsed = parseInt(level, 10);
    state.marketViewLevel = isNaN(parsed) ? 0 : parsed;
    // Re-render market or open shop detail depending on visible content
    if (state.currentTab === 'market') {
        document.getElementById('contentArea').innerHTML = renderMarket();
    }
}

function filterItemsByLevel(items, level, isDM) {
    if (isDM) return items; // DM sees all by default
    return items.filter(it => (typeof it.level !== 'number') ? true : it.level <= level);
}

function renderMarket() {
    const character = state.currentCharacter;
    const isDM = character?.accessLevel === 'dm';
    const viewLevel = getMarketViewLevel();
    const shops = assignItemKeys(getMarketShops());
    const dailyStock = generateDailyStock(shops, viewLevel);
    state._currentMarketStock = dailyStock;
    
    let html = '<h2>🛒 Bluebrick Market</h2>';
    html += '<p>Browse shops and check stock based on your cleared dungeon level.</p>';
    
    // Controls
    if (isDM) {
        html += `
            <div class="card">
                <div class="stat-line"><span class="stat-label">Viewing as Dungeon Level:</span>
                <select onchange="setMarketViewLevel(this.value)">
                    ${Array.from({length: 21}, (_, i) => `<option value="${i}" ${i===viewLevel?'selected':''}>L${i}</option>`).join('')}
                </select>
                <span class="tag">DM View</span>
                </div>
            </div>
        `;
    } else {
        html += `
            <div class="card">
                <div class="stat-line"><span class="stat-label">Availability:</span> <span class="stat-value">Dungeon L${viewLevel}</span></div>
                <div class="card-meta">Items show only up to your cleared level.</div>
            </div>
        `;
    }
    
    // Shop grid
    html += '<div class="card-grid">';
    html += shops.map(shop => renderShopCard(shop)).join('');
    html += '</div>';
    
    return html;
}

function renderShopCard(shop) {
    // Count available items for quick glance using daily stock
    const viewLevel = getMarketViewLevel();
    const stockSet = state._currentMarketStock?.[shop.id] || new Set();
    let total = 0;
    let available = 0;
    (shop.categories || []).forEach(c => {
        (c.items || []).forEach(it => {
            total += 1;
            const req = Number(it.level ?? 0);
            const eligible = req <= viewLevel;
            const inStock = req <= 0 || (eligible && stockSet.has(it._key));
            if (inStock) available += 1;
        });
    });
    
    return `
        <div class="card" onclick="showShopDetail('${shop.id}')">
            <h3>${shop.name}</h3>
            <p>${shop.description || ''}</p>
            <div class="card-tags">
                <span class="tag">${available}/${total} available</span>
            </div>
        </div>
    `;
}

function showShopDetail(shopId) {
    const shops = assignItemKeys(getMarketShops());
    const shop = resolveShop(shopId, shops);
    if (!shop) return;
    const isDM = state.currentCharacter?.accessLevel === 'dm';
    const viewLevel = getMarketViewLevel();
    const stockSet = generateDailyStock(shops, viewLevel)[shop.id] || new Set();
    
    let html = `<h2>${shop.name}</h2>`;
    if (shop.description) html += `<p>${shop.description}</p>`;
    html += `<div class="card-meta">Showing items up to L${viewLevel}${isDM ? ' (DM adjustable)' : ''}</div>`;
    
    shop.categories.forEach(cat => {
        const items = (cat.items || []);
        let shown = 0;
        html += `<h3>${cat.name}</h3>`;
        if (cat.note) html += `<p class="card-meta">${cat.note}</p>`;
        html += '<ul class="market-list">';
        items.forEach(it => {
            const req = Number(it.level ?? 0);
            const eligible = req <= viewLevel;
            const inStock = req <= 0 || (eligible && stockSet.has(it._key));
            const rarity = it.rarity ? it.rarity : getItemRarity(it);
            const cls = (!inStock && isDM) ? 'item-dim' : '';
            // Player sees only in-stock items; DM sees all (dimmed when OOS/locked)
            if (inStock || isDM) {
                const badge = (!eligible ? `Locked L${req}` : (!inStock && req > 0 ? 'Out of stock' : `L${req}`));
                const lvlTag = ` <span class="tag">${badge}</span>`;
                const rarityTag = rarity ? ` <span class="tag">${rarity}</span>` : '';
                const note = it.note ? ` <em class="card-meta">— ${it.note}</em>` : '';
                html += `<li class="${cls}"><strong>${it.name}</strong>${lvlTag}${rarityTag}: ${it.price}${note}</li>`;
                shown++;
            }
        });
        html += '</ul>';
        if (shown === 0) {
            html += '<p class="card-meta">No items available at your current dungeon level today.</p>';
        }
    });
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');
}

function resolveShop(targetId, shops) {
    const lower = (targetId || '').toLowerCase();
    let s = shops.find(x => x.id === targetId);
    if (s) return s;
    s = shops.find(x => x.id.startsWith(lower));
    if (s) return s;
    s = shops.find(x => x.name.toLowerCase().startsWith(lower.replace(/-/g, ' ')));
    return s;
}

function renderItems() {
    let html = '<h2>⚔️ Items & Equipment</h2>';
    html += contentData.items.map(item => `
        <div class="card">
            <h3>${item.name}</h3>
            <div class="card-meta">${item.type} | ${item.rarity}</div>
            <p>${item.description}</p>
            ${item.abilities ? `
                <h4>Abilities:</h4>
                <ul>
                    ${item.abilities.map(a => `
                        <li><strong>${a.name}</strong> (${a.uses}): ${a.description}</li>
                    `).join('')}
                </ul>
            ` : ''}
            ${item.notes ? `<p><em>${item.notes}</em></p>` : ''}
        </div>
    `).join('');
    return html;
}

function renderQuests() {
    // If we have markdown HTML loaded, render it inside a card; otherwise, kick off the loader
    if (state.questsMarkdownHTML) {
        return `
            <h2>📜 Guild Crystalia Job Board</h2>
            <div class="card markdown">${state.questsMarkdownHTML}</div>
        `;
    }
    return '<div class="loading">Loading quests...</div>';
}

function renderHandouts() {
    let html = '<h2>📄 Player Handouts</h2>';
    
    const character = state.currentCharacter;
    const isDM = character.accessLevel === 'dm';
    
    // Filter handouts based on character discoveries
    let visibleHandouts = contentData.handouts;
    if (!isDM && character.discoveredHandouts !== 'all') {
        visibleHandouts = contentData.handouts.filter(handout =>
            character.discoveredHandouts?.includes(handout.name)
        );
        
        if (visibleHandouts.length === 0) {
            html += '<p>You haven\'t discovered any documents yet. Explore the world to find clues!</p>';
            return html;
        }
        
        html += `<p>You have discovered ${visibleHandouts.length} document(s).</p>`;
    } else {
        html += '<p>Documents and information you\'ve discovered.</p>';
    }
    
    html += visibleHandouts.map(handout => `
        <div class="card">
            <h3>${handout.name}</h3>
            <div class="card-meta"><strong>Source:</strong> ${handout.source}</div>
            ${handout.content ? `
                <h4>Information:</h4>
                <ul>${handout.content.map(c => `<li>${c}</li>`).join('')}</ul>
            ` : ''}
            ${handout.quests ? `
                <h4>Quests:</h4>
                <ul>${handout.quests.map(q => `<li><strong>${q.name}</strong> - ${q.reward} (${q.difficulty})</li>`).join('')}</ul>
            ` : ''}
        </div>
    `).join('');
    return html;
}

function renderLore() {
    let html = '<h2>📚 Lore & History</h2>';
    html += '<p>This section is not available in the simplified site.</p>';
    return html;
}

// ===== Sidebar =====
function updateSidebar(tab) {
    const sidebar = document.querySelector('.quick-links');
    let links = [];
    
    switch(tab) {
        case 'market':
            links = [
                { text: 'Market Directory', action: () => switchTab('market') },
                { text: 'Brass Buckle Outfitters', action: () => showShopDetail('brass-buckle') },
                { text: 'Smith’s Bench', action: () => showShopDetail('smiths-bench') },
                { text: 'Arcane Exchange', action: () => showShopDetail('arcane-exchange') }
            ];
            break;
        case 'quests':
            links = [
                { text: 'Available Quests', action: () => switchTab('quests') },
                { text: 'Browse Market', action: () => switchTab('market') }
            ];
            break;
        default:
            links = [
                { text: 'Browse Market', action: () => switchTab('market') },
                { text: 'Available Quests', action: () => switchTab('quests') }
            ];
    }
    
    sidebar.innerHTML = links.map((link, idx) => 
        `<a href="#" class="quick-link" onclick="event.preventDefault(); quickLinks[${idx}].action();">${link.text}</a>`
    ).join('');
    
    // Store links for onclick access
    window.quickLinks = links;
}

// ===== Search =====
function buildSearchIndex() {
    state.searchIndex = [];
    
    // Only index Market and Quests for the simplified site
    
    // Legacy items index removed (Market is the primary catalog)
    // Index market shops and items
    // Build index after market is available for better coverage
    const shopsForIndex = getMarketShops();
    if (Array.isArray(shopsForIndex)) {
        shopsForIndex.forEach(shop => {
            state.searchIndex.push({
                type: 'Shop',
                title: shop.name,
                content: shop.description || '',
                data: shop,
                showFunction: () => { switchTab('market'); showShopDetail(shop.id); }
            });
            // Items per category
            shop.categories.forEach(cat => {
                cat.items.forEach(it => {
                    state.searchIndex.push({
                        type: 'Market Item',
                        title: it.name,
                        content: `${shop.name} ${cat.name} ${it.price} L${typeof it.level==='number'?it.level:'-'}`,
                        data: { shopId: shop.id, category: cat.name, item: it },
                        showFunction: () => { switchTab('market'); showShopDetail(shop.id); }
                    });
                });
            });
        });
    }
    
    contentData.quests.forEach(quest => {
        // Only show quests if the character knows them or is DM
        if (state.currentCharacter?.accessLevel === 'dm' || state.currentCharacter?.activeQuests?.includes(quest.name) || quest.isPublic) {
            state.searchIndex.push({
                type: 'Quest',
                title: quest.name,
                content: `${quest.description} ${quest.objectives.join(' ')}`,
                data: quest,
                showFunction: () => { switchTab('quests'); }
            });
        }
    });
}

// ===== Quests: Load from Markdown =====
async function ensureQuestsLoaded() {
    if (state.questsMarkdownHTML) return state.questsMarkdownHTML;
    const mdPath = CONFIG.campaignPath + 'handouts/guild-job-board.md';
    const text = await loadText(mdPath);
    const html = basicMarkdownToHTML(text);
    state.questsMarkdownHTML = html;
    return html;
}

// Lightweight Markdown converter for headings, bold, and lists
function basicMarkdownToHTML(md) {
    const lines = md.split(/\r?\n/);
    let html = '';
    let inList = false;
    for (let raw of lines) {
        let line = raw;
        if (/^\s*$/.test(line)) { if (inList) { html += '</ul>'; inList = false; } continue; }
        // Headings
        if (line.startsWith('### ')) { if (inList) { html += '</ul>'; inList = false; } html += `<h3>${escapeHtml(line.slice(4))}</h3>`; continue; }
        if (line.startsWith('## ')) { if (inList) { html += '</ul>'; inList = false; } html += `<h2>${escapeHtml(line.slice(3))}</h2>`; continue; }
        if (line.startsWith('# ')) { if (inList) { html += '</ul>'; inList = false; } html += `<h1>${escapeHtml(line.slice(2))}</h1>`; continue; }
        // List item
        if (/^\s*[-*]\s+/.test(line)) {
            if (!inList) { html += '<ul>'; inList = true; }
            const itemText = line.replace(/^\s*[-*]\s+/, '');
            html += `<li>${formatInlineMD(itemText)}</li>`;
            continue;
        }
        // Horizontal rule
        if (/^---+$/.test(line.trim())) { if (inList) { html += '</ul>'; inList = false; } html += '<hr />'; continue; }
        // Paragraph
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${formatInlineMD(line)}</p>`;
    }
    if (inList) html += '</ul>';
    return html;
}

function formatInlineMD(text) {
    // Bold **text**
    let t = escapeHtml(text);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Inline code `code`
    t = t.replace(/`([^`]+?)`/g, '<code>$1</code>');
    return t;
}

function escapeHtml(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) return;
    
    const results = state.searchIndex.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const contentMatch = item.content.toLowerCase().includes(query);
        return titleMatch || contentMatch;
    });
    
    displaySearchResults(results, query);
}

function displaySearchResults(results, query) {
    const modal = document.getElementById('searchModal');
    const resultsDiv = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found for "' + query + '"</p>';
    } else {
        let html = `<p>Found ${results.length} result(s) for "<strong>${query}</strong>"</p>`;
        html += results.map(result => {
            const excerpt = getExcerpt(result.content, query);
            return `
                <div class="search-result-item" onclick='${result.showFunction.toString()}()'>
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-type">${result.type}</div>
                    <div class="search-result-excerpt">${excerpt}</div>
                </div>
            `;
        }).join('');
        resultsDiv.innerHTML = html;
    }
    
    modal.classList.remove('hidden');
}

function getExcerpt(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text.substring(0, 150) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    let excerpt = text.substring(start, end);
    
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';
    
    // Highlight the query
    const regex = new RegExp(`(${query})`, 'gi');
    excerpt = excerpt.replace(regex, '<span class="highlight">$1</span>');
    
    return excerpt;
}

function closeModal() {
    document.getElementById('searchModal').classList.add('hidden');
}

// ===== Login System =====
// Removed: Site runs without authentication. A default Guest user is used.

function hasAccess(contentType, contentId) {
    const character = state.currentCharacter;
    
    // DM has access to everything
    if (character.accessLevel === 'dm') {
        return true;
    }
    
    // Check specific content types
    switch(contentType) {
        case 'guild':
            if (character.knownGuilds === 'all') return true;
            return character.knownGuilds?.includes(contentId) || false;
            
        case 'location':
            if (character.knownLocations === 'all') return true;
            return character.knownLocations?.includes(contentId) || false;
            
        case 'handout':
            if (character.discoveredHandouts === 'all') return true;
            return character.discoveredHandouts?.includes(contentId) || false;
            
        case 'npc':
            if (character.accessLevel === 'dm') return true;
            // Only show NPCs the character has met
            return character.relationships?.includes(contentId) || false;
            
        case 'secret':
            // Secrets are DM only unless specifically known
            return character.knownSecrets?.includes(contentId) || false;
            
        default:
            return true; // Default allow for basic content
    }
}

function filterContentByAccess(contentList, contentType) {
    const character = state.currentCharacter;
    
    // DM sees everything
    if (character.accessLevel === 'dm') {
        return contentList;
    }
    
    // Filter based on character knowledge
    return contentList.filter(item => {
        return hasAccess(contentType, item.name || item.id || item.title);
    });
}

// ===== Utility Functions =====
// Wait to log until after login
function logSuccess() {
    console.log('🎲 Darcnia Campaign Reference loaded successfully!');
    console.log('📚 Search index built with', state.searchIndex.length, 'items');
    console.log('⚔️ Playing as:', state.currentCharacter?.name);
    console.log('🔑 Access level:', state.accessLevel);
}

