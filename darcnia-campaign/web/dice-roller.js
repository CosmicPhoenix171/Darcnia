// Dice Roller JavaScript
const diceState = {
    mode: 'normal', // 'normal', 'adv', 'dis'
    history: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Mode buttons
    document.querySelectorAll('.dice-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setMode(mode);
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
    
    rollBtn.addEventListener('click', () => {
        rollCustomFormula(customInput.value);
    });

    customInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            rollCustomFormula(customInput.value);
        }
    });
}

function setMode(mode) {
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
