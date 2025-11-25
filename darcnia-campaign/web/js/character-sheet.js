// Use shared config modules
import { firebaseConfig } from './config/firebase-config.js';
import { STORAGE_KEYS } from './config/app-config.js';
import { simpleHash, characterDatabase } from './data/character-db.js';

// ===== Constants & Configuration =====
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
const BANK_STORAGE_KEY = STORAGE_KEYS.bank || 'bankBalance';
const REMOTE_STAMP_KEY = STORAGE_KEYS.characterSheetRemoteStamp || 'dnd2024CharacterSheetRemoteStamp';
const getFirebaseSDK = () => (typeof window !== 'undefined' ? window.firebase : undefined);

// Initialize Firebase (fresh live-save flow)
let database = null;
let firebaseListener = null;
let firebaseBankListener = null;
let isUpdatingFromFirebase = false;
let isUpdatingBankFromFirebase = false;

try {
    const firebaseSDK = getFirebaseSDK();
    if (firebaseSDK) {
        if (!firebaseSDK.apps?.length) {
            firebaseSDK.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized for Character Sheet');
        } else {
            console.log('ℹ️ Firebase app already active, reusing for Character Sheet');
        }
        database = firebaseSDK.database();
    } else {
        console.warn('⚠️ Firebase SDK not detected, using localStorage fallback');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase for Character Sheet:', error);
}

// Current logged-in character
let currentCharacterName = null;
const REALTIME_SAVE_EVENTS = ['input', 'change'];
const REALTIME_SAVE_DEBOUNCE_MS = 400;
let realtimeSaveTimeout = null;
let realtimeSavePending = false;
let lastSavedSnapshot = null;
let currentFirebaseSlug = null;
let hasHydratedCharacter = false;
let hydrationLockUntil = 0;

// ===== Utility Helpers =====
function sanitizeCharacterName(name) {
    return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function buildFirebaseKeyCandidates(name) {
    const base = (name || '').trim();
    if (!base) return [];
    const lower = base.toLowerCase();
    const canonical = sanitizeCharacterName(base);
    const hyphenated = lower.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const spaced = lower.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    const compact = lower.replace(/[^a-z0-9]/g, '');
    const candidates = [canonical, hyphenated, lower, spaced, compact, base];
    return [...new Set(candidates.filter(Boolean))];
}

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

    let currentLevelXP = 0;
    let nextLevelXP = 300;
    for (let i = 0; i < XP_TABLE.length; i++) {
        if (XP_TABLE[i].level === level) {
            currentLevelXP = XP_TABLE[i].xp;
            nextLevelXP = currentLevelXP + XP_TABLE[i].next;
            break;
        }
    }

    const levelPill = document.getElementById('levelPill');
    if (levelPill) {
        const levelNumber = levelPill.querySelector('.level-number');
        if (levelNumber) {
            levelNumber.textContent = level;
        } else {
            levelPill.textContent = level;
        }
    }

    const xpTarget = document.getElementById('xpTarget');
    if (xpTarget) {
        xpTarget.textContent = nextLevelXP.toLocaleString();
    }

    const xpNextDisplay = document.getElementById('xpToNext');
    if (xpNextDisplay) {
        if (level >= 20) {
            xpNextDisplay.textContent = 'Maximum Level Reached';
        } else {
            const remaining = nextLevelXP - xp;
            xpNextDisplay.textContent = `${remaining.toLocaleString()} XP to level ${level + 1}`;
        }
    }

    const progressFill = document.getElementById('xpProgressFill');
    const progressBar = document.querySelector('.xp-progress-bar');
    let percentage = 0;
    if (level < 20) {
        const xpInCurrentLevel = xp - currentLevelXP;
        const xpNeededForLevel = nextLevelXP - currentLevelXP;
        percentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
    } else {
        percentage = 100;
    }
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        let bg = 'linear-gradient(90deg,#ffd700,#ffdf5f)';
        if (percentage > 66) bg = 'linear-gradient(90deg,#ff6ad5,#ff94e5)';
        else if (percentage > 33) bg = 'linear-gradient(90deg,#ffae42,#ffc16e)';
        progressFill.style.background = bg;
    }
    if (progressBar && !document.getElementById('xpProgressText')) {
        const t = document.createElement('span');
        t.id = 'xpProgressText';
        t.className = 'xp-progress-text';
        progressBar.appendChild(t);
    }
    const tEl = document.getElementById('xpProgressText');
    if (tEl) tEl.textContent = `${Math.round(percentage)}%`;

    characterData.level = level;

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

    calculateAllStats(false);
    updateSummaryHeader();
}

function serializeCharacterDataForDiff(data) {
    return JSON.stringify(data, (key, value) => key === 'updatedAt' ? undefined : value);
}

function stampCharacterData(data) {
    const timestamp = Date.now();
    data.updatedAt = timestamp;
    return timestamp;
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function getLastRemoteStamp() {
    const raw = localStorage.getItem(REMOTE_STAMP_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
}

function setLastRemoteStamp(value) {
    if (!value) return;
    try {
        localStorage.setItem(REMOTE_STAMP_KEY, String(value));
    } catch (error) {
        console.warn('Unable to persist remote stamp:', error);
    }
}

function clearLastRemoteStamp() {
    localStorage.removeItem(REMOTE_STAMP_KEY);
}

// ===== Persistence & Sync =====
async function checkLoggedInCharacter() {
    const savedCharacterName = localStorage.getItem(STORAGE_KEYS.loggedInCharacter);

    if (savedCharacterName && characterDatabase[savedCharacterName]) {
        const character = characterDatabase[savedCharacterName];
        currentCharacterName = character.name;
        currentFirebaseSlug = sanitizeCharacterName(character.name) || null;
        console.log(`📋 Loading character sheet for: ${currentCharacterName}`);

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = `👤 ${character.name}`;
            loginBtn.classList.add('logged-in');
        }
    } else {
        currentCharacterName = null;
        currentFirebaseSlug = null;
        clearLastRemoteStamp();
        console.log('📋 No character logged in, using local storage only');
    }

    if (database && currentCharacterName) {
        hasHydratedCharacter = false;
        await loadCharacterFromFirebase(currentCharacterName);
        await loadBankFromFirebase(currentCharacterName);
        setupFirebaseRealtimeSync(currentCharacterName);
    } else {
        loadCharacterData();
    }
}

async function loadCharacterFromFirebase(characterName) {
    if (!database || !characterName) {
        const blank = getBlankCharacterTemplate();
        applyCharacterSheetData(blank, 'blank sheet');
        clearLastRemoteStamp();
        return;
    }

    const keyCandidates = buildFirebaseKeyCandidates(characterName);
    if (!keyCandidates.length) {
        const fallbackKey = sanitizeCharacterName(characterName);
        if (fallbackKey) keyCandidates.push(fallbackKey);
    }
    const canonicalKey = keyCandidates[0] || sanitizeCharacterName(characterName) || null;
    let resolvedKey = canonicalKey;
    let remoteData = null;

    try {
        for (const key of keyCandidates) {
            if (!key) continue;
            const snapshot = await database.ref(`characters/${key}/characterSheet`).once('value');
            if (snapshot.exists()) {
                remoteData = snapshot.val();
                resolvedKey = key;
                if (key !== canonicalKey) {
                    console.log(`ℹ️ Loaded ${characterName} from legacy Firebase key "${key}"`);
                }
                break;
            }
        }

        currentFirebaseSlug = resolvedKey || canonicalKey || null;

        if (remoteData) {
            applyCharacterSheetData(remoteData, 'Firebase');
            if (remoteData.updatedAt) {
                setLastRemoteStamp(remoteData.updatedAt);
            }
        } else {
            const blank = getBlankCharacterTemplate();
            applyCharacterSheetData(blank, 'Firebase (empty)');
            clearLastRemoteStamp();
            console.log(`📄 No Firebase character sheet found for ${characterName}, starting fresh`);
        }
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        const blank = getBlankCharacterTemplate();
        applyCharacterSheetData(blank, 'blank sheet (error fallback)');
        clearLastRemoteStamp();
    }
}

async function loadBankFromFirebase(characterName) {
    if (!database || !characterName) return;
    const primaryKey = currentFirebaseSlug || sanitizeCharacterName(characterName);
    const candidates = buildFirebaseKeyCandidates(characterName);
    if (!candidates.length) {
        const fallbackKey = sanitizeCharacterName(characterName);
        if (fallbackKey) candidates.push(fallbackKey);
    }
    const keysToTry = [];
    if (primaryKey) keysToTry.push(primaryKey);
    candidates.forEach((key) => {
        if (key && !keysToTry.includes(key)) keysToTry.push(key);
    });
    try {
        for (const key of keysToTry) {
            const snapshot = await database.ref(`characters/${key}/bank`).once('value');
            const bank = snapshot.val();
            if (bank) {
                currentFirebaseSlug = currentFirebaseSlug || key;
                if (key !== primaryKey && primaryKey) {
                    console.log(`ℹ️ Loaded shared bank from legacy Firebase key "${key}"`);
                }
                applySharedBankBalance(bank, { silent: true });
                return;
            }
        }
    } catch (error) {
        console.error('Error loading bank from Firebase:', error);
    }
}

function setupFirebaseRealtimeSync(characterName) {
    if (!database || !characterName) return;

    const fallbackKeys = buildFirebaseKeyCandidates(characterName);
    const slug = currentFirebaseSlug
        || sanitizeCharacterName(characterName)
        || fallbackKeys[0];
    if (!slug) {
        console.warn('⚠️ Unable to establish Firebase sync: missing character key');
        return;
    }
    if (!currentFirebaseSlug) {
        currentFirebaseSlug = slug;
    }
    const characterRef = database.ref(`characters/${slug}/characterSheet`);

    if (firebaseListener) {
        firebaseListener.off();
        firebaseListener = null;
    }
    if (firebaseBankListener) {
        firebaseBankListener.off();
        firebaseBankListener = null;
    }

    let hasProcessedInitialSnapshot = false;
    firebaseListener = characterRef;
    characterRef.on('value', (snapshot) => {
        if (isUpdatingFromFirebase) return;
        if (!snapshot.exists()) return;

        const data = snapshot.val();
        const incomingSignature = serializeCharacterDataForDiff(data);
        if (!hasProcessedInitialSnapshot && incomingSignature === lastSavedSnapshot) {
            hasProcessedInitialSnapshot = true;
            return;
        }
        hasProcessedInitialSnapshot = true;

        isUpdatingFromFirebase = true;
        Object.assign(characterData, data);
        populateCharacterData(characterData);
        lastSavedSnapshot = incomingSignature;
        if (data.updatedAt) setLastRemoteStamp(data.updatedAt);
        console.log('🔄 Character sheet synced from Firebase');

        setTimeout(() => {
            isUpdatingFromFirebase = false;
        }, 100);
    });

    const bankRef = database.ref(`characters/${slug}/bank`);
    firebaseBankListener = bankRef;
    bankRef.on('value', (snapshot) => {
        if (isUpdatingBankFromFirebase) return;
        const bank = snapshot.val();
        if (bank) {
            isUpdatingBankFromFirebase = true;
            applySharedBankBalance(bank, { silent: true });
            setTimeout(() => { isUpdatingBankFromFirebase = false; }, 100);
        }
    });

    console.log(`🔔 Real-time sync enabled for ${characterName}`);
}

function handleExternalLoginChange(rawValue) {
    const normalized = rawValue ? rawValue.trim().toLowerCase() : '';
    const current = currentCharacterName ? currentCharacterName.toLowerCase() : '';
    if (normalized === current) {
        return;
    }
    if (normalized) {
        checkLoggedInCharacter().catch((err) => console.error('Error rehydrating login from storage:', err));
    } else {
        currentCharacterName = null;
        currentFirebaseSlug = null;
        clearLastRemoteStamp();
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = '👤 Login';
            loginBtn.classList.remove('logged-in');
        }
        loadCharacterData();
    }
}

async function saveCharacterToFirebase(dataOverride = null, diffSignature = null) {
    if (!database) {
        const firebaseSDK = getFirebaseSDK();
        if (firebaseSDK?.apps?.length) {
            database = firebaseSDK.database();
        }
        if (!database) {
            console.warn('⏭️ Skipping Firebase save: database not initialized');
            return;
        }
    }
    if (!currentCharacterName) {
        console.warn('⏭️ Skipping Firebase save: no logged-in character');
        return;
    }
    if (isUpdatingFromFirebase) {
        console.log('⏭️ Skipping Firebase save: currently syncing from Firebase');
        return;
    }

    const slug = currentFirebaseSlug || sanitizeCharacterName(currentCharacterName);
    if (!slug) {
        console.warn('⏭️ Skipping Firebase save: unable to resolve character key');
        return;
    }
    const data = dataOverride || gatherCharacterData();
    let signature = diffSignature;
    if (!signature) {
        signature = serializeCharacterDataForDiff(data);
        if (lastSavedSnapshot === signature) {
            return;
        }
    }
    if (!data.updatedAt) {
        stampCharacterData(data);
    }

    try {
        console.log(`💾 Saving character sheet with level ${data.level} to Firebase for ${currentCharacterName}`);
        await database.ref(`characters/${slug}/characterSheet`).set(data);
        await database.ref(`characters/${slug}/level`).set(data.level || 1);
        if (!diffSignature) {
            lastSavedSnapshot = signature;
        }
        if (data.updatedAt) {
            setLastRemoteStamp(data.updatedAt);
        }
        console.log(`✅ Character sheet saved to Firebase for ${currentCharacterName}`);
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}

// ===== Character Database & Login System =====

// Character data structure
let characterData = {
    updatedAt: 0,
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
    coins: { pp: 0, gp: 0, sp: 0, cp: 0 },
    
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
const CHARACTER_TEMPLATE = JSON.parse(JSON.stringify(characterData));

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

// ===== Bootstrap & Event Wiring =====
function bootstrapCharacterSheet() {
    initializeSheet();
    setupEventListeners();
    checkLoggedInCharacter();
    initTabs();
    calculateAllStats();
    updateLevelFromXP();
    updateSummaryHeader();
    initWeaponsTable();
    initInventoryTable();
    renderInventoryBoard();
    initConditions();
    initHpCardTabs();
    initPortrait();
    initAutoSlots();
    updateBankBalanceDisplay();
    initInventoryCollapsibles();
    initStorageSyncListeners();
}

function initStorageSyncListeners() {
    window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEYS.loggedInCharacter) {
            handleExternalLoginChange(event.newValue);
            return;
        }
        if (event.key === BANK_STORAGE_KEY) {
            updateBankBalanceDisplay();
        }
        if (event.key === STORAGE_KEYS.characterSheetData && event.newValue) {
            try {
                const data = JSON.parse(event.newValue);
                if (!data?.coins) return;
                const incoming = data.coins;
                const current = getCoinsFromDOM();
                const changed = ['pp','gp','sp','cp'].some((denom) => (parseInt(current[denom]) || 0) !== (parseInt(incoming[denom]) || 0));
                if (changed) {
                    setCoinsToDOM(incoming);
                    updateEncumbrance();
                    showToast('💰 Coins synced from market', 'info');
                }
            } catch (error) {
                console.warn('Unable to sync character sheet data from storage:', error);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', bootstrapCharacterSheet);

// ===== Tabs: Inventory / Notes / Spells =====
function initTabs() {
    const tabs = document.querySelectorAll('.sheet-tab');
    if (!tabs || tabs.length === 0) return;

    let saved = localStorage.getItem(STORAGE_KEYS.characterSheetActiveTab) || 'combat';

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
            localStorage.setItem(STORAGE_KEYS.characterSheetActiveTab, name);

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

// ===== Hit Points Tabs =====
function initHpCardTabs() {
    const tabs = document.querySelectorAll('.hp-tab');
    const panels = document.querySelectorAll('.hp-panel');
    if (!tabs.length || !panels.length) return;

    const applyHpTab = (target) => {
        if (!target) return;
        tabs.forEach(tab => {
            const isActive = tab.dataset.hpTab === target;
            tab.classList.toggle('hp-tab-active', isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        panels.forEach(panel => {
            const shouldShow = panel.dataset.hpPanel === target;
            panel.classList.toggle('hp-panel-active', shouldShow);
            panel.hidden = !shouldShow;
        });
    };

    const defaultTab = document.querySelector('.hp-tab.hp-tab-active')?.dataset.hpTab || tabs[0].dataset.hpTab;
    applyHpTab(defaultTab);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => applyHpTab(tab.dataset.hpTab));
    });
}

function initializeSheet() {
    // Always use dark theme to match campaign site
    setTheme('dark');
}


// ===== Login/Logout Functions (Modal-based like main page) =====
function showLogin() {
    console.log('showLogin called');
    const loginBtn = document.getElementById('loginBtn');
    const isLoggedIn = loginBtn && loginBtn.classList.contains('logged-in');
    const loggedKey = localStorage.getItem(STORAGE_KEYS.loggedInCharacter);
    const loggedEntry = loggedKey ? characterDatabase[loggedKey] : null;
    const isDm = loggedEntry && loggedEntry.accessLevel === 'dm';
    
    if (isLoggedIn) {
        // If DM is logged in, offer switch or logout instead of immediate logout
        if (isDm) {
            const choice = prompt('DM options: type "switch" to change character, or "logout" to sign out.', 'switch');
            if (!choice) return;
            const normalized = choice.trim().toLowerCase();
            if (normalized === 'logout') {
                if (firebaseListener) {
                    firebaseListener.off();
                    firebaseListener = null;
                }
                if (firebaseBankListener) {
                    firebaseBankListener.off();
                    firebaseBankListener = null;
                }
                localStorage.removeItem(STORAGE_KEYS.loggedInCharacter);
                currentCharacterName = null;
                currentFirebaseSlug = null;
                clearLastRemoteStamp();
                loginBtn.textContent = '👤 Login';
                loginBtn.classList.remove('logged-in');
                loadCharacterData();
                showNotification('👋 Logged out');
                return;
            }
            if (normalized === 'switch') {
                // Re-open login modal for DM to pick a different character
                // Fall through to modal rendering below
            } else {
                showNotification('❗ Type "switch" to change character or "logout" to sign out.', 'error');
                return;
            }
        } else {
            // Non-DM: behave as before (simple logout)
            if (confirm('Logout and return to Guest?')) {
                if (firebaseListener) {
                    firebaseListener.off();
                    firebaseListener = null;
                }
                if (firebaseBankListener) {
                    firebaseBankListener.off();
                    firebaseBankListener = null;
                }
                // Clear saved character from localStorage
                localStorage.removeItem(STORAGE_KEYS.loggedInCharacter);
                currentCharacterName = null;
                currentFirebaseSlug = null;
                clearLastRemoteStamp();
                
                loginBtn.textContent = '👤 Login';
                loginBtn.classList.remove('logged-in');
                
                // Clear character sheet
                loadCharacterData();
                
                showNotification('👋 Logged out');
            }
            return;
        }
    }
    
    // Login modal
    let html = '<h2>🔐 Character Login</h2>';
    html += '<div class="login-form">';
    html += '<label>Character Name:</label>';
    html += '<input type="text" id="loginUsername" placeholder="Enter character name" />';
    html += '<label>Password:</label>';
    html += '<input type="password" id="loginPassword" placeholder="Enter password" />';
    html += '<div id="dmCharacterPicker" class="dm-character-picker" style="display:none; margin-top: 0.75rem;">';
    html += '<label for="dmCharacterSelect">View character as DM:</label>';
    html += '<select id="dmCharacterSelect">';
    html += '<option value="">-- Select character --</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="login-actions">';
    html += '<button onclick="attemptLogin()" class="btn-primary">Login</button>';
    html += '<button onclick="closeLoginModal()" class="btn-secondary">Cancel</button>';
    html += '</div>';
    html += '</div>';
    
    const modal = document.getElementById('loginModal');
    document.getElementById('loginModalContent').innerHTML = html;
    modal.classList.remove('hidden');

    // Wire DM picker after modal content exists
    const usernameInput = document.getElementById('loginUsername');
    if (usernameInput) {
        usernameInput.addEventListener('input', maybeShowDmCharacterPicker);
        // Run once in case DM name is prefilled later
        maybeShowDmCharacterPicker();
    }
}

async function attemptLogin() {
    const username = document.getElementById('loginUsername').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const dmSelect = document.getElementById('dmCharacterSelect');
    const dmTargetName = dmSelect ? dmSelect.value : '';
    
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
    currentFirebaseSlug = sanitizeCharacterName(character.name) || null;
    
    // Save logged-in character to localStorage
    localStorage.setItem(STORAGE_KEYS.loggedInCharacter, username);
    
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = `👤 ${character.name}`;
    loginBtn.classList.add('logged-in');
    
    clearLastRemoteStamp();
    hasHydratedCharacter = false;
    
    if (character.accessLevel === 'dm') {
        // DM: view selected sheet from dropdown (player or NPC)
        if (!dmTargetName) {
            showNotification('❗ Logged in as DM, but no character selected from the list.', 'error');
        } else {
            currentCharacterName = dmTargetName;
            currentFirebaseSlug = sanitizeCharacterName(dmTargetName) || null;
            await loadCharacterFromFirebase(dmTargetName);
            await loadBankFromFirebase(dmTargetName);
            setupFirebaseRealtimeSync(dmTargetName);
            showNotification(`📖 Viewing sheet for ${dmTargetName} (DM mode).`);
        }
    } else {
        // Normal player login
        await loadCharacterFromFirebase(character.name);
        await loadBankFromFirebase(character.name);
        setupFirebaseRealtimeSync(character.name);
        showNotification(`✅ Welcome, ${character.name}!`);
    }
    
    // Close modal
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
}

// Helper: populate DM character dropdown when DM username is entered
function maybeShowDmCharacterPicker() {
    const usernameInput = document.getElementById('loginUsername');
    const picker = document.getElementById('dmCharacterPicker');
    const select = document.getElementById('dmCharacterSelect');
    if (!usernameInput || !picker || !select) return;

    const value = usernameInput.value.trim().toLowerCase();
    const isDm = value === 'dm' || value === 'dungeon master';
    picker.style.display = isDm ? 'block' : 'none';

    if (!isDm) return;

    // Build options from characterDatabase keys (excluding dm accounts)
    select.innerHTML = '<option value="">-- Select character --</option>';
    Object.keys(characterDatabase).forEach(key => {
        const entry = characterDatabase[key];
        if (!entry || entry.accessLevel === 'dm') return;
        const displayName = entry.name || key;
        const option = document.createElement('option');
        option.value = displayName;
        option.textContent = displayName;
        select.appendChild(option);
    });
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('hidden');
}

function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', showLogin);
    
    // Modal close button
    const modalClose = document.querySelector('#loginModal .modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeLoginModal);
    }
    
    // Click outside modal to close
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target.id === 'loginModal') {
                closeLoginModal();
            }
        });
    }
    
    // Ability score changes
    document.querySelectorAll('.ability-score').forEach(input => {
        input.addEventListener('input', () => {
            calculateAllStats();
            autoSaveCharacterData();
        });
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
    
    initRealtimeAutosave();

    // Hero card HP controls (primary inputs now)
    const dmgQuickBtn = document.getElementById('applyDamageQuick');
    const healQuickBtn = document.getElementById('applyHealQuick');
    const shortQuickBtn = document.getElementById('shortRestQuick');
    const longQuickBtn = document.getElementById('longRestQuick');
    if (dmgQuickBtn) dmgQuickBtn.addEventListener('click', applyDamage);
    if (healQuickBtn) healQuickBtn.addEventListener('click', applyHeal);
    if (shortQuickBtn) shortQuickBtn.addEventListener('click', doShortRest);
    if (longQuickBtn) longQuickBtn.addEventListener('click', doLongRest);

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

function initRealtimeAutosave() {
    const sheetRoot = document.querySelector('.character-sheet');
    if (!sheetRoot) return;

    const handleRealtimeInput = (event) => {
        if (isUpdatingFromFirebase) return; // Skip events triggered by Firebase hydration
        const target = event.target;
        if (!target) return;
        const isEditable = target.matches('input, textarea, select') || target.isContentEditable || Boolean(target.closest('[contenteditable="true"]'));
        if (!isEditable) return;
        scheduleRealtimeSave();
    };

    REALTIME_SAVE_EVENTS.forEach((evt) => {
        sheetRoot.addEventListener(evt, handleRealtimeInput, true);
    });
}

function scheduleRealtimeSave() {
    if (!hasHydratedCharacter) return;
    realtimeSavePending = true;
    if (realtimeSaveTimeout) return;
    const flush = () => {
        if (!realtimeSavePending) {
            realtimeSaveTimeout = null;
            return;
        }
        if (isUpdatingFromFirebase) {
            realtimeSaveTimeout = setTimeout(flush, REALTIME_SAVE_DEBOUNCE_MS);
            return;
        }
        realtimeSavePending = false;
        realtimeSaveTimeout = null;
        autoSaveCharacterData();
    };
    realtimeSaveTimeout = setTimeout(flush, REALTIME_SAVE_DEBOUNCE_MS);
}

// ===== Theme Management =====
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.characterSheetTheme, theme);
}

// ===== Calculations =====
function calculateAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function calculateAllStats(trustLoadedData = false) {
    // Calculate ability modifiers
    const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    abilities.forEach(ability => {
        let score;
        if (trustLoadedData && characterData.abilities[ability]) {
            score = characterData.abilities[ability];
            console.log(`✅ Using loaded ${ability.toUpperCase()}: ${score}`);
        } else {
            const domValue = document.getElementById(`${ability}Score`).value;
            score = parseInt(domValue) || 10;
            if (!domValue || domValue === '' || score === 10) {
                const errorMsg = `⚠️ ${ability.toUpperCase()} defaulted to 10 (trustLoadedData=${trustLoadedData}, domValue='${domValue}')`;
                console.error(errorMsg);
                showNotification(`⚠️ ERROR: ${ability.toUpperCase()} score defaulted to 10! Check Firebase data.`, 'error');
            }
            characterData.abilities[ability] = score;
        }
        const modifier = calculateAbilityModifier(score);
        const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
        document.getElementById(`${ability}Mod`).textContent = modifierStr;
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
    const initEl = document.getElementById('initiative');
    if (initEl) initEl.textContent = initiativeStr;
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

    // Ability Scores & Modifiers
    ['str','dex','con','int','wis','cha'].forEach((ability) => {
        const score = parseInt(document.getElementById(`${ability}Score`)?.value || '10');
        characterData.abilities[ability] = isNaN(score) ? 10 : score;
        const saveBox = document.getElementById(`${ability}SaveProf`);
        if (saveBox) {
            characterData.saveProficiencies[ability] = saveBox.checked;
        }
    });

    // Skill Proficiencies
    for (const skill of Object.keys(skillAbilities)) {
        const checkbox = document.getElementById(`${skill}Prof`);
        if (checkbox) {
            characterData.skillProficiencies[skill] = checkbox.checked;
        }
    }
    
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
    
    // Ability Scores (must be set BEFORE updateLevelFromXP)
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
    setWeaponsToDOM(data.weapons || []);
    setInventoryToDOM(data.inventory || []);
    setCoinsToDOM(data.coins || { pp:0,gp:0,sp:0,cp:0 });
    
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
    
    // Update level from XP after all DOM is populated
    updateLevelFromXP();
    
    // Recalculate all stats, trusting loaded data for abilities
    calculateAllStats(true);
}

// ===== HP & Rest Helpers =====
function applyDamage() {
    const dmg = parseInt(document.getElementById('damageQuick')?.value || '0') || 0;
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
    showToast(`Took ${dmg} damage`, 'danger');
    autoSaveCharacterData();
}

function applyHeal() {
    const heal = parseInt(document.getElementById('healQuick')?.value || '0') || 0;
    if (heal <= 0) return;
    const maxHp = parseInt(document.getElementById('hpMax').value) || 0;
    let current = parseInt(document.getElementById('hpCurrent').value) || 0;
    current = clamp(current + heal, 0, maxHp);
    document.getElementById('hpCurrent').value = current;
    updateSummaryHeader();
    showToast(`Healed ${heal} HP`, 'success');
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
    const ac = parseInt(document.getElementById('armorClass')?.value) || 10;
    const speedStr = document.getElementById('speed')?.value || '30 ft';
    const hpMax = parseInt(document.getElementById('hpMax')?.value) || 0;
    const hpCur = parseInt(document.getElementById('hpCurrent')?.value) || 0;
    const hpTmp = parseInt(document.getElementById('hpTemp')?.value) || 0;

    const levelPill = document.getElementById('levelPill');

    // nameDisplay is now an input, so just update placeholder if empty
    if (nameDisplay && !nameDisplay.value) {
        nameDisplay.placeholder = 'Character Name';
    }
    if (levelPill) {
        const levelNumber = levelPill.querySelector('.level-number');
        if (levelNumber) {
            levelNumber.textContent = level;
        } else {
            levelPill.textContent = `Lvl ${level}`;
        }
    }
    // Reflect values into hero inputs if present (without overriding user edits for initiative)
    const acInput = document.getElementById('armorClass'); if (acInput && acInput !== document.activeElement) acInput.value = String(ac);
    const speedInput = document.getElementById('speed'); if (speedInput && speedInput !== document.activeElement) speedInput.value = speedStr;
    const hpCurInput = document.getElementById('hpCurrent'); if (hpCurInput && hpCurInput !== document.activeElement) hpCurInput.value = String(hpCur);
    const hpMaxInput = document.getElementById('hpMax'); if (hpMaxInput && hpMaxInput !== document.activeElement) hpMaxInput.value = String(hpMax);
    const hpTempInput = document.getElementById('hpTemp'); if (hpTempInput && hpTempInput !== document.activeElement) hpTempInput.value = String(hpTmp);
    const initSummaryEl = document.getElementById('initSummary');
    if (initSummaryEl) {
        const dexMod = calculateAbilityModifier(characterData.abilities.dex || parseInt(document.getElementById('dexScore')?.value) || 10);
        initSummaryEl.textContent = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
    }
}

// ===== Save/Load Functions =====
function getBlankCharacterTemplate() {
    return JSON.parse(JSON.stringify(CHARACTER_TEMPLATE));
}

function applyCharacterSheetData(data, sourceLabel = 'local data') {
    if (!data) return false;
    Object.assign(characterData, data);
    populateCharacterData(characterData);
    console.log(`📂 Character loaded from ${sourceLabel}`);
    lastSavedSnapshot = serializeCharacterDataForDiff(characterData);
    hasHydratedCharacter = true;
    hydrationLockUntil = Date.now() + 800; // brief lock to suppress redundant autosave
    return true;
}

function autoSaveCharacterData() {
    if (!hasHydratedCharacter) {
        console.log('⏭️ Skipping auto-save: sheet not hydrated yet');
        return;
    }
    if (Date.now() < hydrationLockUntil) {
        // During hydration lock we still update snapshot if user actually changed something material
        const tentative = gatherCharacterData();
        const tentativeSig = serializeCharacterDataForDiff(tentative);
        if (tentativeSig !== lastSavedSnapshot) {
            console.log('⏭️ Hydration lock: material change detected, proceeding to save');
        } else {
            return;
        }
    }
    if (isUpdatingFromFirebase) return;
    const data = gatherCharacterData();
    const diffSignature = serializeCharacterDataForDiff(data);
    if (lastSavedSnapshot === diffSignature) {
        return;
    }
    const previousObj = JSON.parse(lastSavedSnapshot || '{}');
    const changes = collectDiff(previousObj, data);
    if (isTrivialDiff(changes)) {
        lastSavedSnapshot = diffSignature; // accept snapshot silently
        return;
    }
    logCharacterDiff(previousObj, data, changes);
    stampCharacterData(data);

    const finalize = () => {
        lastSavedSnapshot = diffSignature;
        console.log('✅ Character auto-saved');
    };

    if (database && currentCharacterName) {
        saveCharacterToFirebase(data, diffSignature).finally(finalize);
    } else {
        finalize();
    }
}

function logCharacterDiff(previous, current, changes) {
    if (!previous || typeof previous !== 'object') {
        console.log('🆕 Initial save snapshot created.');
        return;
    }
    if (!changes) {
        changes = {};
        compareObjects(previous, current, changes, []);
    }
    if (Object.keys(changes).length === 0) {
        console.log('ℹ️ No material diff detected, skipping log.');
        return;
    }
    console.group('💾 Pending character changes');
    Object.entries(changes).forEach(([path, { before, after }]) => {
        console.log(`${path}:`, before, '→', after);
    });
    console.groupEnd();
}

function collectDiff(previous, current) {
    const changes = {};
    compareObjects(previous, current, changes, []);
    return changes;
}

function isTrivialDiff(changes) {
    const keys = Object.keys(changes);
    if (keys.length === 0) return true;
    return keys.every((k) => {
        if (k === 'updatedAt') return true;
        if (/^spellSlots\.0$/.test(k)) return true; // noise from sparse slots
        const entry = changes[k];
        // weapons undefined -> [] noise on first save
        if (k === 'weapons' && Array.isArray(entry.after) && (entry.before === undefined || entry.before === null) && entry.after.length === 0) return true;
        return false;
    });
}

function compareObjects(prev, curr, collector, trail) {
    if (prev === curr) return;
    if (typeof prev !== 'object' || typeof curr !== 'object' || !prev || !curr) {
        collector[trail.join('.')] = { before: prev, after: curr };
        return;
    }
    const keys = new Set([...Object.keys(prev), ...Object.keys(curr)]);
    keys.forEach((key) => {
        const nextTrail = [...trail, key];
        compareObjects(prev[key], curr[key], collector, nextTrail);
    });
}

// ===== Save/Load Functions =====

function saveCharacterData() {
    const data = gatherCharacterData();
    const diffSignature = serializeCharacterDataForDiff(data);
    stampCharacterData(data);
    lastSavedSnapshot = diffSignature;

    if (database && currentCharacterName) {
        saveCharacterToFirebase(data, diffSignature);
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
    
    const synced = database && currentCharacterName;
    showNotification(synced ? '✅ Character saved to Firebase and downloaded!' : '✅ Character saved and downloaded!');
}

function loadCharacterData(preloadedData = null) {
    const data = preloadedData || getBlankCharacterTemplate();
    applyCharacterSheetData(data, preloadedData ? 'prefill data' : 'blank sheet');
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

// Lightweight toast system for quick feedback (damage/heal/etc.)
let __toastContainer = null;
function ensureToastContainer() {
    if (!__toastContainer) {
        __toastContainer = document.createElement('div');
        __toastContainer.className = 'toast-container';
        document.body.appendChild(__toastContainer);
    }
    return __toastContainer;
}

function showToast(message, type = 'info') {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = type === 'success' ? '✦' : (type === 'danger' ? '⚠' : 'ℹ');
    const text = document.createElement('span');
    text.textContent = message;
    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);
    // Auto dismiss
    const ttl = 2500;
    setTimeout(() => {
        toast.style.animation = 'toastOut 200ms ease forwards';
        setTimeout(() => toast.remove(), 220);
    }, ttl);
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

const CharacterSheetAPI = {
    attemptLogin,
    closeLoginModal,
    saveCharacterData,
    loadCharacterData,
    loadFromFile,
    exportToPDF
};

window.CharacterSheet = {
    ...(window.CharacterSheet || {}),
    ...CharacterSheetAPI
};

window.attemptLogin = attemptLogin;
window.closeLoginModal = closeLoginModal;

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
    ['pp','gp','sp','cp'].forEach(id=>{
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', ()=>{ updateCoinsSummary(); updateEncumbrance(); autoSaveCharacterData(); });
    });
}

function initInventoryCollapsibles() {
    document.querySelectorAll('.inv-toggle').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('aria-controls');
            const target = document.getElementById(targetId);
            if (!target) return;
            const expanded = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            target.classList.toggle('collapsed', expanded);
        });
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
        <td class="row-actions"><button type="button" class="btn-mini icon-btn inventory-remove" title="Remove item" aria-label="Remove item">🗑️</button></td>
    `;
    // Hidden container field to sync with board
    const hidden = document.createElement('input');
    hidden.type = 'hidden'; hidden.className = 'i-container'; hidden.value = item?.container || 'backpack';
    tr.appendChild(hidden);
    tbody.appendChild(tr);
    tr.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{ recalcInventoryRow(tr); updateEncumbrance(); renderInventoryBoard(); autoSaveCharacterData(); }));
    const remover = tr.querySelector('.inventory-remove');
    if (remover) remover.addEventListener('click',()=>{
        tr.remove();
        updateTotalsWeight();
        updateEncumbrance();
        renderInventoryBoard();
        autoSaveCharacterData();
    });
    recalcInventoryRow(tr);
    renderInventoryBoard();
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
    return { pp:val('pp'), gp:val('gp'), sp:val('sp'), cp:val('cp') };
}
function setCoinsToDOM(c) {
    ['pp','gp','sp','cp'].forEach(id=>{ const el=document.getElementById(id); if (el) el.value = c?.[id]??0; });
    updateCoinsSummary();
}
function getCoinsWeight() {
    const {pp,gp,sp,cp} = getCoinsFromDOM();
    const totalCoins = (pp * 1000) + (gp * 100) + (sp * 10) + cp; // in copper
    const weight = totalCoins / 50;
    return weight;
}
function updateCoinsSummary() {
    const c = getCoinsFromDOM();
    const wealthGp = (c.pp*10) + (c.gp) + (c.sp*0.1) + (c.cp*0.01);
    const weight = getCoinsWeight();
    const wEl = document.getElementById('coinsWeight'); if (wEl) wEl.textContent = `${weight.toFixed(1)} lb`;
    const valEl = document.getElementById('coinsWealth'); if (valEl) valEl.textContent = `${wealthGp.toFixed(2)} gp`;
    updateTotalsWeight();
}

function normalizeBankBalance(bank = {}) {
    return {
        gold: Math.max(0, parseInt(bank.gold) || 0),
        silver: Math.max(0, parseInt(bank.silver) || 0),
        copper: Math.max(0, parseInt(bank.copper) || 0)
    };
}

function bankBalanceToString(bank) {
    const parts = [];
    if (bank.gold) parts.push(`${bank.gold.toLocaleString()} gp`);
    if (bank.silver) parts.push(`${bank.silver} sp`);
    if (bank.copper || parts.length === 0) parts.push(`${bank.copper} cp`);
    return parts.join(', ');
}

function getSharedBankBalance() {
    try {
        const raw = localStorage.getItem(BANK_STORAGE_KEY);
        if (raw) {
            return normalizeBankBalance(JSON.parse(raw));
        }
    } catch (error) {
        console.warn('Unable to read bank balance from storage:', error);
    }
    return { gold: 0, silver: 0, copper: 0 };
}

function setSharedBankBalanceLocal(bank) {
    const normalized = normalizeBankBalance(bank);
    try {
        localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(normalized));
    } catch (error) {
        console.warn('Unable to store bank balance:', error);
    }
    updateBankBalanceDisplay(normalized);
    return normalized;
}

function updateBankBalanceDisplay(bank = getSharedBankBalance()) {
    const el = document.getElementById('bankBalanceDisplay');
    if (el) {
        el.textContent = bankBalanceToString(bank);
    }
}

function applySharedBankBalance(bank, { silent = false } = {}) {
    const normalized = setSharedBankBalanceLocal(bank);
    if (!silent) {
        showToast('Bank balance updated', 'info');
    }
    return normalized;
}

function getInventoryFromDOM() {
    const arr=[]; document.querySelectorAll('#inventoryBody tr').forEach(tr=>{
        arr.push({ id: tr.dataset.id, name: tr.querySelector('.i-name').value, weight: parseFloat(tr.querySelector('.i-weight').value||'0'), qty: parseInt(tr.querySelector('.i-qty').value||'0'), container: tr.querySelector('.i-container')?.value || 'backpack' });
    }); return arr;
}
function setInventoryToDOM(list) {
    const tbody=document.getElementById('inventoryBody'); if (!tbody) return; tbody.innerHTML='';
    (list||[]).forEach(i=>addInventoryRow(i));
    updateEncumbrance();
    renderInventoryBoard();
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

// ===== Inventory Board (Drag & Drop) =====
function renderInventoryBoard() {
    const lists = {
        equipped: document.getElementById('invListEquipped'),
        backpack: document.getElementById('invListBackpack'),
        satchel: document.getElementById('invListSatchel'),
        quiver: document.getElementById('invListQuiver')
    };
    if (!lists.backpack) return; // board not present
    Object.values(lists).forEach(el => { if (el) el.innerHTML = ''; });
    const items = getInventoryFromDOM();
    items.forEach(it => {
        const chip = document.createElement('div');
        chip.className = 'inv-chip';
        chip.draggable = true;
        chip.dataset.id = it.id;
        chip.innerHTML = `<span class="name">${it.name || '(item)'}<span class="meta"></span></span>
                          <span class="qty">x${it.qty||1}</span>
                          <span class="meta">${(it.weight||0)} lb</span>`;
        chip.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', it.id);
        });
        chip.addEventListener('dblclick', () => {
            const tr = Array.from(document.querySelectorAll('#inventoryBody tr')).find(r => r.dataset.id === it.id);
            if (!tr) return;
            const name = prompt('Item name:', it.name || '') ?? it.name;
            const qty = parseInt(prompt('Quantity:', String(it.qty||1)) || String(it.qty||1)) || (it.qty||1);
            const weight = parseFloat(prompt('Weight (lb):', String(it.weight||0)) || String(it.weight||0)) || (it.weight||0);
            const nEl = tr.querySelector('.i-name'); if (nEl) nEl.value = name;
            const qEl = tr.querySelector('.i-qty'); if (qEl) qEl.value = qty;
            const wEl = tr.querySelector('.i-weight'); if (wEl) wEl.value = weight;
            recalcInventoryRow(tr);
            updateEncumbrance();
            renderInventoryBoard();
            autoSaveCharacterData();
        });
        const target = lists[it.container] || lists.backpack;
        target.appendChild(chip);
    });
    // Setup droppable areas
    Object.entries(lists).forEach(([key, el]) => {
        if (!el) return;
        el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
        el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
        el.addEventListener('drop', e => {
            e.preventDefault(); el.classList.remove('drag-over');
            const id = e.dataTransfer.getData('text/plain');
            const tr = Array.from(document.querySelectorAll('#inventoryBody tr')).find(r => r.dataset.id === id);
            if (tr) {
                const hidden = tr.querySelector('.i-container');
                if (hidden) hidden.value = key;
                renderInventoryBoard();
                autoSaveCharacterData();
            }
        });
    });
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
    const xp = parseInt(document.getElementById('experiencePoints')?.value) || 0;
    const { level } = calculateLevelFromXP(xp);
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
