# D&D 2024 Character Sheet

A modern, web-optimized character sheet designed for the Dungeons & Dragons 2024 (One D&D / Revised 5e) ruleset.

## ✨ Features

### Core D&D 2024 Compliance
- ✅ **Species** field (replacing "Race" per 2024 rules)
- ✅ **Skills grouped by ability scores** (STR, DEX, CON, INT, WIS, CHA)
- ✅ **3 Attunement Slots** for magic items
- ✅ **Expanded sections** for Class Features, Feats, and Spells
- ✅ **Condensed personality traits** (Background, Ideals, Bonds, Flaws)

### Auto-Calculations
- 🎲 **Ability Modifiers** automatically calculated from scores
- 🎲 **Saving Throws** with proficiency bonus application
- 🎲 **Skill Bonuses** calculated from ability modifiers + proficiency
- 🎲 **Initiative** based on Dexterity modifier
- 🎲 **Passive Perception** (10 + Wisdom mod + proficiency if applicable)

### Modern Web Features
- 💾 **Auto-save** to browser localStorage (saves every 1 second after changes)
- 📥 **Download character** as JSON file
- 📤 **Load character** from saved JSON file
- 🖨️ **Print-friendly** layout for physical copies
- 📄 **PDF export** via print dialog
- 🌓 **Dark mode toggle** for digital play
- 📱 **Fully responsive** (desktop, tablet, mobile)

### Design
- 📜 **Parchment aesthetic** with warm neutrals and gold accents
- 🎨 **Dark red highlights** for headers and important stats
- 🖋️ **Cormorant Garamond** font (medieval serif)
- ✨ **Smooth animations** and transitions
- 🎯 **Clean, readable layout** optimized for gameplay

## 🚀 Usage

### Access the Sheet
1. From the main Darcnia campaign page, click **"📋 Character Sheet"** in the navigation
2. Or directly visit `character-sheet.html`

### Creating a Character
1. Fill in your character's identity (name, class, species, background)
2. Set your ability scores (automatically calculates modifiers)
3. Check proficiency boxes for saves and skills
4. Enter combat stats (AC, HP, Speed)
5. Add attacks, equipment, and spells
6. Fill in personality traits and features

### Saving Your Character
- **Auto-save**: Changes are automatically saved to your browser every second
- **Manual save**: Click the **💾 Save** button to download a JSON file
- **Load character**: Click the **📂 Load** button to import a saved JSON file

### Exporting
- **Print**: Click **🖨️ Print** for a physical copy
- **PDF**: Click **📄 Export as PDF** to save as PDF (uses browser print dialog)

## 🎮 Keyboard Shortcuts
- No keyboard shortcuts currently (all mouse/touch based)

## 📂 File Structure
```
web/
├── character-sheet.html        # Main character sheet page
├── css/
│   └── character-sheet.css     # Character sheet styling
└── js/
    └── character-sheet.js      # Auto-calculations & data management
```

## 🎨 Theme Colors

### Light Theme (Default)
- Background: `#f4e8d4` (parchment)
- Text: `#2c1810` (dark brown)
- Accent Gold: `#d4af37`
- Accent Red: `#8b2f2f`

### Dark Theme
- Background: `#1a1410` (dark brown)
- Text: `#e8dcc8` (light tan)
- Accent Gold: `#d4af37`
- Accent Red: `#c65353`

## 🔧 Technical Details

### Data Storage
- Uses **localStorage** for persistent auto-save
- Key: `dnd2024CharacterSheet`
- Format: JSON object with all character data

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

## 🎯 Future Enhancements (Potential)
- [ ] Firebase integration for cloud storage
- [ ] Multi-character management
- [ ] Dice roller integration
- [ ] Spell slot tracking with reset buttons
- [ ] Hit dice recovery automation
- [ ] Experience points to level calculator
- [ ] Inventory weight tracking
- [ ] Currency converter (cp/sp/gp)

## 📝 Character Data Format

```json
{
  "characterName": "Nyra Vex",
  "class": "Rogue 5",
  "species": "Human",
  "background": "Criminal",
  "alignment": "Chaotic Good",
  "experiencePoints": 6500,
  "abilities": {
    "str": 10,
    "dex": 18,
    "con": 14,
    "int": 12,
    "wis": 13,
    "cha": 10
  },
  "proficiencyBonus": 3,
  "inspiration": false,
  "saveProficiencies": {
    "dex": true,
    "int": true
  },
  "skillProficiencies": {
    "acrobatics": true,
    "stealth": true,
    "perception": true,
    "investigation": true
  },
  "armorClass": 16,
  "speed": "30 ft",
  "hpMax": 35,
  "hpCurrent": 35,
  "attunement": [
    { "attuned": true, "item": "Cloak of Elvenkind" },
    { "attuned": false, "item": "" },
    { "attuned": false, "item": "" }
  ]
  // ... additional fields
}
```

## 🐛 Known Issues
- None currently

## 💡 Tips
- Use **Tab** key to navigate between form fields quickly
- Check **Inspiration** checkbox when your DM grants inspiration
- Use the **Death Saves** checkboxes during combat encounters
- Track **Temporary HP** separately from current HP
- Mark **Attunement** checkboxes when you attune to magic items
- Download your character after each session as backup

## 📞 Support
For issues or questions, contact the DM or check the campaign documentation.

---

**Built for the Darcnia Campaign** | D&D 2024 Ruleset | Version 1.0
