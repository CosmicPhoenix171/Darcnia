# Darcnia Campaign - Version History

## Current Version: 1.21

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
