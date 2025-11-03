// ===== D&D 2024 Character Sheet JavaScript =====

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

// Character data structure
let characterData = {
    // Identity
    characterName: '',
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
    attacks: '',
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
    notes: ''
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
    calculateAllStats();
});

function initializeSheet() {
    // Always use dark theme to match campaign site
    setTheme('dark');
}

function checkLoggedInCharacter() {
    // Check if user is logged in from main campaign page
    const savedCharacterName = localStorage.getItem('loggedInCharacter');
    
    if (savedCharacterName && savedCharacterName !== 'Guest') {
        currentCharacterName = savedCharacterName;
        console.log(`📋 Loading character sheet for: ${currentCharacterName}`);
        loadCharacterFromFirebase(currentCharacterName);
        setupFirebaseRealtimeSync(currentCharacterName);
    } else {
        console.log('📋 No character logged in, using local storage only');
        loadCharacterData();
    }
    
    // Update login UI
    updateLoginDisplay();
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
        await database.ref(`characters/${sanitizedName}/characterSheet`).set(data);
        console.log(`💾 Character sheet saved to Firebase for ${currentCharacterName}`);
    } catch (error) {
        console.error('Error saving to Firebase:', error);
    }
}

// ===== Login/Logout Functions =====
function handleLogin() {
    const nameInput = document.getElementById('characterNameLogin');
    const characterName = nameInput.value.trim();
    
    if (!characterName) {
        showNotification('❌ Please enter a character name');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('loggedInCharacter', characterName);
    currentCharacterName = characterName;
    
    // Update UI
    updateLoginDisplay();
    
    // Load character data from Firebase
    loadCharacterFromFirebase(characterName);
    setupFirebaseRealtimeSync(characterName);
    
    showNotification(`✅ Logged in as ${characterName}`);
    console.log(`🔓 Logged in as: ${characterName}`);
}

function handleLogout() {
    // Remove Firebase listener
    if (firebaseListener) {
        firebaseListener.off();
        firebaseListener = null;
    }
    
    // Clear localStorage
    localStorage.removeItem('loggedInCharacter');
    currentCharacterName = null;
    
    // Update UI
    updateLoginDisplay();
    
    // Clear character sheet
    loadCharacterData(); // Load empty/default data
    
    showNotification('👋 Logged out');
    console.log('🔒 Logged out');
}

function updateLoginDisplay() {
    const nameInput = document.getElementById('characterNameLogin');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const display = document.getElementById('loggedInDisplay');
    
    if (currentCharacterName && currentCharacterName !== 'Guest') {
        // Logged in state
        nameInput.style.display = 'none';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        display.textContent = `👤 ${currentCharacterName}`;
        display.style.display = 'inline-block';
    } else {
        // Logged out state
        nameInput.style.display = 'inline-block';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        display.style.display = 'none';
        nameInput.value = '';
    }
}

function setupEventListeners() {
    // Login/Logout buttons
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('characterNameLogin').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
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
    
    // Calculate passive perception
    const perceptionBonus = calculateAbilityModifier(characterData.abilities.wis) + 
                            (characterData.skillProficiencies.perception ? profBonus : 0);
    const passivePerception = 10 + perceptionBonus;
    document.getElementById('passivePerception').textContent = passivePerception;
}

// ===== Data Management =====
function gatherCharacterData() {
    // Identity
    characterData.characterName = document.getElementById('characterName').value;
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
    characterData.attacks = document.getElementById('attacks').value;
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
    
    return characterData;
}

function populateCharacterData(data) {
    // Identity
    document.getElementById('characterName').value = data.characterName || '';
    document.getElementById('class').value = data.class || '';
    document.getElementById('background').value = data.background || '';
    document.getElementById('species').value = data.species || '';
    document.getElementById('alignment').value = data.alignment || '';
    document.getElementById('experiencePoints').value = data.experiencePoints || 0;
    
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
    document.getElementById('attacks').value = data.attacks || '';
    document.getElementById('equipment').value = data.equipment || '';
    
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
    
    // Recalculate all stats
    calculateAllStats();
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
