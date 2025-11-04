# Character Level System Update

## Overview
Added a dedicated character level field to the character sheet that syncs with Firebase and controls market access.

## Changes Made

### 1. Character Sheet HTML (`web/character-sheet.html`)
- Added new **Level** input field (number, 1-20)
- Split "Class & Level" into separate "Level" and "Class" fields
- Level appears before Class in the identity section

### 2. Character Sheet JavaScript (`web/js/character-sheet.js`)
- Added `level: 1` to the `characterData` structure
- Updated `gatherCharacterData()` to save level from the input field
- Updated `populateCharacterData()` to load level into the input field
- Modified `saveCharacterToFirebase()` to:
  - Save level in the character sheet node
  - Save level in the main character node (for market access checks)

### 3. Main App (`web/app.js`)
- Updated `saveCharacterDataToFirebase()` to include level in saved data
- Modified `addToCart()` function to:
  - Validate player level against item rarity requirements
  - Show error message if player tries to buy inaccessible items
  - Display: `❌ Requires Level X to purchase this item`
- Level already used by existing functions:
  - `getCharacterLevel()` - Gets current player level
  - `getRarityRequirement(rarity)` - Maps rarity to required level
  - `canAccessItemByRarity(item)` - Checks if player can access item
  - `showShopDetail()` - Displays items with level requirements

## How It Works

### For Players:
1. Open the **Character Sheet** tab
2. Enter your character level in the **Level** field (1-20)
3. The level is automatically saved to Firebase
4. When browsing the market:
   - Items you can't access show "Requires Level X"
   - Cart button only appears for accessible items
   - Trying to add inaccessible items shows an error

### For DMs:
- DM character has level 20 (full access)
- Can see all items and price controls

### Item Access Rules (Standard 5e):
| Rarity | Required Level |
|--------|----------------|
| Common | Level 1+ |
| Uncommon | Level 3+ |
| Rare | Level 9+ |
| Very Rare | Level 13+ |
| Legendary | Level 17+ |

### Scarcity Premium:
When a character reaches the minimum level for a rarity tier, those newly-unlocked items cost 5% more (scarcity premium). Example:
- Level 3 character pays +5% for Uncommon items
- Level 9 character pays +5% for Rare items

## Testing

1. **Character Sheet:**
   ```
   - Open character-sheet.html
   - Login as Nyra Vex
   - Set level to 3
   - Verify it saves (reload page, should still show 3)
   ```

2. **Market Access:**
   ```
   - Open index.html
   - Login as Nyra Vex (level 3)
   - Go to Market tab
   - Should see: "Your level 3 unlocks items up to Uncommon rarity"
   - Rare items should be grayed with "Requires Level 9"
   - Cart button should NOT appear on Rare items
   ```

3. **Cart Validation:**
   ```
   - Try to manually trigger addToCart() for a Rare item
   - Should see: "❌ Requires Level 9 to purchase this item"
   - Item should NOT be added to cart
   ```

## Firebase Data Structure

```
characters/
  nyra_vex/
    name: "Nyra Vex"
    level: 3              ← New field (synced from character sheet)
    bank: {...}
    cart: [...]
    characterSheet: {
      characterName: "Nyra Vex"
      level: 3            ← Also stored here
      class: "Rogue"
      ...
    }
```

## Notes

- Level defaults to 1 if not set
- Guest characters have level 1
- DM character has level 20
- Level syncs between character sheet and main app via Firebase
- Cart button is hidden in UI for inaccessible items
- Additional validation in `addToCart()` prevents backend bypasses
