# Darcnia Campaign - Interactive Web Reference

An interactive website for your players to search and explore campaign information.

## Features

✅ **Full Search** - Search across all guilds, NPCs, locations, items, quests, and lore  
✅ **Access Control** - Only player-accessible content (no DM secrets)  
✅ **Organized Tabs** - Easy navigation by category  
✅ **Dark/Light Theme** - Toggle with button in header  
✅ **Mobile Responsive** - Works on phones, tablets, and desktops  
✅ **Quick Reference Sidebar** - Context-sensitive shortcuts  
✅ **Interactive Details** - Click cards to see full information  

---

## How to Use

### Option 1: Open Locally (Easiest)
1. Navigate to `/workspaces/Darcnia/darcnia-campaign/web/`
2. Open `index.html` in any web browser
3. That's it! No server needed.

### Option 2: Host on GitHub Pages (For Remote Players)
1. Commit the `web/` folder to your repository
2. Go to GitHub Settings → Pages
3. Set source to `main` branch, `/web` folder
4. Your site will be live at: `https://CosmicPhoenix171.github.io/Darcnia/`

### Option 3: Use VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Share the local URL with players on same network

---

## Current Content

### Guilds (11 Total)
- Guild Crystalia (player's guild - only 5 members)
- Crimson Vanguard, Stormcallers' Covenant, Gilded Compass
- Hearthkeepers, Iron Covenant, Silent Vigil
- Merchant's Concord, Arkwright Circle, Shadowweave, City Watch

### NPCs (2 Currently)
- Eldon Thorne (Guild Master)
- Lyra Windfern (Receptionist)

### Locations
- Guild Crystalia Hall
- Heart Plaza
- Hearthstone Inn

### Items
- Guild Crest Tattoo (with abilities)

### Quests
- Missing Cat (easy)
- Shadows in the Basement (medium, plot-critical)

### Handouts
- Tavern Rumors
- Guild Job Board

### Lore
- World of Darcnia
- Guild System

---

## Adding More Content

To add more content, edit `app.js` and add to the `contentData` object:

### Add a New Guild
```javascript
contentData.guilds.push({
    id: 'new-guild-id',
    name: 'Guild Name',
    motto: 'Guild motto',
    type: 'Guild type',
    leader: 'Leader name',
    size: 'Size description',
    reputation: 'Neutral (0)',
    description: 'Brief description',
    keyInfo: ['Point 1', 'Point 2'],
    services: ['Service 1', 'Service 2'],
    location: 'Location name'
});
```

### Add a New NPC
```javascript
contentData.npcs.push({
    id: 'npc-id',
    name: 'NPC Name',
    title: 'Title/Role',
    race: 'Race',
    age: 'Age',
    class: 'Class',
    personality: 'Personality description',
    appearance: 'Physical description',
    role: 'Role in campaign',
    location: 'Where they are',
    keyInfo: ['Info 1', 'Info 2'],
    interactions: ['How players interact']
});
```

### Add a Quest
```javascript
contentData.quests.push({
    id: 'quest-id',
    name: 'Quest Name',
    type: 'Quest type',
    level: 'Difficulty',
    reward: 'Reward description',
    giver: 'Who gives it',
    description: 'Quest description',
    objectives: ['Objective 1', 'Objective 2'],
    notes: 'Additional notes',
    status: 'Available/Completed/etc'
});
```

---

## Access Control

The site currently shows **player-safe content only**:

✅ **Included:**
- All guild public information
- Known NPCs (Eldon, Lyra)
- Public locations
- Available items and quests
- Discovered handouts
- General world lore

❌ **Excluded (DM Only):**
- Sophia's full story
- Heartstone secrets
- Dungeon seal mechanics
- NPC hidden motivations
- Future plot developments
- Big Bad information

---

## Future Enhancements (Optional)

Want to add more features? Here are ideas:

### Easy Additions
- [ ] More NPCs as players meet them
- [ ] Session summaries after each game
- [ ] Character sheets section
- [ ] Reputation tracker (interactive)
- [ ] Dice roller

### Medium Complexity
- [ ] Import full markdown files automatically
- [ ] Login system (different content for different players)
- [ ] Combat tracker
- [ ] Interactive maps with pins

### Advanced Features
- [ ] Real-time updates (DM pushes content)
- [ ] Player notes and bookmarks
- [ ] Chat/messaging system
- [ ] Shared quest log

---

## Technical Details

**Technologies Used:**
- HTML5
- CSS3 (Grid, Flexbox, CSS Variables)
- Vanilla JavaScript (no frameworks)
- LocalStorage (for theme preference)

**Browser Compatibility:**
- Chrome, Firefox, Safari, Edge (all modern versions)
- Mobile browsers (iOS Safari, Chrome Android)

**Performance:**
- Lightweight (~50KB total)
- No external dependencies
- Works offline
- Fast search (in-memory indexing)

---

## Troubleshooting

**Search not working?**
- Check browser console for errors (F12)
- Make sure JavaScript is enabled

**Content not loading?**
- Clear browser cache (Ctrl+Shift+R)
- Check file paths are correct

**Styling looks broken?**
- Make sure `styles.css` is in same folder as `index.html`
- Check browser console for 404 errors

**Want to hide something from players?**
- Edit `app.js` and remove from `contentData` object
- Or add conditional display logic

---

## For Players

**Welcome to the Darcnia Campaign Reference!**

Use this site to:
- 📖 Look up guild information
- 👥 Review NPC details
- 🗺️ Check location descriptions
- ⚔️ See available items and equipment
- 📜 Track active quests
- 📄 Re-read handouts and documents
- 🔍 **Search anything instantly!**

**Pro Tips:**
- Use the search bar to find anything quickly
- Click on cards to see more details
- Toggle dark/light theme with button in header
- Bookmark important sections in your browser

---

## License

This is for your personal D&D campaign. Share with your players!

---

## Questions?

Ask your DM (that's you!) to add more content or features.

Happy adventuring! 🎲
