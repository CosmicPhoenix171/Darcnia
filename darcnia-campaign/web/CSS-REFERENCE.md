# 🎨 CSS Class Reference Guide

Quick reference for all new CSS classes and features added to the Darcnia Campaign web app.

---

## 🎯 Typography Classes

### Text Emphasis
```html
<p class="lead">Important introductory paragraph with larger text</p>
<span class="dramatic-text">EPIC QUEST</span>
<span class="legendary-text">LEGENDARY ITEM</span>
<small class="text-small">Fine print or details</small>
```

### Utility Text Colors
```html
<span class="text-gold">Gold text</span>
<span class="text-purple">Purple text</span>
<span class="text-cyan">Cyan text</span>
```

---

## 📦 Card Variations

### Rarity Cards
```html
<div class="card" data-rarity="Common">Common item card</div>
<div class="card" data-rarity="Uncommon">Uncommon item card</div>
<div class="card" data-rarity="Rare">Rare item card</div>
<div class="card" data-rarity="Very Rare">Very Rare item card</div>
<div class="card" data-rarity="Legendary">Legendary item card</div>
```

### Featured/New Items
```html
<div class="card item-new">New item with badge and glow</div>
<div class="card item-featured">Featured item with pulse</div>
<div class="card" data-featured="true">Alternative featured syntax</div>
```

---

## 📋 Market List Items

### With Icons and Rarity
```html
<ul class="market-list">
    <li data-icon="⚔️" data-rarity="Rare">
        <strong>Longsword</strong>
        <span class="card-meta">1d8 slashing</span>
        <span class="tag rarity" data-rarity="Rare">Rare</span>
    </li>
    <li data-icon="🛡️" data-rarity="Uncommon">
        <strong>Shield</strong>
        <span class="card-meta">+2 AC</span>
        <span class="tag rarity" data-rarity="Uncommon">Uncommon</span>
    </li>
</ul>
```

### Icon Examples
- `⚔️` Weapons
- `🛡️` Armor
- `🎒` General gear
- `📜` Scrolls/documents
- `💎` Gems/valuables
- `🧪` Potions
- `🔮` Magic items
- `🗝️` Keys
- `💰` Currency
- `🎲` Game items

---

## 🎪 Collapsible Sections

```html
<div class="collapsible-section">
    <div class="collapsible-header">
        <div class="collapsible-title">
            <span class="collapsible-badge">12</span>
            Weapons
        </div>
        <span class="collapsible-icon">▼</span>
    </div>
    <div class="collapsible-content">
        <!-- Content goes here -->
    </div>
</div>

<!-- When expanded, add class: -->
<div class="collapsible-section expanded">
    <!-- ... -->
</div>
```

---

## 🏷️ Rarity Tags

```html
<span class="tag rarity" data-rarity="Common">Common</span>
<span class="tag rarity" data-rarity="Uncommon">Uncommon</span>
<span class="tag rarity" data-rarity="Rare">Rare</span>
<span class="tag rarity" data-rarity="Very Rare">Very Rare</span>
<span class="tag rarity" data-rarity="Legendary">Legendary</span>
<span class="tag attune">Requires Attunement</span>
```

---

## ⏳ Loading States

### Spell Circle Loader
```html
<div class="loading">
    <span class="loading-text">Consulting the guild archives<span class="loading-dots"></span></span>
</div>
```

### Skeleton Screens
```html
<div class="skeleton skeleton-title"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text" style="width: 80%;"></div>
<div class="skeleton skeleton-card"></div>
<div class="skeleton skeleton-avatar"></div>
```

### Potion Loader
```html
<div class="loading-potion"></div>
```

---

## 🎬 Animation Classes

### General
```html
<div class="bounce">Bouncing element</div>
<div class="spinner">Rotating spinner</div>
```

### Rarity-Based
```html
<div class="rarity-legendary">Auto-sparkles (for legendary items)</div>
```

---

## 📱 Responsive Classes

### Hidden on Mobile
```html
<div class="hidden-mobile">Hidden on screens < 768px</div>
```

### Show Only on Mobile
```html
<div class="show-mobile">Visible only on mobile</div>
```

---

## ♿ Accessibility

### Skip Link (Add to beginning of body)
```html
<a href="#main-content" class="skip-to-content">Skip to content</a>
```

### Keyboard Navigation
The app automatically detects keyboard navigation and adds the `.keyboard-nav-active` class to `<body>` when Tab is pressed.

---

## 🎨 Shop Cards

```html
<div class="card shop-card">
    <h3 class="shop-card-title">Brass Buckle Outfitters</h3>
    <p class="shop-card-subtitle">General Gear & Adventuring Supplies</p>
    <!-- Shop content -->
</div>
```

---

## 🎯 Data Attributes

### For JavaScript Hooks
```javascript
// Rarity
data-rarity="Common|Uncommon|Rare|Very Rare|Legendary"

// Featured
data-featured="true"

// Icons
data-icon="🎲" // Any emoji or Unicode character

// Tab navigation
data-tab="market|quests|guilds|etc"
```

---

## 💡 Usage Tips

### 1. Combine Classes for Maximum Effect
```html
<div class="card item-new" data-rarity="Legendary">
    <h3 class="legendary-text">SWORD OF DESTINY</h3>
    <p class="lead">A weapon of unparalleled power...</p>
</div>
```

### 2. Use Semantic HTML
```html
<!-- Good -->
<article class="card">
    <h3>Title</h3>
    <p>Content</p>
</article>

<!-- Avoid -->
<div class="card">
    <div class="title">Title</div>
    <div>Content</div>
</div>
```

### 3. Accessibility First
Always include proper ARIA labels and semantic elements:
```html
<button aria-label="Close modal" class="modal-close">&times;</button>
<nav aria-label="Main navigation" class="tabs">...</nav>
```

### 4. Mobile-First Breakpoints
- **1200px** - Large tablets and small desktops
- **992px** - Tablets
- **768px** - Mobile devices
- **480px** - Small mobile
- **Landscape** - Special handling for landscape orientation

---

## 🎨 Color Variables Reference

```css
/* Use these in custom styles */
var(--primary-bg)       /* Background gradient */
var(--header-gradient)  /* Header background */
var(--card-bg)          /* Card background */
var(--card-border)      /* Card border color */
var(--accent-gold)      /* Primary gold (#ffd700) */
var(--accent-purple)    /* Primary purple (#ba68c8) */
var(--accent-cyan)      /* Accent cyan (#00e5ff) */
var(--text-primary)     /* Main text (#f5f5f5) */
var(--text-muted)       /* Secondary text (#b39ddb) */
var(--text-gold)        /* Gold text (#ffecb3) */
var(--glow-sm)          /* Small glow effect */
var(--glow-md)          /* Medium glow effect */
var(--glow-lg)          /* Large glow effect */
var(--shadow-deep)      /* Deep shadow */
```

---

## 🚀 Performance Tips

1. **Animations:** All animations respect `prefers-reduced-motion`
2. **Images:** Use lazy loading with `loading="lazy"`
3. **Touch:** 44px+ tap targets for mobile
4. **Scroll:** Passive event listeners for smooth scrolling
5. **GPU:** All transforms use hardware acceleration

---

## 📚 Example Combinations

### Epic Item Card
```html
<div class="card" data-rarity="Legendary">
    <h3 class="legendary-text">STAFF OF THE MAGI</h3>
    <p class="lead">An artifact of incredible power...</p>
    <ul>
        <li><strong>Damage:</strong> 1d6 + 2 bludgeoning</li>
        <li><strong>Special:</strong> 50 charges</li>
    </ul>
    <div class="card-tags">
        <span class="tag rarity" data-rarity="Legendary">Legendary</span>
        <span class="tag attune">Requires Attunement</span>
    </div>
</div>
```

### Shop Section
```html
<div class="collapsible-section expanded">
    <div class="collapsible-header">
        <div class="collapsible-title">
            <span class="collapsible-badge">8</span>
            Weapons
        </div>
        <span class="collapsible-icon">▼</span>
    </div>
    <div class="collapsible-content">
        <ul class="market-list">
            <li data-icon="⚔️" data-rarity="Common">
                <strong>Longsword</strong>
                <span class="card-meta">1d8 slashing</span>
                <span class="tag rarity" data-rarity="Common">Common</span>
                <span class="card-meta">15 gp</span>
            </li>
        </ul>
    </div>
</div>
```

---

**Happy styling! 🎨✨**
