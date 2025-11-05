// ===== D&D 2024 Character Sheet JavaScript =====

// ===== XP to Level Conversion Table (D&D 5e/2024) =====
const XP_TABLE = [
    { level: 1, xp: 0, next: 300 },
    { level: 2, xp: 300, next: 600 },
    { level: 3, xp: 900, next: 1800 },
    { level: 4, xp: 2700, next: 3800 },
    { level: 5, xp: 6500, next: 5100 },
    { level: 6, xp: 14000, next: 9000 },
    { level: 7, xp: 23000, next: 11000 },
    { level: 8, xp: 34000, next: 14000 },
    { level: 9, xp: 48000, next: 16000 },
    { level: 10, xp: 64000, next: 21000 },
    { level: 11, xp: 85000, next: 15000 },
    { level: 12, xp: 100000, next: 20000 },
    { level: 13, xp: 120000, next: 20000 },
    { level: 14, xp: 140000, next: 25000 },
    { level: 15, xp: 165000, next: 30000 },
    { level: 16, xp: 195000, next: 30000 },
    { level: 17, xp: 225000, next: 40000 },
    { level: 18, xp: 265000, next: 40000 },
    { level: 19, xp: 305000, next: 50000 },
    { level: 20, xp: 355000, next: 0 }
];

function calculateLevelFromXP(xp) {
    xp = parseInt(xp) || 0;
    let level = 1;
    let xpToNext = 300;
    
    for (let i = XP_TABLE.length - 1; i >= 0; i--) {
        if (xp >= XP_TABLE[i].xp) {
            level = XP_TABLE[i].level;
            xpToNext = XP_TABLE[i].next;
            break;
        }
    }
    
    return { level, xpToNext };
}

function updateLevelFromXP() {
    const xpInput = document.getElementById('experiencePoints');
    const xp = parseInt(xpInput.value) || 0;
    const { level, xpToNext } = calculateLevelFromXP(xp);
    
    // Update level pill
    const levelPill = document.getElementById('levelPill');
    if (levelPill) {
        levelPill.textContent = `Lvl ${level}`;
    }
    
    // Update XP to next level display
    const xpNextDisplay = document.getElementById('xpToNext');
    if (xpNextDisplay) {
        if (level >= 20) {
            xpNextDisplay.textContent = '(Max Level)';
        } else {
            xpNextDisplay.textContent = `/ ${xpToNext.toLocaleString()} to next level`;
        }
    }
    
    // Update character data
    characterData.level = level;
    
    // Update proficiency bonus based on level
    const profBonus = Math.floor((level - 1) / 4) + 2;
    const profBonusInput = document.getElementById('proficiencyBonus');
    if (profBonusInput) {
        profBonusInput.value = profBonus;
    }
    const profBonusDisplay = document.getElementById('profBonusDisplay');
    if (profBonusDisplay) {
        profBonusDisplay.textContent = `+${profBonus}`;
    }
    characterData.proficiencyBonus = profBonus;
    
    // Recalculate all stats with new level
    calculateAllStats();
    updateSummaryHeader();
}

// ===== Firebase Configuration =====
const firebaseConfig = {
    apiKey: "AIzaSyDPJBVFRpDeT06syTehuGPep5zIIoac1L0",
    authDomain: "dnd-5e-e1ad1.firebaseapp.com",
    databaseURL: "https://dnd-5e-e1ad1-default-rtdb.firebaseio.com",
    projectId: "dnd-5e-e1ad1",
    storageBucket: "dnd-5e-e1ad1.firebasestorage.app",
    messagingSenderId: "630611257093",
    appId: "1:630611257093:web:5fafca4be805d4679bb96c",
    measurementId: "G-Y4Y25TDECL"
};

// Initialize Firebase
let database = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('✅ Firebase initialized for Character Sheet');
    }
} catch (error) {
    console.warn('⚠️ Firebase not available, using localStorage fallback');
}

// Current logged-in character
let currentCharacterName = null;
let firebaseListener = null;
let isUpdatingFromFirebase = false;

// ===== Character Database & Login System =====
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

const characterDatabase = {
    'nyra vex': {
        name: 'Nyra Vex',
        password: simpleHash('rogue123'),
        race: 'Human',
        class: 'Rogue',
        guild: 'Guild Crystalia',
        accessLevel: 'player',
        bank: { gold: 0, silver: 0, copper: 0 }
    },
    'dm': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'),
        accessLevel: 'dm',
        bank: { gold: 9999, silver: 99, copper: 99 }
    },
    'dungeon master': {
        name: 'Dungeon Master',
        password: simpleHash('dmpass2025'),
        accessLevel: 'dm',
        bank: { gold: 9999, silver: 99, copper: 99 }
    }
};

// Character data structure
let characterData = {
    // Identity
    characterName: '',
    level: 1,
    class: '',
    background: '',
    species: '',
    alignment: '',
    experiencePoints: 0,
    
    // Ability Scores
    abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10
    },
    
    // Proficiency & Inspiration
    proficiencyBonus: 2,
    inspiration: false,
    
    // Saving Throws
    saveProficiencies: {
        str: false,
        dex: false,
        con: false,
        int: false,
        wis: false,
        cha: false
    },
    
    // Skills
    skillProficiencies: {
        athletics: false,
        acrobatics: false,
        sleightOfHand: false,
        stealth: false,
        arcana: false,
        history: false,
        investigation: false,
        nature: false,
        religion: false,
        animalHandling: false,
        insight: false,
        medicine: false,
        perception: false,
        survival: false,
        deception: false,
        intimidation: false,
        performance: false,
        persuasion: false
    },
    
    // Combat Stats
    armorClass: 10,
    initiative: 0,
    speed: '30 ft',
    hpMax: 0,
    hpCurrent: 0,
    hpTemp: 0,
    hitDice: '',
    hitDiceUsed: 0,
    
    // Death Saves
    deathSaves: {
        successes: [false, false, false],
        failures: [false, false, false]
    },
    
    // Combat & Equipment
    attacks: '', // legacy free-text
    weapons: [], // structured attacks list
    inventory: [],
    coins: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
    equipment: '',
    
    // Attunement
    attunement: [
        { attuned: false, item: '' },
        { attuned: false, item: '' },
        { attuned: false, item: '' }
    ],
    
    // Personality & Traits
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    
    // Features & Proficiencies
    classFeatures: '',
    proficiencies: '',
    
    // Spellcasting
    spellcastingAbility: '',
    spellSaveDC: 0,
    spellAttackBonus: '',
    spellSlots: {
        1: { current: 0, max: 0 },
        2: { current: 0, max: 0 },
        3: { current: 0, max: 0 },
        4: { current: 0, max: 0 },
        5: { current: 0, max: 0 },
        6: { current: 0, max: 0 },
        7: { current: 0, max: 0 },
        8: { current: 0, max: 0 },
        9: { current: 0, max: 0 }
    },
    spellList: '',
    
    // Notes
    notes: '',

    // Right sidebar widgets
    resistances: '',
    conditions: '',
    senses: '',
    conditionFlags: {},

    // Portrait
    portraitUrl: ''
};

// Skill to ability mapping
const skillAbilities = {
    athletics: 'str',
    acrobatics: 'dex',
    sleightOfHand: 'dex',
    stealth: 'dex',
    arcana: 'int',
    history: 'int',
    investigation: 'int',
    nature: 'int',
    religion: 'int',
    animalHandling: 'wis',
    insight: 'wis',
    medicine: 'wis',
    perception: 'wis',
    survival: 'wis',
    deception: 'cha',
    intimidation: 'cha',
    performance: 'cha',
    persuasion: 'cha'
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initializeSheet();
    setupEventListeners();
    checkLoggedInCharacter();
    initTabs();
    calculateAllStats();
    updateSummaryHeader();
    initWeaponsTable();
    initInventoryTable();
    initConditions();
    initPortrait();
    initAutoSlots();
});

// ===== Tabs: Inventory / Notes / Spells =====
function initTabs() {
    const tabs = document.querySelectorAll('.sheet-tab');
    if (!tabs || tabs.length === 0) return;

    let saved = localStorage.getItem('characterSheetActiveTab') || 'combat';

    // Migrate old saved value of 'all' (removed) to 'inventory'
    if (saved === 'all') saved = 'inventory';

    // Ensure saved corresponds to an existing tab; fallback to inventory
    const matchingTab = Array.from(tabs).find(t => t.dataset.tab === saved) || tabs[0];

    // Set active class on matching tab and apply its panels
    tabs.forEach(t => t.classList.toggle('tab-active', t === matchingTab));
    applyTab(matchingTab.dataset.tab);

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const name = tab.dataset.tab;
            applyTab(name);
            localStorage.setItem('characterSheetActiveTab', name);

            // Update active class
            tabs.forEach(t => t.classList.toggle('tab-active', t === tab));
        });
    });
}

function applyTab(name) {
    const panels = document.querySelectorAll('[data-panel]');
    if (!panels) return;

    if (name === 'all' || !name) {
        panels.forEach(p => p.classList.remove('hidden-by-tab'));
        return;
    }

    panels.forEach(p => {
        if (p.dataset.panel === name) {
            p.classList.remove('hidden-by-tab');
        } else {
            p.classList.add('hidden-by-tab');
        }
    });
}

function initializeSheet() {
    // Always use dark theme to match campaign site
    setTheme('dark');
}

function checkLoggedInCharacter() {
    // Check if user is logged in from main campaign page
    const savedCharacterName = localStorage.getItem('loggedInCharacter');
    
    if (savedCharacterName && characterDatabase[savedCharacterName]) {
        const character = characterDatabase[savedCharacterName];
        currentCharacterName = character.name;
        
        console.log(`📋 Loading character sheet for: ${currentCharacterName}`);
        
        // Update login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = `👤 ${character.name}`;
            loginBtn.classList.add('logged-in');
        }
        
        // Load from Firebase
        loadCharacterFromFirebase(currentCharacterName);
        setupFirebaseRealtimeSync(currentCharacterName);
    } else {
        console.log('📋 No character logged in, using local storage only');
        loadCharacterData();
    }
}

// ===== Firebase Functions =====
async function loadCharacterFromFirebase(characterName) {
    if (!database || !characterName) return;
    
    const sanitizedName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    try {
        const snapshot = await database.ref(`characters/${sanitizedName}/characterSheet`).once('value');
        const data = snapshot.val();
        if (data) {
            Object.assign(characterData, data);
            populateCharacterData(characterData);
            console.log(`📂 Loaded character sheet for ${characterName} from Firebase`);
        } else {
            console.log(`📄 No saved character sheet found for ${characterName}, starting fresh`);
            loadCharacterData(); // Load from localStorage if available
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        loadCharacterData(); // Fallback to localStorage
    }
}

function setupFirebaseRealtimeSync(characterName) {
    if (!database || !characterName) return;
    
    const sanitizedName = characterName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const characterRef = database.ref(`characters/${sanitizedName}/characterSheet`);
    
    // Remove any existing listener
    if (firebaseListener) {
        firebaseListener.off();
        firebaseListener = null;
    }
    
    // Set up real-time listener
    firebaseListener = characterRef;
    characterRef.on('value', (snapshot) => {
        if (isUpdatingFromFirebase) return; // Prevent update loops
        
        const data = snapshot.val();
        if (data) {
            isUpdatingFromFirebase = true;
            Object.assign(characterData, data);
            populateCharacterData(characterData);
            console.log('🔄 Character sheet synced from Firebase');
            
            // Reset flag after a short delay
            setTimeout(() => {
                isUpdatingFromFirebase = false;
            }, 100);
        }
    });
    
    console.log(`🔔 Real-time sync enabled for ${characterName}`);
}

async function saveCharacterToFirebase() {
    if (!database || !currentCharacterName || isUpdatingFromFirebase) return;
    
    const sanitizedName = currentCharacterName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const data = gatherCharacterData();
    
    try {
        console.log(`💾 Saving character sheet with level ${data.level} to Firebase for ${currentCharacterName}`);
        await database.ref(`characters/${sanitizedName}/characterSheet`).set(data);
        // Also update level in main character node for market access
        await database.ref(`characters/${sanitizedName}/level`).set(data.level || 1);
        console.log(`✅ Character sheet saved to Firebase for ${currentCharacterName}`);
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}

// ===== Login/Logout Functions (Modal-based like main page) =====
function showLogin() {
    console.log('showLogin called');
    const loginBtn = document.getElementById('loginBtn');
    const isLoggedIn = loginBtn && loginBtn.classList.contains('logged-in');
    
    if (isLoggedIn) {
        // Logout
        if (confirm('Logout and return to Guest?')) {
            // Stop real-time sync
            if (firebaseListener) {
                firebaseListener.off();
                firebaseListener = null;
            }
            
            // Clear saved character from localStorage
            localStorage.removeItem('loggedInCharacter');
            currentCharacterName = null;
            
            loginBtn.textContent = '👤 Login';
            loginBtn.classList.remove('logged-in');
            
            // Clear character sheet
            loadCharacterData();
            
            showNotification('👋 Logged out');
        }
        return;
    }
    
    // Login modal
    let html = '<h2>🔐 Character Login</h2>';
    html += '<div class="login-form">';
    html += '<label>Character Name:</label>';
    html += '<input type="text" id="loginUsername" placeholder="Enter character name" />';
    html += '<label>Password:</label>';
    html += '<input type="password" id="loginPassword" placeholder="Enter password" />';
    html += '<div class="login-actions">';
    html += '<button onclick="attemptLogin()" class="btn-primary">Login</button>';
    html += '<button onclick="closeLoginModal()" class="btn-secondary">Cancel</button>';
    html += '</div>';
    html += '</div>';
    
    const modal = document.getElementById('loginModal');
    document.getElementById('loginModalContent').innerHTML = html;
    modal.classList.remove('hidden');
}

async function attemptLogin() {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    
    const character = characterDatabase[username];
    
    if (!character) {
        alert('Character not found!');
        return;
    }
    
    if (character.password !== simpleHash(password)) {
        alert('Incorrect password!');
        return;
    }
    
    // Successful login
    currentCharacterName = character.name;
    
    // Save logged-in character to localStorage
    localStorage.setItem('loggedInCharacter', username);
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = `👤 ${character.name}`;
    loginBtn.classList.add('logged-in');
    
    // Load character sheet from Firebase
    await loadCharacterFromFirebase(character.name);
    
    // Setup real-time sync for this character
    setupFirebaseRealtimeSync(character.name);
    
    // Close modal
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
    
    showNotification(`✅ Welcome, ${character.name}!`);
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
}

function setupEventListeners() {
    // Login button
    document.getElementById('loginBtn').addEventListener('click', showLogin);
    
    // Modal close button
    const modalClose = document.querySelector('#loginModal .modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeLoginModal);
    }
    
    // Click outside modal to close
    document.getElementById('loginModal').addEventListener('click', (e) => {
        if (e.target.id === 'loginModal') {
            closeLoginModal();
        }
    });
    
    // Ability score changes
    document.querySelectorAll('.ability-score').forEach(input => {
        input.addEventListener('input', calculateAllStats);
    });
    
    // Proficiency bonus change
    document.getElementById('proficiencyBonus').addEventListener('input', calculateAllStats);
    
    // Save proficiency checkboxes
    document.querySelectorAll('.save-prof').forEach(checkbox => {
        checkbox.addEventListener('change', calculateAllStats);
    });
    
    // Skill proficiency checkboxes
    document.querySelectorAll('.skill-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', calculateAllStats);
    });
    
    // Auto-save on any input change (debounced)
    let saveTimeout;
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                autoSaveCharacterData();
            }, 1000);
        });
    });

    // HP controls
    const dmgBtn = document.getElementById('applyDamageBtn');
    const healBtn = document.getElementById('applyHealBtn');
    const shortBtn = document.getElementById('shortRestBtn');
    const longBtn = document.getElementById('longRestBtn');
    if (dmgBtn) dmgBtn.addEventListener('click', applyDamage);
    if (healBtn) healBtn.addEventListener('click', applyHeal);
    if (shortBtn) shortBtn.addEventListener('click', doShortRest);
    if (longBtn) longBtn.addEventListener('click', doLongRest);

    // XP input updates level automatically
    const xpInput = document.getElementById('experiencePoints');
    if (xpInput) {
        xpInput.addEventListener('input', updateLevelFromXP);
    }

    // Identity updates reflected in summary
    const syncSummaryIds = ['nameDisplay','class','background','proficiencyBonus','armorClass','speed','hpMax','hpCurrent','hpTemp'];
    syncSummaryIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateSummaryHeader);
    });
}

// ===== Theme Management =====
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('characterSheetTheme', theme);
}

// ===== Calculations =====
function calculateAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function calculateAllStats() {
    // Calculate ability modifiers
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    abilities.forEach(ability => {
        const score = parseInt(document.getElementById(`${ability}Score`).value) || 10;
        const modifier = calculateAbilityModifier(score);
        const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        document.getElementById(`${ability}Mod`).textContent = modifierStr;
        
        // Store in character data
        characterData.abilities[ability] = score;
    });
    
    // Calculate saving throws
    const profBonus = parseInt(document.getElementById('proficiencyBonus').value) || 2;
    characterData.proficiencyBonus = profBonus;
    
    abilities.forEach(ability => {
        const score = characterData.abilities[ability];
        const modifier = calculateAbilityModifier(score);
        const isProficient = document.getElementById(`${ability}SaveProf`).checked;
        const saveBonus = modifier + (isProficient ? profBonus : 0);
        const saveBonusStr = saveBonus >= 0 ? `+${saveBonus}` : `${saveBonus}`;
        document.getElementById(`${ability}Save`).textContent = saveBonusStr;
        
        // Store proficiency
        characterData.saveProficiencies[ability] = isProficient;
    });
    
    // Calculate skills
    for (const [skill, ability] of Object.entries(skillAbilities)) {
        const abilityScore = characterData.abilities[ability];
        const modifier = calculateAbilityModifier(abilityScore);
        const isProficient = document.getElementById(`${skill}Prof`).checked;
        const skillBonus = modifier + (isProficient ? profBonus : 0);
        const skillBonusStr = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`;
        document.getElementById(skill).textContent = skillBonusStr;
        
        // Store proficiency
        characterData.skillProficiencies[skill] = isProficient;
    }
    
    // Calculate initiative
    const dexMod = calculateAbilityModifier(characterData.abilities.dex);
    const initiativeStr = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
    document.getElementById('initiative').textContent = initiativeStr;
    // Update summary for initiative
    const initSummary = document.getElementById('initSummary');
    if (initSummary) initSummary.textContent = initiativeStr;
    
    // Calculate passive perception
    const perceptionBonus = calculateAbilityModifier(characterData.abilities.wis) + 
                            (characterData.skillProficiencies.perception ? profBonus : 0);
    const passivePerception = 10 + perceptionBonus;
    document.getElementById('passivePerception').textContent = passivePerception;

    // Update summary for proficiency bonus
    const pb = document.getElementById('proficiencyBonus').value || 2;
    const profBonusDisplay = document.getElementById('profBonusDisplay');
    if (profBonusDisplay) {
        const n = parseInt(pb) || 2;
        profBonusDisplay.textContent = n >= 0 ? `+${n}` : `${n}`;
    }

    updateSummaryHeader();
    recalcAllWeapons();
    updateEncumbrance();
}

// ===== Data Management =====
function gatherCharacterData() {
    // Identity
    characterData.characterName = document.getElementById('nameDisplay').value;
    // Level is now calculated from XP
    const xp = parseInt(document.getElementById('experiencePoints').value) || 0;
    const { level } = calculateLevelFromXP(xp);
    characterData.level = level;
    console.log('📊 Gathering character data - Level:', characterData.level);
    characterData.class = document.getElementById('class').value;
    characterData.background = document.getElementById('background').value;
    characterData.species = document.getElementById('species').value;
    characterData.alignment = document.getElementById('alignment').value;
    characterData.experiencePoints = parseInt(document.getElementById('experiencePoints').value) || 0;
    
    // Combat Stats
    characterData.armorClass = parseInt(document.getElementById('armorClass').value) || 10;
    characterData.speed = document.getElementById('speed').value;
    characterData.hpMax = parseInt(document.getElementById('hpMax').value) || 0;
    characterData.hpCurrent = parseInt(document.getElementById('hpCurrent').value) || 0;
    characterData.hpTemp = parseInt(document.getElementById('hpTemp').value) || 0;
    characterData.hitDice = document.getElementById('hitDice').value;
    characterData.hitDiceUsed = parseInt(document.getElementById('hitDiceUsed').value) || 0;
    
    // Death Saves
    characterData.deathSaves.successes = [
        document.getElementById('deathSave1').checked,
        document.getElementById('deathSave2').checked,
        document.getElementById('deathSave3').checked
    ];
    characterData.deathSaves.failures = [
        document.getElementById('deathFail1').checked,
        document.getElementById('deathFail2').checked,
        document.getElementById('deathFail3').checked
    ];
    
    // Inspiration
    characterData.inspiration = document.getElementById('inspiration').checked;
    
    // Combat & Equipment
    const attacksTextarea = document.getElementById('attacks');
    if (attacksTextarea) characterData.attacks = attacksTextarea.value;
    characterData.weapons = getWeaponsFromDOM();
    characterData.inventory = getInventoryFromDOM();
    characterData.coins = getCoinsFromDOM();
    characterData.equipment = document.getElementById('equipment').value;
    
    // Attunement
    characterData.attunement = [
        {
            attuned: document.getElementById('attune1').checked,
            item: document.getElementById('attune1Item').value
        },
        {
            attuned: document.getElementById('attune2').checked,
            item: document.getElementById('attune2Item').value
        },
        {
            attuned: document.getElementById('attune3').checked,
            item: document.getElementById('attune3Item').value
        }
    ];
    
    // Personality & Traits
    characterData.personalityTraits = document.getElementById('personalityTraits').value;
    characterData.ideals = document.getElementById('ideals').value;
    characterData.bonds = document.getElementById('bonds').value;
    characterData.flaws = document.getElementById('flaws').value;
    
    // Features & Proficiencies
    characterData.classFeatures = document.getElementById('classFeatures').value;
    characterData.proficiencies = document.getElementById('proficiencies').value;
    
    // Spellcasting
    characterData.spellcastingAbility = document.getElementById('spellcastingAbility').value;
    characterData.spellSaveDC = parseInt(document.getElementById('spellSaveDC').value) || 0;
    characterData.spellAttackBonus = document.getElementById('spellAttackBonus').value;
    
    for (let i = 1; i <= 9; i++) {
        characterData.spellSlots[i] = {
            current: parseInt(document.getElementById(`spellSlots${i}`).value) || 0,
            max: parseInt(document.getElementById(`spellSlotsMax${i}`).value) || 0
        };
    }
    
    characterData.spellList = document.getElementById('spellList').value;
    
    // Notes
    characterData.notes = document.getElementById('notes').value;

    // Right sidebar widgets
    characterData.resistances = document.getElementById('resistances')?.value || '';
    const condNotesEl = document.getElementById('conditionsNotes');
    characterData.conditions = condNotesEl ? condNotesEl.value : '';
    characterData.senses = document.getElementById('senses')?.value || '';
    characterData.conditionFlags = getConditionFlagsFromDOM();
    characterData.portraitUrl = document.getElementById('portrait')?.dataset?.url || characterData.portraitUrl || '';
    
    return characterData;
}

function populateCharacterData(data) {
    // Identity
    document.getElementById('nameDisplay').value = data.characterName || '';
    document.getElementById('class').value = data.class || '';
    document.getElementById('background').value = data.background || '';
    document.getElementById('species').value = data.species || '';
    document.getElementById('alignment').value = data.alignment || '';
    document.getElementById('experiencePoints').value = data.experiencePoints || 0;
    
    // Update level from XP (this will trigger updateLevelFromXP)
    updateLevelFromXP();
    
    // Ability Scores
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    abilities.forEach(ability => {
        document.getElementById(`${ability}Score`).value = data.abilities[ability] || 10;
    });
    
    // Proficiency & Inspiration
    document.getElementById('proficiencyBonus').value = data.proficiencyBonus || 2;
    document.getElementById('inspiration').checked = data.inspiration || false;
    
    // Saving Throws
    abilities.forEach(ability => {
        document.getElementById(`${ability}SaveProf`).checked = data.saveProficiencies[ability] || false;
    });
    
    // Skills
    for (const skill in skillAbilities) {
        document.getElementById(`${skill}Prof`).checked = data.skillProficiencies[skill] || false;
    }
    
    // Combat Stats
    document.getElementById('armorClass').value = data.armorClass || 10;
    document.getElementById('speed').value = data.speed || '30 ft';
    document.getElementById('hpMax').value = data.hpMax || 0;
    document.getElementById('hpCurrent').value = data.hpCurrent || 0;
    document.getElementById('hpTemp').value = data.hpTemp || 0;
    document.getElementById('hitDice').value = data.hitDice || '';
    document.getElementById('hitDiceUsed').value = data.hitDiceUsed || 0;
    
    // Death Saves
    if (data.deathSaves) {
        document.getElementById('deathSave1').checked = data.deathSaves.successes[0] || false;
        document.getElementById('deathSave2').checked = data.deathSaves.successes[1] || false;
        document.getElementById('deathSave3').checked = data.deathSaves.successes[2] || false;
        document.getElementById('deathFail1').checked = data.deathSaves.failures[0] || false;
        document.getElementById('deathFail2').checked = data.deathSaves.failures[1] || false;
        document.getElementById('deathFail3').checked = data.deathSaves.failures[2] || false;
    }
    
    // Combat & Equipment
    const attacksTextarea = document.getElementById('attacks');
    if (attacksTextarea) attacksTextarea.value = data.attacks || '';
    document.getElementById('equipment').value = data.equipment || '';
    setWeaponsToDOM(data.weapons || []);
    setInventoryToDOM(data.inventory || []);
    setCoinsToDOM(data.coins || { pp:0,gp:0,ep:0,sp:0,cp:0 });
    
    // Attunement
    if (data.attunement) {
        for (let i = 0; i < 3; i++) {
            document.getElementById(`attune${i + 1}`).checked = data.attunement[i]?.attuned || false;
            document.getElementById(`attune${i + 1}Item`).value = data.attunement[i]?.item || '';
        }
    }
    
    // Personality & Traits
    document.getElementById('personalityTraits').value = data.personalityTraits || '';
    document.getElementById('ideals').value = data.ideals || '';
    document.getElementById('bonds').value = data.bonds || '';
    document.getElementById('flaws').value = data.flaws || '';
    
    // Features & Proficiencies
    document.getElementById('classFeatures').value = data.classFeatures || '';
    document.getElementById('proficiencies').value = data.proficiencies || '';
    
    // Spellcasting
    document.getElementById('spellcastingAbility').value = data.spellcastingAbility || '';
    document.getElementById('spellSaveDC').value = data.spellSaveDC || 0;
    document.getElementById('spellAttackBonus').value = data.spellAttackBonus || '';
    
    if (data.spellSlots) {
        for (let i = 1; i <= 9; i++) {
            document.getElementById(`spellSlots${i}`).value = data.spellSlots[i]?.current || 0;
            document.getElementById(`spellSlotsMax${i}`).value = data.spellSlots[i]?.max || 0;
        }
    }
    
    document.getElementById('spellList').value = data.spellList || '';
    
    // Notes
    document.getElementById('notes').value = data.notes || '';

    // Right sidebar widgets
    if (document.getElementById('resistances')) {
        document.getElementById('resistances').value = data.resistances || '';
    }
    if (document.getElementById('conditionsNotes')) {
        document.getElementById('conditionsNotes').value = data.conditions || '';
    }
    if (document.getElementById('senses')) {
        document.getElementById('senses').value = data.senses || '';
    }
    setConditionFlagsToDOM(data.conditionFlags || {});
    setPortrait(data.portraitUrl || '');
    
    // Recalculate all stats
    calculateAllStats();
}

// ===== HP & Rest Helpers =====
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

function applyDamage() {
    const dmg = parseInt(document.getElementById('damageInput').value) || 0;
    if (dmg <= 0) return;
    // Use temp HP first
    let temp = parseInt(document.getElementById('hpTemp').value) || 0;
    let current = parseInt(document.getElementById('hpCurrent').value) || 0;
    const maxHp = parseInt(document.getElementById('hpMax').value) || 0;
    let remaining = dmg;
    if (temp > 0) {
        const used = Math.min(temp, remaining);
        temp -= used; remaining -= used;
    }
    current = clamp(current - remaining, 0, maxHp);
    document.getElementById('hpTemp').value = temp;
    document.getElementById('hpCurrent').value = current;
    updateSummaryHeader();
    autoSaveCharacterData();
}

function applyHeal() {
    const heal = parseInt(document.getElementById('healInput').value) || 0;
    if (heal <= 0) return;
    const maxHp = parseInt(document.getElementById('hpMax').value) || 0;
    let current = parseInt(document.getElementById('hpCurrent').value) || 0;
    current = clamp(current + heal, 0, maxHp);
    document.getElementById('hpCurrent').value = current;
    updateSummaryHeader();
    autoSaveCharacterData();
}

function doShortRest() {
    // Very simple flow: ask for total healing from Hit Dice; increase hpCurrent and increment hitDiceUsed
    const dice = (document.getElementById('hitDice').value || '').trim();
    const healStr = prompt(`Short Rest: Enter total healing from spending Hit Dice (${dice}).`, '0');
    const heal = parseInt(healStr || '0') || 0;
    if (heal > 0) {
        const maxHp = parseInt(document.getElementById('hpMax').value) || 0;
        let current = parseInt(document.getElementById('hpCurrent').value) || 0;
        current = clamp(current + heal, 0, maxHp);
        document.getElementById('hpCurrent').value = current;
    }
    const usedStr = prompt('How many Hit Dice did you spend?', '1');
    const used = parseInt(usedStr || '0') || 0;
    const hdUsedEl = document.getElementById('hitDiceUsed');
    if (hdUsedEl) hdUsedEl.value = Math.max(0, (parseInt(hdUsedEl.value) || 0) + used);
    updateSummaryHeader();
    autoSaveCharacterData();
}

function doLongRest() {
    // Restore HP to max, remove temp HP, regain half of total hit dice (approx via string parse)
    const maxHp = parseInt(document.getElementById('hpMax').value) || 0;
    document.getElementById('hpCurrent').value = maxHp;
    document.getElementById('hpTemp').value = 0;
    // Regain hit dice: reduce used by floor(total/2)
    const hdStr = (document.getElementById('hitDice').value || '').trim();
    let totalHd = 0;
    const m = hdStr.match(/(\d+)d/i);
    if (m) totalHd = parseInt(m[1]) || 0;
    const regain = Math.floor(totalHd / 2);
    const hdUsedEl = document.getElementById('hitDiceUsed');
    if (hdUsedEl) {
        const currentUsed = parseInt(hdUsedEl.value) || 0;
        hdUsedEl.value = Math.max(0, currentUsed - regain);
    }
    updateSummaryHeader();
    autoSaveCharacterData();
}

// ===== Summary Header Sync =====
function updateSummaryHeader() {
    const nameDisplay = document.getElementById('nameDisplay');
    const name = nameDisplay?.value?.trim() || 'Character Name';
    // Level is now calculated from XP
    const xp = parseInt(document.getElementById('experiencePoints')?.value) || 0;
    const { level } = calculateLevelFromXP(xp);
    const cls = document.getElementById('class')?.value?.trim() || 'Class';
    const bkg = document.getElementById('background')?.value?.trim() || 'Background';
    const ac = parseInt(document.getElementById('armorClass')?.value) || 10;
    const speedStr = document.getElementById('speed')?.value || '30 ft';
    const speedNum = parseInt(speedStr) || 30;
    const hpMax = parseInt(document.getElementById('hpMax')?.value) || 0;
    const hpCur = parseInt(document.getElementById('hpCurrent')?.value) || 0;
    const hpTmp = parseInt(document.getElementById('hpTemp')?.value) || 0;

    const levelPill = document.getElementById('levelPill');
    const classDisplay = document.getElementById('classDisplay');
    const backgroundDisplay = document.getElementById('backgroundDisplay');
    const acSummary = document.getElementById('acSummary');
    const speedSummary = document.getElementById('speedSummary');
    const hpCurDisp = document.getElementById('hpCurrentDisplay');
    const hpMaxDisp = document.getElementById('hpMaxDisplay');
    const hpTmpDisp = document.getElementById('hpTempDisplay');

    // nameDisplay is now an input, so just update placeholder if empty
    if (nameDisplay && !nameDisplay.value) {
        nameDisplay.placeholder = 'Character Name';
    }
    if (levelPill) levelPill.textContent = `Lvl ${level}`;
    if (classDisplay) classDisplay.textContent = cls || 'Class';
    if (backgroundDisplay) backgroundDisplay.textContent = bkg || 'Background';
    if (acSummary) acSummary.textContent = String(ac);
    if (speedSummary) speedSummary.textContent = String(speedNum);
    if (hpCurDisp) hpCurDisp.textContent = String(hpCur);
    if (hpMaxDisp) hpMaxDisp.textContent = String(hpMax);
    if (hpTmpDisp) hpTmpDisp.textContent = String(hpTmp);
}

// ===== Save/Load Functions =====
function autoSaveCharacterData() {
    const data = gatherCharacterData();
    localStorage.setItem('dnd2024CharacterSheet', JSON.stringify(data));
    
    // Also save to Firebase if logged in
    if (currentCharacterName && currentCharacterName !== 'Guest') {
        saveCharacterToFirebase();
    }
    
    console.log('✅ Character auto-saved');
}

function saveCharacterData() {
    const data = gatherCharacterData();
    
    // Save to localStorage
    localStorage.setItem('dnd2024CharacterSheet', JSON.stringify(data));
    
    // Save to Firebase if logged in
    if (currentCharacterName && currentCharacterName !== 'Guest') {
        saveCharacterToFirebase();
    }
    
    // Download as JSON file
    const characterName = data.characterName || 'character';
    const filename = `${characterName.replace(/\s+/g, '_')}_dnd2024.json`;
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    const message = currentCharacterName && currentCharacterName !== 'Guest' 
        ? '✅ Character saved to Firebase and downloaded!' 
        : '✅ Character saved and downloaded!';
    showNotification(message);
}

function loadCharacterData() {
    const savedData = localStorage.getItem('dnd2024CharacterSheet');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            Object.assign(characterData, data);
            populateCharacterData(characterData);
            console.log('📂 Character loaded from auto-save');
        } catch (error) {
            console.error('Error loading character data:', error);
        }
    }
}

function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                Object.assign(characterData, data);
                populateCharacterData(characterData);
                showNotification('✅ Character loaded from file!');
            } catch (error) {
                showNotification('❌ Error loading file. Invalid format.');
                console.error('Error parsing character file:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ===== PDF Export =====
function exportToPDF() {
    showNotification('📄 Opening print dialog for PDF export...');
    setTimeout(() => {
        window.print();
    }, 500);
}

// ===== Notification System =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--accent-gold);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 2px solid var(--border-color);
        box-shadow: 0 4px 12px var(--shadow-medium);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('🐉 D&D 2024 Character Sheet initialized');

// ===== Weapons/Attacks =====
function initWeaponsTable() {
    const addBtn = document.getElementById('addWeaponBtn');
    if (addBtn) addBtn.addEventListener('click', () => addWeaponRow());
}

function weaponAbility(type, finesse, explicit) {
    if (explicit && explicit !== 'auto') return explicit;
    if (type === 'ranged') return 'dex';
    if (type === 'melee' && finesse) return (characterData.abilities.dex >= characterData.abilities.str) ? 'dex' : 'str';
    return 'str';
}

function abilityMod(abilityKey) { return calculateAbilityModifier(characterData.abilities[abilityKey] || 10); }

function addWeaponRow(w = null) {
    const tbody = document.getElementById('weaponsBody');
    if (!tbody) return;
    const id = w?.id || `w_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const row = document.createElement('tr');
    row.dataset.id = id;
    row.innerHTML = `
        <td><input class="w-name" placeholder="Shortsword" value="${w?.name||''}"></td>
        <td>
            <select class="w-type">
                <option value="melee" ${w?.type==='melee'?'selected':''}>Melee</option>
                <option value="ranged" ${w?.type==='ranged'?'selected':''}>Ranged</option>
            </select>
            <label style="display:block;margin-top:4px;font-size:.8rem"><input type="checkbox" class="w-finesse" ${w?.finesse?'checked':''}> Finesse</label>
        </td>
        <td style="text-align:center"><input type="checkbox" class="w-prof" ${w?.proficient?'checked':''}></td>
        <td>
            <select class="w-ability">
                <option value="auto" ${(w?.ability||'auto')==='auto'?'selected':''}>Auto</option>
                <option value="str" ${w?.ability==='str'?'selected':''}>STR</option>
                <option value="dex" ${w?.ability==='dex'?'selected':''}>DEX</option>
            </select>
        </td>
        <td><input class="w-die table-mini-input" placeholder="1d6" value="${w?.baseDie||''}"></td>
        <td><input class="w-magic table-mini-input center" type="number" value="${w?.magicBonus||0}"></td>
        <td><input class="w-dmgtype" placeholder="piercing" value="${w?.damageType||''}"></td>
        <td class="calc w-attack">+0</td>
        <td class="calc w-damage">1d6</td>
        <td class="row-actions"><button class="btn-mini" title="Delete">✖</button></td>
    `;
    tbody.appendChild(row);
    row.querySelectorAll('input,select').forEach(el => el.addEventListener('input', () => recalcWeaponRow(row)));
    row.querySelector('.row-actions .btn-mini').addEventListener('click', () => { row.remove(); autoSaveCharacterData(); });
    recalcWeaponRow(row);
}

function parseDie(text) {
    const m = (text||'').trim().match(/^(\d+)[dD](\d+)([+\-]\d+)?$/);
    if (!m) return {count:1,die:6,mod:0,raw:text||'1d6'};
    return {count:parseInt(m[1]),die:parseInt(m[2]),mod:parseInt(m[3]||'0'),raw:text};
}

function recalcWeaponRow(row) {
    const type = row.querySelector('.w-type').value;
    const finesse = row.querySelector('.w-finesse').checked;
    const abilitySel = row.querySelector('.w-ability').value;
    const ability = weaponAbility(type, finesse, abilitySel);
    const prof = row.querySelector('.w-prof').checked;
    const die = parseDie(row.querySelector('.w-die').value || '1d6');
    const magic = parseInt(row.querySelector('.w-magic').value || '0');
    const profBonus = parseInt(document.getElementById('proficiencyBonus').value) || 2;
    const mod = abilityMod(ability);
    const attack = mod + (prof ? profBonus : 0) + magic;
    const dmgMod = mod + magic;
    row.querySelector('.w-attack').textContent = (attack>=0?'+':'') + attack;
    const modStr = dmgMod===0?'':(dmgMod>0?`+${dmgMod}`:`${dmgMod}`);
    row.querySelector('.w-damage').textContent = `${die.raw||'1d6'}${modStr}`;
    autoSaveCharacterData();
}

function recalcAllWeapons() {
    document.querySelectorAll('#weaponsBody tr').forEach(tr => recalcWeaponRow(tr));
    const ind = document.getElementById('attackDisadvIndicator');
    if (ind) ind.hidden = !characterData.conditionFlags?.poisoned;
}

function getWeaponsFromDOM() {
    const arr = [];
    document.querySelectorAll('#weaponsBody tr').forEach(tr => {
        arr.push({
            id: tr.dataset.id,
            name: tr.querySelector('.w-name').value,
            type: tr.querySelector('.w-type').value,
            finesse: tr.querySelector('.w-finesse').checked,
            proficient: tr.querySelector('.w-prof').checked,
            ability: tr.querySelector('.w-ability').value,
            baseDie: tr.querySelector('.w-die').value,
            magicBonus: parseInt(tr.querySelector('.w-magic').value||'0'),
            damageType: tr.querySelector('.w-dmgtype').value
        });
    });
    return arr;
}

function setWeaponsToDOM(list) {
    const tbody = document.getElementById('weaponsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    (list || []).forEach(w => addWeaponRow(w));
}

// ===== Inventory & Encumbrance =====
function initInventoryTable() {
    const addBtn = document.getElementById('addItemBtn');
    if (addBtn) addBtn.addEventListener('click', () => addInventoryRow());
    ['pp','gp','ep','sp','cp'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', ()=>{ updateCoinsSummary(); updateEncumbrance(); autoSaveCharacterData(); });
    });
}

function addInventoryRow(item=null) {
    const tbody = document.getElementById('inventoryBody');
    if (!tbody) return;
    const id = item?.id || `i_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.innerHTML = `
        <td><input class="i-name" placeholder="Backpack" value="${item?.name||''}"></td>
        <td><input class="i-weight table-mini-input" type="number" step="0.1" min="0" value="${item?.weight??0}"></td>
        <td><input class="i-qty table-mini-input" type="number" min="0" value="${item?.qty??1}"></td>
        <td class="calc i-total">0</td>
        <td class="row-actions"><button class="btn-mini">✖</button></td>
    `;
    tbody.appendChild(tr);
    tr.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{ recalcInventoryRow(tr); updateEncumbrance(); autoSaveCharacterData(); }));
    tr.querySelector('.row-actions .btn-mini').addEventListener('click',()=>{ tr.remove(); updateEncumbrance(); autoSaveCharacterData(); });
    recalcInventoryRow(tr);
}

function recalcInventoryRow(tr) {
    const w = parseFloat(tr.querySelector('.i-weight').value||'0');
    const q = parseFloat(tr.querySelector('.i-qty').value||'0');
    const total = Math.max(0, (w*q));
    tr.querySelector('.i-total').textContent = `${total.toFixed(1)} lb`;
    updateTotalsWeight();
}

function updateTotalsWeight() {
    const items = Array.from(document.querySelectorAll('#inventoryBody tr'));
    const itemsWeight = items.reduce((sum,tr)=>{ const t=tr.querySelector('.i-total').textContent; const m=t.match(/([0-9.]+)/); return sum + (m?parseFloat(m[1]):0); },0);
    const coinsW = getCoinsWeight();
    const total = itemsWeight + coinsW;
    const totalEl = document.getElementById('totalWeight'); if (totalEl) totalEl.textContent = `${total.toFixed(1)} lb`;
}

function getCoinsFromDOM() {
    const val=(id)=>parseInt(document.getElementById(id)?.value||'0');
    return { pp:val('pp'), gp:val('gp'), ep:val('ep'), sp:val('sp'), cp:val('cp') };
}
function setCoinsToDOM(c) {
    ['pp','gp','ep','sp','cp'].forEach(id=>{ const el=document.getElementById(id); if (el) el.value = c?.[id]??0; });
    updateCoinsSummary();
}
function getCoinsWeight() {
    const {pp,gp,ep,sp,cp} = getCoinsFromDOM();
    const totalCoins = (pp*10*10) + (gp*100) + (ep*50) + (sp*10) + (cp*1); // in copper
    const weight = totalCoins / 50;
    return weight;
}
function updateCoinsSummary() {
    const c = getCoinsFromDOM();
    const wealthGp = (c.pp*10) + (c.gp) + (c.ep*0.5) + (c.sp*0.1) + (c.cp*0.01);
    const weight = getCoinsWeight();
    const wEl = document.getElementById('coinsWeight'); if (wEl) wEl.textContent = `${weight.toFixed(1)} lb`;
    const valEl = document.getElementById('coinsWealth'); if (valEl) valEl.textContent = `${wealthGp.toFixed(2)} gp`;
    updateTotalsWeight();
}

function getInventoryFromDOM() {
    const arr=[]; document.querySelectorAll('#inventoryBody tr').forEach(tr=>{
        arr.push({ id: tr.dataset.id, name: tr.querySelector('.i-name').value, weight: parseFloat(tr.querySelector('.i-weight').value||'0'), qty: parseInt(tr.querySelector('.i-qty').value||'0') });
    }); return arr;
}
function setInventoryToDOM(list) {
    const tbody=document.getElementById('inventoryBody'); if (!tbody) return; tbody.innerHTML='';
    (list||[]).forEach(i=>addInventoryRow(i));
    updateEncumbrance();
}

function updateEncumbrance() {
    const str = characterData.abilities?.str || parseInt(document.getElementById('strScore')?.value)||10;
    const capacity = 15 * str;
    const enc1 = 5 * str; // Encumbered threshold
    const enc2 = 10 * str; // Heavily Encumbered threshold
    const totalEl = document.getElementById('totalWeight');
    const capacityEl = document.getElementById('carryCapacity'); if (capacityEl) capacityEl.textContent = `${capacity} lb`;
    const statusEl = document.getElementById('encumbranceStatus');
    let total = 0; const match = totalEl?.textContent?.match(/([0-9.]+)/); if (match) total = parseFloat(match[1]);
    let status = 'Unencumbered';
    if (total > enc2 && total <= capacity) status = 'Heavily Encumbered';
    else if (total > enc1 && total <= enc2) status = 'Encumbered';
    else if (total > capacity) status = 'Over Capacity';
    if (statusEl) { statusEl.textContent = status; statusEl.classList.toggle('warning', status !== 'Unencumbered'); }
}

// ===== Conditions =====
const CONDITION_KEYS = ['poisoned','blinded','deafened','frightened','grappled','incapacitated','invisible','paralyzed','petrified','prone','restrained','stunned','unconscious'];
function initConditions() {
    document.querySelectorAll('.cond-toggle').forEach(cb=> cb.addEventListener('change', ()=>{ characterData.conditionFlags = getConditionFlagsFromDOM(); recalcAllWeapons(); autoSaveCharacterData(); }));
    const ex = document.getElementById('exhaustion'); if (ex) ex.addEventListener('input', ()=>autoSaveCharacterData());
}
function getConditionFlagsFromDOM() {
    const flags={}; document.querySelectorAll('.cond-toggle').forEach(cb=> flags[cb.dataset.cond]=cb.checked ); return flags;
}
function setConditionFlagsToDOM(flags) {
    document.querySelectorAll('.cond-toggle').forEach(cb=> cb.checked = !!flags[cb.dataset.cond]);
    recalcAllWeapons();
}

// ===== Portrait =====
function initPortrait() {
    const portrait = document.getElementById('portrait');
    const fileInput = document.getElementById('portraitFile');
    if (!portrait || !fileInput) return;
    portrait.addEventListener('click', ()=>{
        const choice = prompt('Set portrait: paste an image URL or leave blank to upload a file.');
        if (choice && choice.trim()) { setPortrait(choice.trim()); autoSaveCharacterData(); return; }
        fileInput.click();
    });
    fileInput.addEventListener('change', (e)=>{
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader(); reader.onload = ev => { setPortrait(ev.target.result); autoSaveCharacterData(); }; reader.readAsDataURL(file);
    });
}
function setPortrait(url) {
    const portrait = document.getElementById('portrait'); if (!portrait) return;
    if (url) {
        portrait.style.backgroundImage = `url('${url}')`;
        portrait.dataset.url = url;
    } else {
        portrait.style.backgroundImage = '';
        portrait.dataset.url = '';
    }
}

// ===== Auto Spell Slots =====
function initAutoSlots() {
    const btn = document.getElementById('autoSlotsBtn'); if (btn) btn.addEventListener('click', autoFillSpellSlots);
}
const SLOT_TABLE_FULL = {
    1:[2,0,0,0,0,0,0,0,0],2:[3,0,0,0,0,0,0,0,0],3:[4,2,0,0,0,0,0,0,0],4:[4,3,0,0,0,0,0,0,0],5:[4,3,2,0,0,0,0,0,0],6:[4,3,3,0,0,0,0,0,0],7:[4,3,3,1,0,0,0,0,0],8:[4,3,3,2,0,0,0,0,0],9:[4,3,3,3,1,0,0,0,0],10:[4,3,3,3,2,0,0,0,0],11:[4,3,3,3,2,1,0,0,0],12:[4,3,3,3,2,1,0,0,0],13:[4,3,3,3,2,1,1,0,0],14:[4,3,3,3,2,1,1,0,0],15:[4,3,3,3,2,1,1,1,0],16:[4,3,3,3,2,1,1,1,0],17:[4,3,3,3,2,1,1,1,1],18:[4,3,3,3,3,1,1,1,1],19:[4,3,3,3,3,2,2,1,1],20:[4,3,3,3,3,2,2,2,2]
};
const SLOT_TABLE_HALF = {1:[0,0,0,0,0,0,0,0,0],2:[2,0,0,0,0,0,0,0,0],3:[3,0,0,0,0,0,0,0,0],4:[3,0,0,0,0,0,0,0,0],5:[4,2,0,0,0,0,0,0,0],6:[4,2,0,0,0,0,0,0,0],7:[4,3,0,0,0,0,0,0,0],8:[4,3,0,0,0,0,0,0,0],9:[4,3,2,0,0,0,0,0,0],10:[4,3,2,0,0,0,0,0,0],11:[4,3,3,0,0,0,0,0,0],12:[4,3,3,0,0,0,0,0,0],13:[4,3,3,1,0,0,0,0,0],14:[4,3,3,1,0,0,0,0,0],15:[4,3,3,2,0,0,0,0,0],16:[4,3,3,2,0,0,0,0,0],17:[4,3,3,3,1,0,0,0,0],18:[4,3,3,3,1,0,0,0,0],19:[4,3,3,3,2,0,0,0,0],20:[4,3,3,3,2,0,0,0,0]};
const SLOT_TABLE_THIRD = {1:[0,0,0,0,0,0,0,0,0],2:[0,0,0,0,0,0,0,0,0],3:[2,0,0,0,0,0,0,0,0],4:[3,0,0,0,0,0,0,0,0],5:[3,0,0,0,0,0,0,0,0],6:[3,0,0,0,0,0,0,0,0],7:[4,2,0,0,0,0,0,0,0],8:[4,2,0,0,0,0,0,0,0],9:[4,2,0,0,0,0,0,0,0],10:[4,3,0,0,0,0,0,0,0],11:[4,3,0,0,0,0,0,0,0],12:[4,3,0,0,0,0,0,0,0],13:[4,3,2,0,0,0,0,0,0],14:[4,3,2,0,0,0,0,0,0],15:[4,3,2,0,0,0,0,0,0],16:[4,3,3,0,0,0,0,0,0],17:[4,3,3,0,0,0,0,0,0],18:[4,3,3,0,0,0,0,0,0],19:[4,3,3,1,0,0,0,0,0],20:[4,3,3,1,0,0,0,0,0]};
const SLOT_TABLE_PACT = { // warlock pact magic: [slots, level]
    1:[{n:1,l:1}],2:[{n:2,l:1}],3:[{n:2,l:2}],4:[{n:2,l:2}],5:[{n:2,l:3}],6:[{n:2,l:3}],7:[{n:2,l:4}],8:[{n:2,l:4}],9:[{n:2,l:5}],10:[{n:2,l:5}],11:[{n:3,l:5}],12:[{n:3,l:5}],13:[{n:3,l:5}],14:[{n:3,l:5}],15:[{n:3,l:5}],16:[{n:3,l:5}],17:[{n:4,l:5}],18:[{n:4,l:5}],19:[{n:4,l:5}],20:[{n:4,l:5}]
};

function classCasterType(clsRaw) {
    const c = (clsRaw||'').toLowerCase();
    if (/wizard|cleric|druid|sorcerer|bard|artificer/.test(c)) return 'full';
    if (/paladin|ranger/.test(c)) return 'half';
    if (/fighter|rogue/.test(c) && /eldritch|arcane/.test(c)) return 'third';
    if (/warlock/.test(c)) return 'pact';
    return 'none';
}

function autoFillSpellSlots() {
    const level = parseInt(document.getElementById('level')?.value)||1;
    const cls = document.getElementById('class')?.value||'';
    const type = classCasterType(cls);
    let slots = null;
    if (type==='full') slots = SLOT_TABLE_FULL[level];
    else if (type==='half') slots = SLOT_TABLE_HALF[level];
    else if (type==='third') slots = SLOT_TABLE_THIRD[level];
    if (slots) {
        for (let i=1;i<=9;i++){ const maxEl=document.getElementById(`spellSlotsMax${i}`); const curEl=document.getElementById(`spellSlots${i}`); if (maxEl) maxEl.value = slots[i-1]||0; if (curEl) curEl.value = slots[i-1]||0; }
        showNotification('✨ Spell slots filled from class and level');
        autoSaveCharacterData();
        return;
    }
    if (type==='pact') {
        const entry = SLOT_TABLE_PACT[level][0];
        for (let i=1;i<=9;i++){ const maxEl=document.getElementById(`spellSlotsMax${i}`); const curEl=document.getElementById(`spellSlots${i}`); if (maxEl) maxEl.value = 0; if (curEl) curEl.value = 0; }
        const lvl = entry.l; const n = entry.n; const maxEl=document.getElementById(`spellSlotsMax${lvl}`); const curEl=document.getElementById(`spellSlots${lvl}`); if (maxEl) maxEl.value = n; if (curEl) curEl.value = n;
        showNotification('✨ Pact Magic slots set for Warlock');
        autoSaveCharacterData();
        return;
    }
    showNotification('ℹ️ Selected class has no spell slots');
}
