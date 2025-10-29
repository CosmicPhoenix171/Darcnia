// ===== Configuration =====
const CONFIG = {
    campaignPath: '../', // Path to campaign files
    playerAccessible: {
        // Define what players can access (DM sections excluded)
        guilds: true,
        npcs: ['eldonthorne', 'lyrawindfern'], // Only specific NPCs (not Sophia secrets)
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
        relationships: ['Eldon Thorne', 'Lyra Windfern'],
        knownLocations: ['Guild Crystalia Hall', 'Heart Plaza', 'Hearthstone Inn'],
        knownGuilds: ['Guild Crystalia', 'The Crimson Vanguard', "Merchants' Concord", 'City Watch'],
        completedQuests: ['Missing Cat'],
        activeQuests: ['Shadows in the Basement'],
        knownSecrets: [],
        accessLevel: 'player',
        discoveredHandouts: ['Tavern Rumors', 'Guild Job Board', 'Thug Note']
    },
    'dm': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'), // Default DM password: dmpass2025
        accessLevel: 'dm',
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all'
    },
    'dungeon master': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'), // Default DM password: dmpass2025
        accessLevel: 'dm',
        knownGuilds: 'all',
        knownLocations: 'all',
        knownSecrets: 'all',
        discoveredHandouts: 'all'
    }
};

// ===== State Management =====
const state = {
    currentTab: 'overview',
    theme: 'dark',
    content: {},
    searchIndex: [],
    currentCharacter: null,
    accessLevel: 'guest'
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
                    <li><strong>Items</strong> - Browse equipment and magic items</li>
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
            id: 'lyra-windfern',
            name: 'Lyra Windfern',
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
                        'Reception desk (Lyra\'s domain)',
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
            npcs: ['Eldon Thorne', 'Lyra Windfern'],
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
    initializeLogin();
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
    loadContent('overview');
    
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
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('searchModal').addEventListener('click', (e) => {
        if (e.target.id === 'searchModal') closeModal();
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
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
        case 'items':
            contentArea.innerHTML = renderItems();
            break;
        case 'quests':
            contentArea.innerHTML = renderQuests();
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
    let html = '<h2>📜 Available Quests</h2>';
    html += contentData.quests.map(quest => `
        <div class="card">
            <h3>${quest.name}</h3>
            <div class="card-meta">
                <strong>Level:</strong> ${quest.level} | 
                <strong>Reward:</strong> ${quest.reward}
            </div>
            <p><strong>Quest Giver:</strong> ${quest.giver}</p>
            <p>${quest.description}</p>
            <h4>Objectives:</h4>
            <ul>${quest.objectives.map(obj => `<li>${obj}</li>`).join('')}</ul>
            <div class="card-tags">
                <span class="tag">${quest.status}</span>
            </div>
        </div>
    `).join('');
    return html;
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
    html += '<p>What you\'ve learned about the world.</p>';
    html += contentData.lore.map(lore => `
        <div class="card">
            <h3>${lore.title}</h3>
            <div class="card-meta">${lore.category}</div>
            ${lore.content}
        </div>
    `).join('');
    return html;
}

// ===== Sidebar =====
function updateSidebar(tab) {
    const sidebar = document.querySelector('.quick-links');
    let links = [];
    
    switch(tab) {
        case 'guilds':
            links = [
                { text: 'Guild Crystalia (Your Guild)', action: () => showGuildDetail('guild-crystalia') },
                { text: 'Crimson Vanguard', action: () => showGuildDetail('crimson-vanguard') },
                { text: 'Hearthkeepers', action: () => showGuildDetail('hearthkeepers') },
                { text: 'All Guilds', action: () => switchTab('guilds') }
            ];
            break;
        case 'npcs':
            links = [
                { text: 'Eldon Thorne', action: () => showNPCDetail('eldon-thorne') },
                { text: 'Lyra Windfern', action: () => showNPCDetail('lyra-windfern') }
            ];
            break;
        default:
            links = [
                { text: 'Overview', action: () => switchTab('overview') },
                { text: 'Your Guild', action: () => showGuildDetail('guild-crystalia') },
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
    
    // Index guilds (respect access)
    contentData.guilds.forEach(guild => {
        if (hasAccess('guild', guild.name)) {
            state.searchIndex.push({
                type: 'Guild',
                title: guild.name,
                content: `${guild.motto} ${guild.description} ${guild.keyInfo.join(' ')}`,
                data: guild,
                showFunction: () => showGuildDetail(guild.id)
            });
        }
    });
    
    // Index NPCs (respect access)
    contentData.npcs.forEach(npc => {
        if (hasAccess('npc', npc.name)) {
            state.searchIndex.push({
                type: 'NPC',
                title: npc.name,
                content: `${npc.title} ${npc.personality} ${npc.role}`,
                data: npc,
                showFunction: () => showNPCDetail(npc.id)
            });
        }
    });
    
    // Index locations (respect access)
    contentData.locations.forEach(loc => {
        if (hasAccess('location', loc.name)) {
            state.searchIndex.push({
                type: 'Location',
                title: loc.name,
                content: `${loc.description} ${loc.features ? loc.features.join(' ') : ''}`,
                data: loc,
                showFunction: () => { switchTab('locations'); }
            });
        }
    });
    
    // Index items, quests, etc. (items and quests are generally accessible)
    contentData.items.forEach(item => {
        state.searchIndex.push({
            type: 'Item',
            title: item.name,
            content: item.description,
            data: item,
            showFunction: () => { switchTab('items'); }
        });
    });
    
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
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    const loginError = document.getElementById('loginError');
    
    // Check for saved session
    const savedCharacter = localStorage.getItem('darcnia_character');
    const savedToken = localStorage.getItem('darcnia_token');
    if (savedCharacter && savedToken) {
        const characterData = JSON.parse(savedCharacter);
        // Verify token is still valid
        const characterKey = characterData.name.toLowerCase();
        const dbCharacter = characterDatabase[characterKey];
        if (dbCharacter && dbCharacter.password === savedToken) {
            loginCharacter(characterData);
            return;
        } else {
            // Invalid session, clear it
            localStorage.removeItem('darcnia_character');
            localStorage.removeItem('darcnia_token');
        }
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginError.style.display = 'none';
        
        const characterName = document.getElementById('characterName').value.trim();
        const password = document.getElementById('characterPassword').value;
        
        if (!characterName || !password) {
            showLoginError('Please enter both character name and password');
            return;
        }
        
        const characterKey = characterName.toLowerCase();
        const characterData = characterDatabase[characterKey];
        
        if (characterData) {
            // Check password
            const passwordHash = simpleHash(password);
            if (characterData.password === passwordHash) {
                // Correct password - save to localStorage with token
                localStorage.setItem('darcnia_character', JSON.stringify(characterData));
                localStorage.setItem('darcnia_token', passwordHash);
                loginCharacter(characterData);
            } else {
                showLoginError('❌ Incorrect password. Please try again.');
            }
        } else {
            showLoginError(`❌ Character "${characterName}" not found. Contact your DM to create a character.`);
        }
    });
}

function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    loginError.textContent = message;
    loginError.style.display = 'block';
    
    // Shake the form
    const loginContainer = document.querySelector('.login-container');
    loginContainer.style.animation = 'none';
    setTimeout(() => {
        loginContainer.style.animation = 'fadeIn 0.5s ease-in';
    }, 10);
}

function loginCharacter(characterData) {
    state.currentCharacter = characterData;
    state.accessLevel = characterData.accessLevel || 'guest';
    
    // Hide login, show main app
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // Update UI
    updateCharacterBadge();
    displayCharacterInfo();
    
    // Initialize the rest of the app
    initializeApp();
}

function updateCharacterBadge() {
    const badge = document.getElementById('characterBadge');
    const character = state.currentCharacter;
    
    if (character.accessLevel === 'dm') {
        badge.textContent = '👑 ' + character.name;
        badge.style.background = 'var(--accent-secondary)';
    } else {
        badge.textContent = '⚔️ ' + character.name;
    }
}

function displayCharacterInfo() {
    const infoBanner = document.getElementById('characterInfo');
    const character = state.currentCharacter;
    
    if (character.accessLevel === 'dm') {
        infoBanner.innerHTML = `
            <div class="access-notice dm-access">
                <strong>👑 Dungeon Master Mode</strong><br>
                You have full access to all content, including DM secrets and hidden information.
            </div>
        `;
        infoBanner.classList.add('visible');
        return;
    }
    
    if (!character.class) {
        // Guest character
        infoBanner.innerHTML = `
            <div class="access-notice">
                <strong>👋 Welcome, ${character.name}!</strong><br>
                You have limited access. Contact your DM to add your full character details for personalized content.
            </div>
        `;
        infoBanner.classList.add('visible');
        return;
    }
    
    // Full character display
    let html = `
        <h3>⚔️ ${character.name}</h3>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Race</div>
                <div class="info-value">${character.race || 'Unknown'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Class</div>
                <div class="info-value">${character.class || 'Unknown'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Guild</div>
                <div class="info-value">${character.guild || 'None'}</div>
            </div>
        </div>
    `;
    
    if (character.activeQuests && character.activeQuests.length > 0) {
        html += `
            <div class="access-notice">
                <strong>📜 Active Quests:</strong> ${character.activeQuests.join(', ')}
            </div>
        `;
    }
    
    infoBanner.innerHTML = html;
    infoBanner.classList.add('visible');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('darcnia_character');
        localStorage.removeItem('darcnia_token');
        location.reload();
    }
}

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

