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
        clearedDungeonLevel: 0,
        bank: { gold: 0, silver: 0, copper: 0 } // Starting funds
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
    marketViewLevel: null,
    shopFilters: {},
    dice: {
        mode: 'normal', // 'normal' | 'adv' | 'dis'
        history: []     // keep last 10 results
    },
    cart: [], // Shopping cart: [{key, name, price, shop, quantity}]
    bank: { gold: 0, silver: 0, copper: 0 } // Player's bank balance
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
    state.currentCharacter = { 
        name: 'Guest', 
        accessLevel: 'player', 
        clearedDungeonLevel: 0,
        bank: { gold: 0, silver: 0, copper: 0 }
    };
    initializeApp();
    
    // ===== Enhanced UI Features =====
    
    // Sticky header scroll behavior
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });
    
    // Ripple effect on clicks
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('button, .tab-btn, .card, .market-list li')) {
            createRipple(e, target);
        }
    });
    
    // Keyboard navigation detection
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav-active');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav-active');
    });
    
    // Intersection Observer for fade-in animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe cards and list items
    const observeElements = () => {
        document.querySelectorAll('.card, .market-list li').forEach(el => {
            observer.observe(el);
        });
    };
    
    // Initial observation
    setTimeout(observeElements, 100);
    
    // Re-observe when content changes
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        const contentObserver = new MutationObserver(observeElements);
        contentObserver.observe(contentArea, { childList: true, subtree: true });
    }
});

// Create ripple effect on click
function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.position = 'absolute';
    
    element.style.position = element.style.position || 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function initializeApp() {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Update theme toggle icon
    updateThemeIcon();
    
    // Load bank balance from localStorage first, then from character as fallback
    const savedBank = localStorage.getItem('bankBalance');
    if (savedBank) {
        state.bank = JSON.parse(savedBank);
    } else if (state.currentCharacter && state.currentCharacter.bank) {
        state.bank = { ...state.currentCharacter.bank };
        saveBankToLocalStorage();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Build search index
    buildSearchIndex();
    
    // Load initial content
    loadContent('market');
    
    // Update bank display
    updateBankDisplay();
    
    // Log success
    logSuccess();
}

function saveBankToLocalStorage() {
    localStorage.setItem('bankBalance', JSON.stringify(state.bank));
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

    // Keyboard shortcuts for dice tray
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key.toLowerCase() === 'a') setDiceMode('adv');
        if (e.key.toLowerCase() === 'd') setDiceMode('dis');
        if (e.key.toLowerCase() === 'n') setDiceMode('normal');
        if (e.key.toLowerCase() === 'r') rollFromFormula('1d20');
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
                startRestockCountdown();
            });
            break;
        case 'quests':
            contentArea.innerHTML = '<div class="loading">Loading quests...</div>';
            ensureQuestsLoaded().then(html => {
                contentArea.innerHTML = renderQuests();
            });
            break;
        case 'dice':
            contentArea.innerHTML = renderDiceRoller();
            initializeDiceRoller();
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

// Build a numeric seed from the current date (stable per day for all users)
function buildDailySeed() {
    const d = new Date();
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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

function itemInStock(rng, item) {
    const req = Number(item.level ?? 0);
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

function generateDailyStock(shops) {
    const seed = buildDailySeed();
    const rng = seededRng(seed);
    const stock = {};
    shops.forEach(shop => {
        const set = new Set();
        (shop.categories || []).forEach(cat => {
            (cat.items || []).forEach(it => {
                if (itemInStock(rng, it)) {
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
    let level = 0; let rarity = null; let name = label.trim(); let note = null; let attunement = false;
    const bracket = name.match(/\[(.*?)\]/);
    if (bracket) {
        const inside = bracket[1];
        // Identify L#
        const lMatch = inside.match(/L\s*(\d+)/i);
        if (lMatch) level = parseInt(lMatch[1], 10);
        // Identify rarity
        const rMatch = inside.match(/(Common|Uncommon|Rare|Very Rare|Legendary)/i);
        if (rMatch) rarity = capitalizeWords(rMatch[1]);
        // Attunement flag
        if (/attunement/i.test(inside)) attunement = true;
        name = name.replace(/\s*\[.*?\]\s*/, ' ').trim();
    }
    // Detect em-dash or dash style notes appended to price line (e.g., "— small blast ...")
    let finalPrice = price.trim();
    const noteMatch = finalPrice.match(/\s*[—-]\s*(.+)$/);
    if (noteMatch) {
        note = noteMatch[1].trim();
        finalPrice = finalPrice.replace(/\s*[—-].*$/, '').trim();
    }
    // If label text mentions attunement
    if (!attunement && /attunement/i.test(name)) attunement = true;
    if (!attunement && note && /attunement/i.test(note)) attunement = true;
    return { name, price: finalPrice, level, rarity, note, attunement };
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
    const shops = assignItemKeys(getMarketShops());
    const dailyStock = generateDailyStock(shops);
    state._currentMarketStock = dailyStock;
    
    let html = '<h2>🛒 Bluebrick Market</h2>';
    html += '<p>Browse shops. Stock rotates daily. Items tagged [L0] are always in stock; higher-level and rarer items appear less often.</p>';
    
    // Countdown timer for merchant restock
    html += '<div class="restock-timer-container">';
    html += '<div class="restock-timer">';
    html += '<span class="timer-icon">⏰</span>';
    html += '<span class="timer-label">Next Restock in:</span>';
    html += '<span class="timer-countdown" id="restockCountdown">--:--:--</span>';
    html += '</div>';
    html += '</div>';
    
    // Controls removed (no level gating)
    
    // Shop grid
    html += '<div class="card-grid">';
    html += shops.map(shop => renderShopCard(shop)).join('');
    html += '</div>';
    
    return html;
}

function renderShopCard(shop) {
    // Compute a concise tagline for the card subtitle
    const tagline = getShopTagline(shop);
    // Count available items for quick glance using daily stock
    const stockSet = state._currentMarketStock?.[shop.id] || new Set();
    let total = 0;
    let available = 0;
    (shop.categories || []).forEach(c => {
        (c.items || []).forEach(it => {
            total += 1;
            const req = Number(it.level ?? 0);
            const inStock = req <= 0 || stockSet.has(it._key);
            if (inStock) available += 1;
        });
    });

    // Display name without parenthetical (e.g., "(Basic Arms & Armor)")
    const displayName = (shop.name || '').replace(/\s*\([^)]*\)\s*$/, '').trim() || shop.name;

    return `
        <div class="card shop-card" onclick="showShopDetail('${shop.id}')">
            <div class="shop-card-title">${displayName}</div>
            <div class="shop-card-subtitle">${escapeHtml(tagline)}</div>
            <div class="card-tags">
                <span class="tag">${available}/${total} available</span>
            </div>
        </div>
    `;
}

// Provide short, human-friendly shop taglines even when markdown lacks descriptions
function getShopTagline(shop) {
    if (shop && typeof shop.description === 'string' && shop.description.trim().length > 0) {
        return shop.description.trim();
    }
    const key = slugify(shop?.name || shop?.id || '').toLowerCase();
    const DEFAULT_SHOP_TAGLINES = {
        'brass-buckle-outfitters': 'Everyday adventuring gear and affordable bundles to outfit any expedition.',
        'three-feathers-archery': 'Arrows, bolts, quivers, and bow care for ranged specialists.',
        'smiths-bench': 'Light/Medium Armor and common weapons only; specialty gear by order.',
        'rue-resin-apothecary': 'Potions of healing, basic remedies, and practical alchemical supplies.',
        'stables-services': 'Meals, lodging, baths, stabling, and in‑city messenger services.',
        'south-gate-stables-wheels': 'Mounts, tack, and simple overland carts and wagons.',
        'tinkers-nook': 'Locks, traps, bearings, and sneaky tools for problem solving.',
        'scribe-sealery': 'Paper, parchment, inks, journals, and wax seals for proper correspondence.',
        'guild-toolwright': 'Proficiency tools and kits for craftsmen, rogues, and specialists.',
        'arcane-exchange': 'Rotating stock of magical arms, curios, potions, and scrolls.'
    };
    if (DEFAULT_SHOP_TAGLINES[key]) return DEFAULT_SHOP_TAGLINES[key];
    // Fallback: synthesize from first 1–2 category names
    const cats = (shop?.categories || []).map(c => c?.name).filter(Boolean);
    if (cats.length > 0) {
        if (cats.length === 1) return cats[0];
        return cats.slice(0, 2).join(' • ');
    }
    return 'Browse curated stock and bundles.';
}

function showShopDetail(shopId) {
    const shops = assignItemKeys(getMarketShops());
    const shop = resolveShop(shopId, shops);
    if (!shop) return;
    const isDM = state.currentCharacter?.accessLevel === 'dm';
    const stockSet = (state._currentMarketStock || generateDailyStock(shops))[shop.id] || new Set();
        const ALL_RARITIES = ['Common','Uncommon','Rare','Very Rare','Legendary'];
        const filters = state.shopFilters[shop.id] || { q: '', inStockOnly: true, rarities: new Set() };
    
        let html = `<h2>${shop.name}</h2>`;
    if (shop.description) html += `<p>${shop.description}</p>`;
        html += `<div class="card-meta">Showing today's stock (daily rotation). L0 items are always available.</div>`;

        // Filter bar (in stock only is forced on by default)
        html += `
            <div class="shop-filters card">
                <div class="filters-row">
                    <input type="search" id="shop-q" placeholder="Search in ${shop.name}..." value="${filters.q?.replace(/"/g,'&quot;')||''}" />
                </div>
                <div class="filters-row rarity-chips">
                    ${ALL_RARITIES.map(r => {
                        const on = filters.rarities instanceof Set ? filters.rarities.has(r) : false;
                        return `<button class="chip ${on?'on':''}" data-rarity="${r}">${r}</button>`;
                    }).join('')}
                    <button class="chip clear" id="rarity-clear">Clear</button>
                </div>
            </div>`;
    
    shop.categories.forEach(cat => {
                const items = (cat.items || []).filter(it => {
                        const req = Number(it.level ?? 0);
                        const inStock = req <= 0 || stockSet.has(it._key);
                        const rarity = it.rarity ? it.rarity : getItemRarity(it);
                        if (filters.inStockOnly && !inStock) return false;
                        if (filters.q && !(`${it.name} ${cat.name}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
                        if (filters.rarities instanceof Set && filters.rarities.size > 0 && !filters.rarities.has(rarity)) return false;
                        return true;
                });
        let shown = 0;
        html += `<h3>${cat.name}</h3>`;
        if (cat.note) html += `<p class="card-meta">${cat.note}</p>`;
        html += '<ul class="market-list">';
        items.forEach(it => {
            const req = Number(it.level ?? 0);
            const inStock = req <= 0 || stockSet.has(it._key);
            const rarity = it.rarity ? it.rarity : getItemRarity(it);
            const cls = (!inStock && req > 0) ? 'item-dim' : '';
            // Show all items to all users; dim and label out-of-stock ones
            const badge = (!inStock && req > 0 ? 'Out of stock' : `L${req}`);
            const lvlTag = ` <span class="tag">${badge}</span>`;
                        const rarityTag = rarity ? ` <span class="tag rarity" data-rarity="${rarity}">${rarity}</span>` : '';
                        const attuneTag = it.attunement ? ` <span class="tag attune" title="Requires attunement">Attunement</span>` : '';
            const note = it.note ? ` <em class="card-meta">— ${it.note}</em>` : '';
            const itemKey = `${shopId}-${cat.name}-${it.name}`;
            const cartBtn = `<button class="add-to-cart-btn" onclick="addToCart('${itemKey.replace(/'/g, "\\'")}', '${it.name.replace(/'/g, "\\'")}', '${it.price}', '${shopId}')" title="Add to cart">🛒</button>`;
                        html += `<li class="${cls}"><div class="item-content"><strong>${it.name}</strong>${lvlTag}${rarityTag}${attuneTag}: ${it.price}${note}</div>${cartBtn}</li>`;
            shown++;
        });
        html += '</ul>';
        if (shown === 0) {
            html += '<p class="card-meta">No items available at your current dungeon level today.</p>';
        }
    });
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');

        // Wire up filters
        wireShopFilters(shop.id);
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

// Shop filter wiring
function wireShopFilters(shopId) {
    const filters = state.shopFilters[shopId] || { q: '', inStockOnly: true, rarities: new Set() };
    const qEl = document.getElementById('shop-q');
    const chipEls = Array.from(document.querySelectorAll('.rarity-chips .chip[data-rarity]'));
    const clearEl = document.getElementById('rarity-clear');
    const ensure = (v) => (v instanceof Set ? v : new Set(Array.isArray(v)?v:[]));
    filters.rarities = ensure(filters.rarities);
    // Force inStockOnly to always be true
    filters.inStockOnly = true;
    state.shopFilters[shopId] = filters;
    
    if (qEl) qEl.addEventListener('input', () => {
        filters.q = qEl.value || '';
        showShopDetail(shopId);
    });
    // inStockOnly checkbox removed - always forced to true
    chipEls.forEach(ch => ch.addEventListener('click', () => {
        const r = ch.getAttribute('data-rarity');
        if (filters.rarities.has(r)) filters.rarities.delete(r); else filters.rarities.add(r);
        showShopDetail(shopId);
    }));
    if (clearEl) clearEl.addEventListener('click', () => {
        filters.rarities.clear();
        showShopDetail(shopId);
    });
}

// ===== Shopping Cart =====
function addToCart(itemKey, itemName, itemPrice, shopId) {
    // Check if item already in cart
    const existingItem = state.cart.find(item => item.key === itemKey);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({
            key: itemKey,
            name: itemName,
            price: itemPrice,
            shop: shopId,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showCartNotification(`Added ${itemName} to cart`);
}

function removeFromCart(itemKey) {
    state.cart = state.cart.filter(item => item.key !== itemKey);
    updateCartDisplay();
    
    // Refresh the cart modal if it's showing cart content
    const searchResults = document.getElementById('searchResults');
    if (searchResults && searchResults.innerHTML.includes('🛒 Shopping Cart')) {
        if (state.cart.length > 0) {
            showCart();
        } else {
            const modal = document.getElementById('searchModal');
            if (modal) modal.classList.add('hidden');
            alert('Your cart is now empty!');
        }
    }
}

function updateCartQuantity(itemKey, delta) {
    const item = state.cart.find(i => i.key === itemKey);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(itemKey);
        } else {
            updateCartDisplay();
            // Refresh the cart modal if it's showing cart content
            const searchResults = document.getElementById('searchResults');
            if (searchResults && searchResults.innerHTML.includes('🛒 Shopping Cart')) {
                showCart();
            }
        }
    }
}

function updateCartDisplay() {
    const cartBtn = document.getElementById('cartButton');
    const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cartBtn) {
        cartBtn.textContent = `🛒 Cart (${cartCount})`;
        if (cartCount > 0) {
            cartBtn.classList.add('has-items');
        } else {
            cartBtn.classList.remove('has-items');
        }
    }
}

function showCart() {
    if (state.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    let html = '<h2>🛒 Shopping Cart</h2>';
    html += '<div class="cart-items">';
    
    let totalGold = 0;
    let totalSilver = 0;
    let totalCopper = 0;
    
    state.cart.forEach(item => {
        // Calculate subtotal for this item
        const itemTotal = calculateItemTotal(item.price, item.quantity);
        totalGold += itemTotal.gold;
        totalSilver += itemTotal.silver;
        totalCopper += itemTotal.copper;
        
        // Display subtotal
        const subtotal = formatPrice(itemTotal.gold, itemTotal.silver, itemTotal.copper);
        
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <strong>${item.name}</strong>
                    <div class="cart-item-price">${item.price} each</div>
                    <div class="cart-item-subtotal">Subtotal: ${subtotal}</div>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateCartQuantity('${item.key}', -1)" class="cart-qty-btn">−</button>
                    <span class="cart-qty">${item.quantity}</span>
                    <button onclick="updateCartQuantity('${item.key}', 1)" class="cart-qty-btn">+</button>
                    <button onclick="removeFromCart('${item.key}')" class="cart-remove-btn">🗑️</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Normalize the total (convert excess copper to silver, excess silver to gold)
    totalSilver += Math.floor(totalCopper / 10);
    totalCopper = totalCopper % 10;
    totalGold += Math.floor(totalSilver / 10);
    totalSilver = totalSilver % 10;
    
    // Display grand total
    const grandTotal = formatPrice(totalGold, totalSilver, totalCopper);
    html += `<div class="cart-total">
        <strong>Total:</strong> <span class="cart-total-price">${grandTotal}</span>
    </div>`;
    
    html += '<div class="cart-actions">';
    html += `<button onclick="clearCart()" class="btn-secondary">Clear Cart</button>`;
    html += `<button onclick="checkout()" class="btn-primary">Checkout</button>`;
    html += '</div>';
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');
}

function calculateItemTotal(priceStr, quantity) {
    // Parse price string like "5 gp", "3 sp", "10 cp", or "2 gp, 5 sp"
    let gold = 0, silver = 0, copper = 0;
    
    const gpMatch = priceStr.match(/(\d+)\s*gp/i);
    const spMatch = priceStr.match(/(\d+)\s*sp/i);
    const cpMatch = priceStr.match(/(\d+)\s*cp/i);
    
    if (gpMatch) gold = parseInt(gpMatch[1]);
    if (spMatch) silver = parseInt(spMatch[1]);
    if (cpMatch) copper = parseInt(cpMatch[1]);
    
    return {
        gold: gold * quantity,
        silver: silver * quantity,
        copper: copper * quantity
    };
}

function formatPrice(gold, silver, copper) {
    const parts = [];
    if (gold > 0) parts.push(`${gold} gp`);
    if (silver > 0) parts.push(`${silver} sp`);
    if (copper > 0) parts.push(`${copper} cp`);
    return parts.length > 0 ? parts.join(', ') : '0 cp';
}

function clearCart() {
    if (confirm('Clear all items from cart?')) {
        state.cart = [];
        updateCartDisplay();
        showCart();
    }
}

function checkout() {
    if (state.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Calculate total cost
    let totalGold = 0;
    let totalSilver = 0;
    let totalCopper = 0;
    
    state.cart.forEach(item => {
        const itemTotal = calculateItemTotal(item.price, item.quantity);
        totalGold += itemTotal.gold;
        totalSilver += itemTotal.silver;
        totalCopper += itemTotal.copper;
    });
    
    // Normalize currency
    totalSilver += Math.floor(totalCopper / 10);
    totalCopper = totalCopper % 10;
    totalGold += Math.floor(totalSilver / 10);
    totalSilver = totalSilver % 10;
    
    // Convert player's bank balance to copper for comparison
    const playerCopper = (state.bank.gold * 100) + (state.bank.silver * 10) + state.bank.copper;
    const costCopper = (totalGold * 100) + (totalSilver * 10) + totalCopper;
    
    if (costCopper > playerCopper) {
        alert(`Insufficient funds!\n\nTotal Cost: ${formatPrice(totalGold, totalSilver, totalCopper)}\nYour Balance: ${formatPrice(state.bank.gold, state.bank.silver, state.bank.copper)}`);
        return;
    }
    
    // Deduct from balance
    let remainingCopper = playerCopper - costCopper;
    
    state.bank.copper = remainingCopper % 10;
    remainingCopper = Math.floor(remainingCopper / 10);
    state.bank.silver = remainingCopper % 10;
    state.bank.gold = Math.floor(remainingCopper / 10);
    
    // Save to localStorage and character database
    saveBankToLocalStorage();
    if (state.currentCharacter && state.currentCharacter.bank) {
        state.currentCharacter.bank = { ...state.bank };
    }
    
    const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPaid = formatPrice(totalGold, totalSilver, totalCopper);
    
    // Clear cart
    state.cart = [];
    updateCartDisplay();
    updateBankDisplay();
    
    // Close modal
    const modal = document.getElementById('searchModal');
    if (modal) modal.classList.add('hidden');
    
    showCartNotification(`✅ Purchase complete! Paid ${totalPaid} for ${itemCount} item(s).`);
}

function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// ===== Bank Management =====
function updateBankDisplay() {
    const bankBtn = document.getElementById('bankButton');
    if (bankBtn) {
        const balance = formatPrice(state.bank.gold, state.bank.silver, state.bank.copper);
        bankBtn.textContent = `💰 ${balance}`;
    }
}

function showBank() {
    const balance = formatPrice(state.bank.gold, state.bank.silver, state.bank.copper);
    
    let html = '<h2>💰 Bank Account</h2>';
    html += '<div class="bank-info">';
    html += `<div class="bank-balance">
        <strong>Current Balance:</strong>
        <div class="bank-balance-amount">${balance}</div>
    </div>`;
    html += '</div>';
    
    html += '<div class="bank-deposit">';
    html += '<h3>Deposit Funds</h3>';
    html += '<div class="bank-form">';
    html += '<div class="currency-input">';
    html += '<label>Gold: <input type="number" id="depositGold" min="0" value="0" /></label>';
    html += '<label>Silver: <input type="number" id="depositSilver" min="0" value="0" /></label>';
    html += '<label>Copper: <input type="number" id="depositCopper" min="0" value="0" /></label>';
    html += '</div>';
    html += '<button onclick="depositFunds()" class="btn-primary">Deposit</button>';
    html += '</div>';
    html += '</div>';
    
    html += '<div class="bank-withdraw">';
    html += '<h3>Withdraw Funds</h3>';
    html += '<div class="bank-form">';
    html += '<div class="currency-input">';
    html += '<label>Gold: <input type="number" id="withdrawGold" min="0" value="0" /></label>';
    html += '<label>Silver: <input type="number" id="withdrawSilver" min="0" value="0" /></label>';
    html += '<label>Copper: <input type="number" id="withdrawCopper" min="0" value="0" /></label>';
    html += '</div>';
    html += '<button onclick="withdrawFunds()" class="btn-secondary">Withdraw</button>';
    html += '</div>';
    html += '</div>';
    
    const modal = document.getElementById('searchModal');
    document.getElementById('searchResults').innerHTML = html;
    modal.classList.remove('hidden');
}

function depositFunds() {
    const gold = parseInt(document.getElementById('depositGold').value) || 0;
    const silver = parseInt(document.getElementById('depositSilver').value) || 0;
    const copper = parseInt(document.getElementById('depositCopper').value) || 0;
    
    if (gold === 0 && silver === 0 && copper === 0) {
        alert('Please enter an amount to deposit.');
        return;
    }
    
    state.bank.gold += gold;
    state.bank.silver += silver;
    state.bank.copper += copper;
    
    // Normalize currency
    state.bank.silver += Math.floor(state.bank.copper / 10);
    state.bank.copper = state.bank.copper % 10;
    state.bank.gold += Math.floor(state.bank.silver / 10);
    state.bank.silver = state.bank.silver % 10;
    
    // Save to localStorage and character
    saveBankToLocalStorage();
    if (state.currentCharacter && state.currentCharacter.bank) {
        state.currentCharacter.bank = { ...state.bank };
    }
    
    updateBankDisplay();
    showBank();
    showCartNotification(`✅ Deposited ${formatPrice(gold, silver, copper)}`);
}

function withdrawFunds() {
    const gold = parseInt(document.getElementById('withdrawGold').value) || 0;
    const silver = parseInt(document.getElementById('withdrawSilver').value) || 0;
    const copper = parseInt(document.getElementById('withdrawCopper').value) || 0;
    
    if (gold === 0 && silver === 0 && copper === 0) {
        alert('Please enter an amount to withdraw.');
        return;
    }
    
    // Convert to copper for comparison
    const withdrawCopper = (gold * 100) + (silver * 10) + copper;
    const bankCopper = (state.bank.gold * 100) + (state.bank.silver * 10) + state.bank.copper;
    
    if (withdrawCopper > bankCopper) {
        alert('Insufficient funds!');
        return;
    }
    
    // Deduct from balance
    let remainingCopper = bankCopper - withdrawCopper;
    
    state.bank.copper = remainingCopper % 10;
    remainingCopper = Math.floor(remainingCopper / 10);
    state.bank.silver = remainingCopper % 10;
    state.bank.gold = Math.floor(remainingCopper / 10);
    
    // Save to localStorage and character
    saveBankToLocalStorage();
    if (state.currentCharacter && state.currentCharacter.bank) {
        state.currentCharacter.bank = { ...state.bank };
    }
    
    updateBankDisplay();
    showBank();
    showCartNotification(`✅ Withdrew ${formatPrice(gold, silver, copper)}`);
}

// ===== Dice Roller =====
function injectDiceTray() {
    if (document.getElementById('diceTray')) return;
    const tray = document.createElement('div');
    tray.id = 'diceTray';
    tray.innerHTML = `
      <div class="dice-header">
        <span>Dice</span>
        <div class="mode">
          <button class="mode-btn" data-mode="normal" title="Normal (N)">N</button>
          <button class="mode-btn" data-mode="adv" title="Advantage (A)">Adv</button>
          <button class="mode-btn" data-mode="dis" title="Disadvantage (D)">Dis</button>
        </div>
      </div>
      <div class="dice-buttons">
        ${[4,6,8,10,12,20,100].map(s=>`<button class="die" data-sides="${s}">d${s}</button>`).join('')}
      </div>
      <div class="dice-custom">
        <input id="diceFormula" placeholder="e.g., 2d6+3" />
        <button id="rollCustom">Roll</button>
      </div>
      <div class="dice-log" id="diceLog"></div>
    `;
    document.body.appendChild(tray);
    updateDiceModeButtons();
    tray.querySelectorAll('.die').forEach(btn => btn.addEventListener('click', () => {
        const sides = parseInt(btn.getAttribute('data-sides'),10);
        if (sides === 20) rollFromFormula('1d20'); else rollFromFormula(`1d${sides}`);
    }));
    tray.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => {
        setDiceMode(btn.getAttribute('data-mode'));
    }));
    const rollBtn = tray.querySelector('#rollCustom');
    const input = tray.querySelector('#diceFormula');
    rollBtn.addEventListener('click', () => rollFromFormula(input.value || '1d20'));
    input.addEventListener('keypress', (e) => { if (e.key==='Enter') rollFromFormula(input.value||'1d20'); });
}

function setDiceMode(mode) {
    state.dice.mode = ['normal','adv','dis'].includes(mode) ? mode : 'normal';
    updateDiceModeButtons();
}

function updateDiceModeButtons() {
    document.querySelectorAll('#diceTray .mode-btn').forEach(btn => {
        const active = btn.getAttribute('data-mode') === state.dice.mode;
        btn.classList.toggle('active', active);
    });
}

function rollFromFormula(formula) {
    const f = (formula || '1d20').toLowerCase().replace(/\s+/g, '');
    const m = f.match(/^(\d*)d(\d+)([+\-]\d+)?$/);
    if (!m) return logDice(`❓ Invalid formula: ${formula}`);
    const n = parseInt(m[1] || '1', 10);
    const sides = parseInt(m[2], 10);
    const mod = parseInt(m[3] || '0', 10);
    rollDice(n, sides, mod, state.dice.mode);
}

function rollDice(n, sides, mod = 0, mode = 'normal') {
    const results = [];
    if ((mode === 'adv' || mode === 'dis') && n === 1 && sides === 20) {
        const a = rollDie(20); const b = rollDie(20);
        const picked = mode === 'adv' ? Math.max(a,b) : Math.min(a,b);
        const total = picked + mod;
        logDice(`d20 ${mode === 'adv' ? 'adv' : 'dis'}: [${a}, ${b}] ⇒ ${picked}${mod?` ${mod>=0?'+':''}${mod}`:''} = <strong>${total}</strong>`);
        return;
    }
    for (let i=0; i<n; i++) results.push(rollDie(sides));
    const sum = results.reduce((a,b)=>a+b,0);
    const total = sum + mod;
    logDice(`${n}d${sides}${mod?` ${mod>=0?'+':''}${mod}`:''}: [${results.join(', ')}] = <strong>${total}</strong>`);
}

function rollDie(sides) { return 1 + Math.floor(Math.random() * sides); }

function logDice(message) {
    state.dice.history.unshift({ t: Date.now(), msg: message });
    state.dice.history = state.dice.history.slice(0, 10);
    const log = document.getElementById('diceLog');
    if (log) {
        log.innerHTML = state.dice.history.map(h => `<div class="dice-line">${h.msg}</div>`).join('');
    }
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
    if (!sidebar) { return; }
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
        state.searchIndex.push({
            type: 'Quest',
            title: quest.name,
            content: `${quest.description} ${quest.objectives.join(' ')}`,
            data: quest,
            showFunction: () => { switchTab('quests'); }
        });
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

// ===== Dice Roller =====
const diceState = {
    mode: 'normal', // 'normal', 'adv', 'dis'
    history: []
};

function renderDiceRoller() {
    return `
        <div class="dice-roller-container">
            <div class="dice-page-header">
                <h2>🎲 Dice Roller</h2>
                <p style="color: var(--text-muted); font-style: italic; margin-top: 0.5rem;">Roll the bones and let fate decide</p>
            </div>

            <div class="dice-mode-selector">
                <button class="dice-mode-btn active" data-mode="normal">Normal</button>
                <button class="dice-mode-btn" data-mode="adv">Advantage</button>
                <button class="dice-mode-btn" data-mode="dis">Disadvantage</button>
            </div>

            <div class="dice-grid">
                <button class="dice-btn" data-sides="4">d4</button>
                <button class="dice-btn" data-sides="6">d6</button>
                <button class="dice-btn" data-sides="8">d8</button>
                <button class="dice-btn" data-sides="10">d10</button>
                <button class="dice-btn" data-sides="12">d12</button>
                <button class="dice-btn" data-sides="20">d20</button>
                <button class="dice-btn" data-sides="100">d100</button>
            </div>

            <div class="custom-roll-section">
                <h3>✨ Custom Formula</h3>
                <div class="custom-roll-input">
                    <input type="text" id="customFormula" placeholder="e.g., 2d6+3, 4d8-2, 1d20+5" />
                    <button id="rollCustomBtn">Roll</button>
                </div>
                <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.9rem;">
                    Examples: 2d6+3, 4d8-2, 1d20+5, 8d6
                </p>
            </div>

            <div class="dice-history">
                <h3 style="color: var(--accent-gold); margin-bottom: 1rem; font-family: 'Cinzel', serif;">📜 Roll History</h3>
                <div id="historyLog">
                    <div class="dice-history-empty">
                        No rolls yet. Click a die to get started!
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initializeDiceRoller() {
    // Reset dice state when loading the tab
    diceState.history = [];
    
    // Mode buttons
    document.querySelectorAll('.dice-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setDiceMode(mode);
        });
    });

    // Dice buttons
    document.querySelectorAll('.dice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sides = parseInt(btn.dataset.sides, 10);
            rollDice(1, sides, 0);
        });
    });

    // Custom formula
    const customInput = document.getElementById('customFormula');
    const rollBtn = document.getElementById('rollCustomBtn');
    
    if (rollBtn) {
        rollBtn.addEventListener('click', () => {
            rollCustomFormula(customInput.value);
        });
    }

    if (customInput) {
        customInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                rollCustomFormula(customInput.value);
            }
        });
    }
}

function setDiceMode(mode) {
    diceState.mode = mode;
    
    // Update button states
    document.querySelectorAll('.dice-mode-btn').forEach(btn => {
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function rollCustomFormula(formula) {
    if (!formula || !formula.trim()) {
        rollDice(1, 20, 0);
        return;
    }

    const f = formula.toLowerCase().replace(/\s+/g, '');
    const match = f.match(/^(\d*)d(\d+)([+\-]\d+)?$/);
    
    if (!match) {
        addToHistory({
            formula: formula,
            error: true,
            message: '❓ Invalid formula. Use format like: 2d6+3'
        });
        return;
    }

    const count = parseInt(match[1] || '1', 10);
    const sides = parseInt(match[2], 10);
    const modifier = parseInt(match[3] || '0', 10);

    rollDice(count, sides, modifier);
}

function rollDice(count, sides, modifier = 0) {
    const mode = diceState.mode;
    
    // Handle advantage/disadvantage for d20
    if ((mode === 'adv' || mode === 'dis') && count === 1 && sides === 20) {
        const roll1 = rollSingleDie(20);
        const roll2 = rollSingleDie(20);
        const selected = mode === 'adv' ? Math.max(roll1, roll2) : Math.min(roll1, roll2);
        const total = selected + modifier;

        addToHistory({
            formula: `1d20 (${mode === 'adv' ? 'Advantage' : 'Disadvantage'})${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''}`,
            rolls: [roll1, roll2],
            selected: selected,
            modifier: modifier,
            total: total,
            mode: mode
        });
        return;
    }

    // Normal roll
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(rollSingleDie(sides));
    }

    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + modifier;

    addToHistory({
        formula: `${count}d${sides}${modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : ''}`,
        rolls: rolls,
        modifier: modifier,
        total: total,
        mode: 'normal'
    });
}

function rollSingleDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function addToHistory(entry) {
    entry.timestamp = new Date();
    diceState.history.unshift(entry);
    
    // Keep only last 20 rolls
    if (diceState.history.length > 20) {
        diceState.history = diceState.history.slice(0, 20);
    }

    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyLog = document.getElementById('historyLog');
    
    if (!historyLog) return;
    
    if (diceState.history.length === 0) {
        historyLog.innerHTML = `
            <div class="dice-history-empty">
                No rolls yet. Click a die to get started!
            </div>
        `;
        return;
    }

    historyLog.innerHTML = diceState.history.map(entry => {
        if (entry.error) {
            return `
                <div class="dice-roll-entry">
                    <div style="color: var(--text-muted);">${entry.formula}</div>
                    <div style="color: #ff6b6b; margin-top: 0.5rem;">${entry.message}</div>
                </div>
            `;
        }

        let rollsDisplay = '';
        if (entry.mode === 'adv' || entry.mode === 'dis') {
            const kept = entry.selected;
            const dropped = entry.rolls.find(r => r !== kept) || entry.rolls[1];
            rollsDisplay = `[<span style="color: var(--accent-gold); font-weight: 700;">${kept}</span>, <span style="opacity: 0.5; text-decoration: line-through;">${dropped}</span>]`;
        } else {
            rollsDisplay = `[${entry.rolls.join(', ')}]`;
        }

        const modifierDisplay = entry.modifier !== 0 
            ? ` ${entry.modifier >= 0 ? '+' : ''}${entry.modifier}` 
            : '';

        const isCrit = entry.rolls.some(r => r === 20) && entry.formula.includes('d20');
        const isFail = entry.rolls.some(r => r === 1) && entry.formula.includes('d20');

        let resultColor = 'var(--text-gold)';
        let resultPrefix = '';
        if (isCrit) {
            resultColor = '#4caf50';
            resultPrefix = '🎉 CRITICAL! ';
        } else if (isFail) {
            resultColor = '#ff6b6b';
            resultPrefix = '💀 CRITICAL FAIL! ';
        }

        return `
            <div class="dice-roll-entry">
                <div style="color: var(--accent-purple); font-weight: 600;">
                    ${entry.formula}
                </div>
                <div style="margin-top: 0.5rem; color: var(--text-primary);">
                    ${rollsDisplay}${modifierDisplay}
                </div>
                <div class="dice-roll-result" style="color: ${resultColor};">
                    ${resultPrefix}Total: ${entry.total}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Restock Countdown Timer =====
let restockInterval = null;

function startRestockCountdown() {
    // Clear any existing interval
    if (restockInterval) {
        clearInterval(restockInterval);
    }
    
    // Update immediately
    updateRestockCountdown();
    
    // Update every second
    restockInterval = setInterval(updateRestockCountdown, 1000);
}

function updateRestockCountdown() {
    const countdownElement = document.getElementById('restockCountdown');
    if (!countdownElement) {
        // Element not found, clear interval
        if (restockInterval) {
            clearInterval(restockInterval);
            restockInterval = null;
        }
        return;
    }
    
    // Calculate time until next midnight UTC
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    
    if (diff <= 0) {
        countdownElement.textContent = 'Restocking...';
        countdownElement.classList.add('restock-imminent');
        
        // Auto-clear cart on restock
        if (state.cart.length > 0) {
            const itemCount = state.cart.length;
            state.cart = [];
            updateCartDisplay();
            showCartNotification(`🔄 Market restocked! ${itemCount} item(s) removed from cart.`);
        }
        
        // Reload market view to show new stock
        if (state.currentTab === 'market') {
            setTimeout(() => {
                document.getElementById('contentArea').innerHTML = renderMarket();
                startRestockCountdown();
            }, 2000);
        }
        
        return;
    }
    
    // Calculate hours, minutes, seconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Format with leading zeros
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    const secondsStr = String(seconds).padStart(2, '0');
    
    countdownElement.textContent = `${hoursStr}:${minutesStr}:${secondsStr}`;
    
    // Add visual feedback when close to restock
    if (hours === 0 && minutes < 5) {
        countdownElement.classList.add('restock-soon');
        
        // Warning notification at 5 minutes
        if (minutes === 4 && seconds === 59 && state.cart.length > 0) {
            showCartNotification('⚠️ Market restocks in 5 minutes! Your cart will be cleared.');
        }
    } else {
        countdownElement.classList.remove('restock-soon');
    }
}

// ===== Utility Functions =====
// Wait to log until after login
function logSuccess() {
    console.log('🎲 Darcnia Campaign Reference loaded successfully!');
    console.log('📚 Search index built with', state.searchIndex.length, 'items');
    console.log('⚔️ Playing as:', state.currentCharacter?.name);
    console.log('🔑 Access level:', state.accessLevel);
}

