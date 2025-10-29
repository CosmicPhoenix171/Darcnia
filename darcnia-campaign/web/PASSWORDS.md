# Campaign Access Passwords

⚠️ **CONFIDENTIAL - FOR DM USE ONLY** ⚠️

## Default Passwords

### DM Access
- **Username:** `DM` or `Dungeon Master`
- **Password:** `dmpass2025`
- **Access Level:** Full access to all content including secrets

### Player Characters

#### Nyra Vex
- **Username:** `Nyra Vex`
- **Password:** `rogue123`
- **Access Level:** Player
- **Known Content:**
  - Guilds: Guild Crystalia, The Crimson Vanguard, Merchants' Concord, City Watch
  - Locations: Guild Crystalia Hall, Heart Plaza, Hearthstone Inn
  - Active Quests: Shadows in the Basement
  - Completed Quests: Missing Cat
  - Handouts: Tavern Rumors, Guild Job Board, Thug Note

## Adding New Characters

To add a new character to the system:

1. Open `web/app.js`
2. Find the `characterDatabase` object (around line 17)
3. Add a new entry following this format:

```javascript
'character name': {
    name: 'Character Name',
    password: simpleHash('your_password_here'),
    race: 'Race',
    class: 'Class',
    guild: 'Guild Name',
    relationships: ['NPC1', 'NPC2'],
    knownLocations: ['Location1', 'Location2'],
    knownGuilds: ['Guild1', 'Guild2'],
    completedQuests: [],
    activeQuests: ['Quest Name'],
    knownSecrets: [],
    accessLevel: 'player',
    discoveredHandouts: ['Handout1']
}
```

## Changing Passwords

To change a password:

1. Open `web/app.js`
2. Find the character in `characterDatabase`
3. Update the password line to: `password: simpleHash('new_password_here')`
4. Commit and push changes
5. Inform the player of their new password

## Security Notes

- Passwords are hashed using a simple hash function (good for basic protection)
- For production use, consider implementing proper authentication with a backend
- Never share this file with players
- Players who forget passwords need to contact the DM
- Sessions are stored in localStorage and persist until logout

## Guest Access

If someone tries to login with a name not in the database, they will be denied access and shown an error message.

---

**Last Updated:** October 29, 2025
