# Dynamic Pricing System for Bluebrick Market

## Overview

This system implements realistic price fluctuations for the Bluebrick Market using 2d6 bell curve rolls and multiple multiplier layers. All prices are synchronized across browsers using Firebase Firestore, ensuring every player sees the same prices.

## Architecture

### Files
- **`web/js/pricing.js`** - Core pricing calculation engine
- **`web/app.js`** - Firebase Firestore integration and UI updates
- **`web/index.html`** - Updated to include Firestore SDK
- **`darcnia-campaign/handouts/bluebrick-market.md`** - Player-facing rules documentation

### Firebase Collections

The system uses three Firestore collections:

1. **`marketState/wmi`** - Weekly Market Index (citywide multiplier)
   - Resets each ISO week
   - Fields: `week`, `roll`, `offset`, `multiplier`, `updatedAt`

2. **`categoryAdjustments/{categoryKey}`** - Per-category multipliers
   - Resets each ISO week
   - Fields: `week`, `categoryKey`, `roll`, `offset`, `multiplier`, `updatedAt`

3. **`vendorAdjustments/{shopId}`** - Per-shop daily variance
   - Resets each day (UTC)
   - Fields: `date`, `shopId`, `roll`, `offset`, `multiplier`, `updatedAt`

4. **`marketState/activeEvent`** - Current market event (DM-controlled)
   - Fields: `event`, `updatedAt`

## How It Works

### Price Calculation Formula

```
Final Price = Base Price × WMI × CatAdj × VendorAdj × EventAdj × ScarcityAdj
```

### Multiplier Generation

Each multiplier uses **2d6 rolls** (centered on 7, range 2-12):

```javascript
roll2d6() → sum of two 1d6 rolls
offset = roll - 7  // Range: -5 to +5
multiplier = 1 + (offset × stepSize)
multiplier = clamp(multiplier, min, max)
```

### Category Configuration

Different item types have different volatility:

| Category | Step Size | Min | Max | Variance |
|----------|-----------|-----|-----|----------|
| Essentials | 1% | 0.92 | 1.08 | Low |
| Ammo | 2% | 0.85 | 1.15 | Medium |
| Armor | 2% | 0.80 | 1.20 | Medium |
| Tools | 1.5% | 0.88 | 1.12 | Low-Medium |
| Apothecary | 3% | 0.70 | 1.30 | High |
| Mounts | 3% | 0.75 | 1.25 | High |
| Services | 1% | 0.90 | 1.10 | Very Low |
| Magic (Common) | 4% | 0.70 | 1.40 | High |
| Magic (Uncommon) | 6% | 0.60 | 1.60 | Very High |
| Magic (Rare) | 8% | 0.50 | 2.00 | Extreme |
| Magic (Very Rare) | 10% | 0.40 | 2.50 | Extreme |

## DM Controls

When logged in as DM, the market page displays an admin panel with these controls:

### 🔄 Reroll Weekly Market
Forces a new 2d6 roll for the WMI. Affects all items citywide immediately.

### 🔄 Reroll All Categories
Forces new 2d6 rolls for every category adjustment. Major market shake-up.

### 🎪 Set Event
Choose from predefined market events:
- **None** (100%) - Normal market
- **Festival Sale** (95%) - Merchants discount
- **Harvest Glut** (90%) - Food/drink cheap
- **Caravan Delay** (115%) - Goods scarce
- **War Scare** (125%) - Arms/armor spike
- **Plague/Shortage** (135%) - Apothecary scarce
- **Guild Tariff Strike** (110%) - Broad increase

### 📊 View Multipliers
Shows current WMI, active event, and sample category multipliers with their rolls.

## User Experience

### For Players
- Browse shops and see **final prices** automatically
- Base prices shown crossed out if changed
- Prices update in real-time if DM changes market conditions
- Shopping cart uses dynamic prices
- All players see identical prices (Firebase sync)

### For DM
- Full control over market economics
- Can simulate supply shocks, festivals, wars, etc.
- Changes propagate to all players instantly
- View detailed multiplier breakdowns

## Technical Details

### Automatic Resets

- **Weekly (WMI & CatAdj):** Checks ISO week number; generates new values on week boundary
- **Daily (VendorAdj):** Checks date string (YYYY-MM-DD); generates new values at midnight UTC

### Fallback Behavior

If Firestore is unavailable:
- System falls back to local calculation
- Prices still fluctuate but won't sync across browsers
- Console warns about Firebase unavailability

### Price Display

```javascript
// In shop detail view
const priceData = await calculateItemPrice(
    basePrice,
    shopId,
    categoryName,
    itemRarity,
    itemLevel
);

// Shows: 50 gp → 52 gp, 5 sp (if changed)
// Or just: 50 gp (if no change)
```

### Rounding

Prices round to the nearest copper, maintaining denomination consistency:
- 9 cp remains 9 cp
- 10 cp converts to 1 sp
- Large gold amounts display with commas: 1,500 gp

## Testing

### Local Testing
1. Open `web/index.html` in a browser
2. Login as DM (username: `dm`, password: `dmpass2025`)
3. Navigate to Market tab
4. Test DM controls to reroll prices or set events
5. Open shop details to see dynamic prices

### Multi-Browser Sync Testing
1. Open market in Chrome (as DM)
2. Open market in Firefox (as player: `nyra vex`, password: `rogue123`)
3. Reroll prices in Chrome
4. Verify Firefox shows updated prices after refresh

### Firestore Rules (Required)

Add to Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read for all authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
    }
    
    // Allow write only for DM (add custom claims or use admin SDK)
    match /marketState/{doc} {
      allow write: if request.auth != null && request.auth.token.dm == true;
    }
    match /categoryAdjustments/{doc} {
      allow write: if request.auth != null && request.auth.token.dm == true;
    }
    match /vendorAdjustments/{doc} {
      allow write: if request.auth != null && request.auth.token.dm == true;
    }
  }
}
```

**Note:** For development, you can temporarily set rules to allow public read/write, but **secure before production**.

## Maintenance

### Weekly Tasks
- Monitor WMI values (should stay within 90%–110%)
- Review category multipliers for outliers
- Clear old event if it's been active too long

### Monthly Tasks
- Review Firestore usage (reads/writes)
- Archive old market state if needed
- Update event options based on campaign narrative

## Future Enhancements

Possible improvements:
- [ ] Add seasonal trends (e.g., winter increases mount/feed prices)
- [ ] Historical price charts
- [ ] Player notifications when prices drop significantly
- [ ] Merchant reputation system (favorite vendors give discounts)
- [ ] Bulk purchase discounts
- [ ] Trade goods arbitrage opportunities

---

**Built for:** Darcnia D&D 5e Campaign  
**Version:** 1.0  
**Last Updated:** November 4, 2025
