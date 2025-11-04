# Darcnia Campaign - Version History

## Current Version: 1.25

### How to Update Version

When making changes, increment the version number and update it in these locations:

1. **web/index.html** (3 places):
   - Line with `<div class="version-display">v1.21</div>` → Change to `v1.22`
   - Line with `<script src="app.js?v=1.21"></script>` → Change to `?v=1.22`
   - Line with `<script src="js/pricing.js?v=1.21"></script>` → Change to `?v=1.22`
   - Line with `<link rel="stylesheet" href="css/styles.css?v=1.21">` → Change to `?v=1.22`

2. **web/js/pricing.js**:
   - Line 3: `console.log('💵 Pricing.js loaded - v1.21');` → Change to `v1.22`

3. **This file (VERSION.md)**:
   - Update "Current Version" at the top
   - Add changelog entry below

---

## Changelog

### v1.25 - November 4, 2025
**CRITICAL FIX:**
- 🐛 **FIXED: All prices showing "0 cp"** - Issue was function name collision
- Root cause: Two `formatPrice()` functions existed - one in `pricing.js` (takes object) and one in `app.js` (takes 3 parameters)
- Solution: Changed `calculateFinalPrice()` to call `formatPrice(priceObj.gp, priceObj.sp, priceObj.cp)` with three separate parameters
- This matches the `app.js` function signature which was being called instead of the `pricing.js` version

**Debugging Journey (v1.22-v1.24):**
- v1.22: Added debug logs to `formatPrice()` in pricing.js
- v1.23: Added debug logs to `copperToPrice()` - proved it worked correctly
- v1.24: Added inline debug logs in `calculateFinalPrice()` - revealed formatPrice() returned "0 cp"
- v1.25: Discovered function collision, fixed parameter passing

### v1.21 - November 4, 2025
**Features:**
- ✨ Added version display system in bottom-left corner
- ✨ Added character level field to character sheet
- ✨ Character level syncs with Firebase
- ✨ Market access now based on character level + item rarity
- ✨ Cart validation checks level requirements before adding items
- 🐛 Fixed currency conversion bug in pricing system (copperToPrice function)
- 🐛 Fixed price display showing "0 cp" for all items

**Technical:**
- Updated `copperToPrice()` to correctly calculate gold/silver/copper breakdown
- Added level field to character sheet HTML
- Character level saved to both `/characterSheet/level` and `/level` in Firebase
- Added `addToCart()` validation using `canAccessItemByRarity()`
- Implemented cache-busting version system

**Market Access Tiers:**
- Common: Level 1+
- Uncommon: Level 3+ (+5% scarcity premium)
- Rare: Level 9+ (+5% scarcity premium)
- Very Rare: Level 13+ (+5% scarcity premium)
- Legendary: Level 17+ (+5% scarcity premium)

---

### Future Versions
- v1.22 - Next update...

---

## Quick Update Checklist
When releasing a new version:
- [ ] Update version number in all 5 locations listed above
- [ ] Update changelog in VERSION.md
- [ ] Commit changes to GitHub
- [ ] Push to main branch
- [ ] GitHub Pages will auto-deploy (~1-2 minutes)
- [ ] Clear browser cache and test
