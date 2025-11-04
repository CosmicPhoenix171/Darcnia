// ===== Dynamic Pricing Engine for Bluebrick Market =====
// Implements realistic price fluctuations using 2d6 bell curves
console.log('💵 Pricing.js loaded -', window.APP_VERSION || 'v1.25');

/**
 * Roll 2d6 and return the sum (2-12, centered on 7)
 */
function roll2d6() {
    return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

/**
 * Convert a 2d6 roll (2-12) to an offset from center (7)
 * Result: -5 to +5
 */
function rollToOffset(roll) {
    return roll - 7;
}

/**
 * Calculate multiplier from offset and step size, with clamping
 * @param {number} offset - The offset from center (-5 to +5)
 * @param {number} stepSize - Percentage per offset step (e.g., 0.02 for 2%)
 * @param {number} min - Minimum multiplier (e.g., 0.90)
 * @param {number} max - Maximum multiplier (e.g., 1.10)
 */
function offsetToMultiplier(offset, stepSize, min, max) {
    const multiplier = 1 + (offset * stepSize);
    return Math.max(min, Math.min(max, multiplier));
}

/**
 * Category configuration for different item types
 */
const CATEGORY_CONFIG = {
    // Essentials: Food, Drink, Lodging, General L0 gear
    'essentials': {
        stepSize: 0.01,
        min: 0.92,
        max: 1.08
    },
    // Ammo & Ranged Supplies
    'ammo': {
        stepSize: 0.02,
        min: 0.85,
        max: 1.15
    },
    // Arms & Armor (mundane)
    'armor': {
        stepSize: 0.02,
        min: 0.80,
        max: 1.20
    },
    // Tools, Kits, Focuses, Books
    'tools': {
        stepSize: 0.015,
        min: 0.88,
        max: 1.12
    },
    // Apothecary (potions, acids, holy water, poison)
    'apothecary': {
        stepSize: 0.03,
        min: 0.70,
        max: 1.30
    },
    // Mounts, Vehicles, Feed
    'mounts': {
        stepSize: 0.03,
        min: 0.75,
        max: 1.25
    },
    // Services (cabs, hirelings, passage)
    'services': {
        stepSize: 0.01,
        min: 0.90,
        max: 1.10
    },
    // Magic items by rarity
    'magic-common': {
        stepSize: 0.04,
        min: 0.70,
        max: 1.40
    },
    'magic-uncommon': {
        stepSize: 0.06,
        min: 0.60,
        max: 1.60
    },
    'magic-rare': {
        stepSize: 0.08,
        min: 0.50,
        max: 2.00
    },
    'magic-very-rare': {
        stepSize: 0.10,
        min: 0.40,
        max: 2.50
    },
    'magic-legendary': {
        stepSize: 0,
        min: 1.00,
        max: 1.00  // Legendary items don't fluctuate automatically
    }
};

/**
 * Map shop/category names to category configs
 */
function getCategoryKey(shopId, categoryName, itemRarity) {
    const shopLower = (shopId || '').toLowerCase();
    const catLower = (categoryName || '').toLowerCase();
    const rarityLower = (itemRarity || '').toLowerCase();
    
    // Magic items use rarity-based categories
    if (shopLower.includes('arcane') || rarityLower.includes('common') || rarityLower.includes('uncommon') || rarityLower.includes('rare') || rarityLower.includes('legendary')) {
        if (rarityLower.includes('legendary')) return 'magic-legendary';
        if (rarityLower.includes('very rare')) return 'magic-very-rare';
        if (rarityLower.includes('rare')) return 'magic-rare';
        if (rarityLower.includes('uncommon')) return 'magic-uncommon';
        return 'magic-common';
    }
    
    // Map by category/shop names
    if (catLower.includes('ammo') || catLower.includes('arrow') || catLower.includes('bolt') || shopLower.includes('feathers')) return 'ammo';
    if (catLower.includes('armor') || catLower.includes('weapon') || catLower.includes('arms') || shopLower.includes('smiths-bench')) return 'armor';
    if (catLower.includes('tool') || catLower.includes('kit') || catLower.includes('focus') || catLower.includes('utility')) return 'tools';
    if (catLower.includes('apothecary') || catLower.includes('potion') || catLower.includes('tonic') || catLower.includes('elixir') || shopLower.includes('rue')) return 'apothecary';
    if (catLower.includes('mount') || catLower.includes('vehicle') || catLower.includes('stable') || shopLower.includes('south-gate')) return 'mounts';
    if (catLower.includes('service') || catLower.includes('lodging') || catLower.includes('meal') || catLower.includes('stabling')) return 'services';
    
    // Default to essentials
    return 'essentials';
}

/**
 * Calculate Weekly Market Index (WMI)
 * Affects all items citywide
 */
function calculateWMI() {
    const roll = roll2d6();
    const offset = rollToOffset(roll);
    return {
        roll,
        offset,
        multiplier: offsetToMultiplier(offset, 0.02, 0.90, 1.10)
    };
}

/**
 * Calculate Category Adjustment (CatAdj)
 */
function calculateCategoryAdjustment(categoryKey) {
    const config = CATEGORY_CONFIG[categoryKey] || CATEGORY_CONFIG['essentials'];
    const roll = roll2d6();
    const offset = rollToOffset(roll);
    return {
        roll,
        offset,
        multiplier: offsetToMultiplier(offset, config.stepSize, config.min, config.max)
    };
}

/**
 * Calculate Vendor Adjustment (VendorAdj)
 * Daily per-shop variance (haggling, mood, traffic)
 */
function calculateVendorAdjustment() {
    const roll = roll2d6();
    const offset = rollToOffset(roll);
    return {
        roll,
        offset,
        multiplier: offsetToMultiplier(offset, 0.01, 0.97, 1.03)
    };
}

/**
 * Event adjustments (manual/DM-triggered)
 */
const EVENT_ADJUSTMENTS = {
    'none': 1.00,
    'festival-sale': 0.95,
    'harvest-glut': 0.90,
    'caravan-delay': 1.15,
    'war-scare': 1.25,
    'plague-shortage': 1.35,
    'guild-tariff': 1.10
};

/**
 * Parse a price string like "5 gp", "3 sp 2 cp", "1,500 gp"
 * Returns total in copper pieces
 */
function parsePriceToCopper(priceStr) {
    let copper = 0;
    
    // Remove commas and extra spaces
    const cleaned = priceStr.replace(/,/g, '').toLowerCase();
    
    const gpMatch = cleaned.match(/(\d+)\s*gp/);
    const spMatch = cleaned.match(/(\d+)\s*sp/);
    const cpMatch = cleaned.match(/(\d+)\s*cp/);
    
    if (gpMatch) copper += parseInt(gpMatch[1]) * 100;
    if (spMatch) copper += parseInt(spMatch[1]) * 10;
    if (cpMatch) copper += parseInt(cpMatch[1]);
    
    return copper;
}

/**
 * Convert copper to a price object {gp, sp, cp}
 */
function copperToPrice(totalCopper) {
    const gp = Math.floor(totalCopper / 100);
    const remaining = totalCopper - (gp * 100);
    const sp = Math.floor(remaining / 10);
    const cp = remaining % 10;
    
    // DEBUG: Log conversion for verification
    if (totalCopper === 208) {
        console.log('🔍 copperToPrice(208):', { gp, sp, cp, remaining });
    }
    
    return { gp, sp, cp };
}

/**
 * Format a price object to string
 */
function formatPrice(priceObj) {
    console.log('🔍 formatPrice input:', priceObj);
    const parts = [];
    if (priceObj.gp > 0) parts.push(`${priceObj.gp.toLocaleString()} gp`);
    if (priceObj.sp > 0) parts.push(`${priceObj.sp} sp`);
    if (priceObj.cp > 0) parts.push(`${priceObj.cp} cp`);
    const result = parts.length > 0 ? parts.join(', ') : '0 cp';
    console.log('🔍 formatPrice output:', result, 'parts:', parts);
    return result;
}

/**
 * Calculate final price for an item
 * @param {string} basePrice - Original price string (e.g., "50 gp")
 * @param {object} multipliers - {wmi, catAdj, vendorAdj, eventAdj, scarcityAdj}
 * @returns {object} - {baseCopper, finalCopper, basePriceStr, finalPriceStr, breakdown}
 */
function calculateFinalPrice(basePrice, multipliers) {
    console.log('🔍 calculateFinalPrice called with:', basePrice);
    const baseCopper = parsePriceToCopper(basePrice);
    
    const {
        wmi = 1.0,
        catAdj = 1.0,
        vendorAdj = 1.0,
        eventAdj = 1.0,
        scarcityAdj = 1.0
    } = multipliers;
    
    // Apply all multipliers
    const totalMultiplier = wmi * catAdj * vendorAdj * eventAdj * scarcityAdj;
    let finalCopper = Math.round(baseCopper * totalMultiplier);
    
    // Ensure minimum price of 1 cp
    finalCopper = Math.max(1, finalCopper);
    
    // Convert copper to price components
    const priceObj = copperToPrice(finalCopper);
    console.log('🔍 About to format price:', priceObj);
    const formattedPrice = formatPrice(priceObj.gp, priceObj.sp, priceObj.cp);
    console.log('🔍 Formatted result:', formattedPrice);
    
    return {
        baseCopper,
        finalCopper,
        basePriceStr: basePrice,
        finalPriceStr: formattedPrice,
        breakdown: {
            wmi,
            catAdj,
            vendorAdj,
            eventAdj,
            scarcityAdj,
            total: totalMultiplier
        }
    };
}

/**
 * Get ISO week number for consistent weekly rerolls
 */
function getISOWeek(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
}

/**
 * Get current date string (YYYY-MM-DD) for daily rerolls
 */
function getDateString(date = new Date()) {
    return date.toISOString().split('T')[0];
}

// Export functions for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        roll2d6,
        calculateWMI,
        calculateCategoryAdjustment,
        calculateVendorAdjustment,
        calculateFinalPrice,
        getCategoryKey,
        getISOWeek,
        getDateString,
        EVENT_ADJUSTMENTS,
        CATEGORY_CONFIG
    };
}
