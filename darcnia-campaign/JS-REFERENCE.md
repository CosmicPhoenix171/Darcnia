# 📜 JavaScript Module Reference

Quick reference for all JavaScript files in the Darcnia Campaign web app.

---

## 📁 File Structure

```
web/
├── js/
│   ├── app.js              # Main application logic
│   ├── version.js          # Version number (single source of truth)
│   ├── pricing.js          # Dynamic pricing engine
│   └── character-sheet.js  # Character sheet functionality
```

---

## 🎯 Core Modules

### `app.js` (Main Application)
**Location:** `web/js/app.js`  
**Size:** ~4,100 lines  
**Purpose:** Core application logic for the Darcnia campaign site

**Key Functions:**
- `showMarket()` - Display marketplace with shop cards
- `showShopDetail(shopId)` - Open specific shop with items and pricing
- `addToCart(item)` / `removeFromCart(itemKey)` - Shopping cart management
- `showCart()` / `showBank()` - Modal displays
- `parseBluebrickMarketMarkdown(md)` - Parse shop data from markdown
- `renderShopCard(shop)` - Generate HTML for shop cards
- `formatPrice(gold, silver, copper, colored)` - Currency formatting with optional color
- `applyDiscountCopper(totalCopper, discount, method)` - Discount calculations
- `negotiatePrice(item)` - Negotiation mechanics

**Dependencies:**
- Firebase Realtime Database (character sync)
- `version.js` (APP_VERSION)
- `pricing.js` (dynamic pricing engine)

**Data Sources:**
- `contentData.marketShops` - Shop definitions (fallback)
- `handouts/bluebrick-market.md` - Primary shop data (loaded async)

---

### `version.js` (Version Control)
**Location:** `web/js/version.js`  
**Size:** 8 lines  
**Purpose:** Single source of truth for app version

**Exports:**
```javascript
window.APP_VERSION = 'v1.50';
window.BUILD_TIME = document.lastModified;
window.GIT_COMMIT = 'main';
```

**Usage:**
- Referenced in `index.html` and `character-sheet.html` for cache-busting
- Displayed in footer version badge
- Used by `pricing.js` for data compatibility checks

**Update Protocol:**
1. Change version in `version.js`
2. Update `?v=X.XX` in HTML files
3. Commit with version number in message

---

### `pricing.js` (Dynamic Pricing Engine)
**Location:** `web/js/pricing.js`  
**Purpose:** 2d6 bell curve-based price fluctuations

**Key Functions:**
- `rollPriceMultiplier()` - Generates price variation (90%-110%)
- `calculateDailyPrice(basePrice, category)` - Applies multipliers
- `getDailyPriceData()` - Returns current day's pricing state

**Pricing Mechanics:**
- **Weekly Market Index (WMI):** Citywide price trend
- **Category Adjustment:** Different volatility per item type
- **Vendor Adjustment:** Daily shop-specific variation
- **Scarcity Premium:** Edge-of-access items +5%

**Configuration:**
```javascript
VOLATILITY = {
  'Essentials': 1%,
  'Arms & Armor': 2%,
  'Apothecary': 3%,
  'Magic (Common)': 4%,
  // ... up to 10% for Very Rare
}
```

---

### `character-sheet.js` (Character Sheet)
**Location:** `web/js/character-sheet.js`  
**Purpose:** D&D 2024 character sheet functionality

**Key Functions:**
- `calculateModifier(score)` - Ability score → modifier
- `calculateProficiencyBonus(level)` - Level → proficiency
- `updateSkillModifiers()` - Recalculates all skills
- `saveCharacter()` - Firebase sync
- `loadCharacter(id)` - Load from Firebase

**Features:**
- Real-time calculation of modifiers
- Proficiency tracking
- Spell slot management
- Equipment/inventory
- Notes and backstory

**Dependencies:**
- Firebase Realtime Database
- `version.js`

---

## 🔄 Data Flow

```
1. User loads index.html
   ↓
2. version.js sets APP_VERSION
   ↓
3. app.js initializes
   ↓
4. Loads bluebrick-market.md (async)
   ↓
5. parseBluebrickMarketMarkdown() creates shop objects
   ↓
6. pricing.js calculates daily prices
   ↓
7. renderShopCard() displays shops
   ↓
8. User interactions (cart, negotiation, etc.)
   ↓
9. Firebase sync (if logged in)
```

---

## 🔧 Configuration

### Firebase Config
**Location:** `app.js` lines ~50-60

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "darcnia-campaign.firebaseapp.com",
  databaseURL: "https://darcnia-campaign-default-rtdb.firebaseio.com",
  // ...
};
```

### Shop Data Priority
1. **Primary:** `handouts/bluebrick-market.md` (loaded async)
2. **Fallback:** `contentData.marketShops` in `app.js`

---

## 📦 State Management

**Global State Object:**
```javascript
const state = {
  currentCharacter: null,      // Active character
  cart: [],                    // Shopping cart items
  bankBalance: 0,              // Character's money (in copper)
  _currentMarketStock: {},     // Daily shop inventory
  shopFilters: {},             // Search/filter state per shop
  marketShopsLoaded: null      // Cached shop data
};
```

**Persistence:**
- `localStorage` - Cart, bank balance (browser-local)
- Firebase - Character data, sync across devices

---

## 🎨 HTML Generation

**Pattern:** Template literals for dynamic HTML

```javascript
function renderShopCard(shop) {
  return `
    <div class="card shop-card" onclick="showShopDetail('${shop.id}')">
      <div class="shop-card-title">${displayName}</div>
      <div class="shop-card-category">${categoryType}</div>
      <div class="shop-card-subtitle">${escapeHtml(tagline)}</div>
      ...
    </div>
  `;
}
```

**Security:** Always use `escapeHtml()` for user-generated content

---

## 🐛 Debugging

**Console Logging:**
- Shop parsing: `getShopTagline()` logs shop descriptions
- Pricing: `pricing.js` logs daily multipliers
- Firebase: Connection status logged on init

**Browser DevTools:**
- Check `state` object: `console.log(state)`
- Inspect shop data: `console.log(getMarketShops())`
- View pricing: `console.log(getDailyPriceData())`

---

## 🔄 Recent Changes

**v1.50 (Current):**
- Moved `app.js` from web/ → web/js/
- Fixed CSS versioning consistency
- Removed test-pricing.html
- Updated shop category display logic

**v1.46-1.49:**
- Shop description system improvements
- Category name extraction from markdown
- Combined category display (Armor & Weapons)

---

## 📚 Related Documentation

- See `CSS-REFERENCE.md` for styling classes
- See `PRICING-SYSTEM-README.md` for detailed pricing mechanics
- See `HOW-TO-UPDATE-VERSION.md` for version workflow
