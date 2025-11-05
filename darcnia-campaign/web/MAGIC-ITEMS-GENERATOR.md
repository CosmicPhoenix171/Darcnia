# 🔮 Magic Items Generator System - D&D 5e

Comprehensive system for generating balanced, flavorful magic items for the Darcnia campaign.

---

## 📊 Item Rarity & Level Gating

| Rarity | Min Level | Base Price | Market Availability |
|--------|-----------|------------|---------------------|
| **Common** | 1 | 50-100 gp | Always available |
| **Uncommon** | 3 | 200-500 gp | Weekly rotation |
| **Rare** | 5 | 1,000-5,000 gp | Monthly rotation |
| **Very Rare** | 9 | 10,000-50,000 gp | Quarterly rotation |
| **Legendary** | 13 | 100,000+ gp | Quest rewards only |
| **Artifact** | 17 | Priceless | Plot-driven |

---

## 🎲 Generation Tables

### 1. Item Type (d20)

| Roll | Type | Examples |
|------|------|----------|
| 1-4 | **Weapon** | Sword, bow, dagger, staff |
| 5-8 | **Armor** | Breastplate, shield, cloak, boots |
| 9-11 | **Wondrous Item** | Ring, amulet, wand, orb |
| 12-14 | **Consumable** | Potion, scroll, ammunition |
| 15-16 | **Tool** | Thieves' tools, musical instrument |
| 17-18 | **Focus** | Arcane focus, holy symbol, druidic focus |
| 19 | **Container** | Bag of holding, portable hole |
| 20 | **Unique** | DM's choice (legendary potential) |

### 2. Enhancement Type (d12)

| Roll | Enhancement | Effect |
|------|-------------|--------|
| 1-2 | **Bonus to Attacks/AC** | +1 to +3 based on rarity |
| 3-4 | **Damage Boost** | +1d4/1d6/1d8 extra damage |
| 5-6 | **Ability Score** | +1/+2 to ability (max 20) |
| 7 | **Saving Throw** | Advantage on specific save type |
| 8 | **Resistance** | Resistance to damage type |
| 9 | **Spell Effect** | Cast spell 1-3 times/day |
| 10 | **Utility** | Special movement, senses, or abilities |
| 11 | **Social** | Advantage on Charisma checks |
| 12 | **Reroll** | Reroll attack/save/check once/day |

### 3. Damage Type (if applicable, d12)

| Roll | Type | Flavor |
|------|------|--------|
| 1 | Fire | Flames, heat, burning |
| 2 | Cold | Ice, frost, freezing |
| 3 | Lightning | Electricity, storms, sparks |
| 4 | Thunder | Sonic, booming, shockwaves |
| 5 | Acid | Corrosion, poison, melting |
| 6 | Poison | Venom, toxins, disease |
| 7 | Necrotic | Death, decay, life drain |
| 8 | Radiant | Holy, light, divine |
| 9 | Force | Pure magical energy |
| 10 | Psychic | Mental, mind-affecting |
| 11 | Slashing | Blades, cutting |
| 12 | Bludgeoning | Impact, crushing |

### 4. Activation Method (d10)

| Roll | Method | Usage |
|------|--------|-------|
| 1-2 | **Passive** | Always active when worn/wielded |
| 3-4 | **Bonus Action** | Quick activation |
| 5-6 | **Action** | Standard activation |
| 7-8 | **Reaction** | Triggered response |
| 9 | **Attunement** | Requires attunement slot |
| 10 | **Charges** | Limited uses (1d6+4 charges, recharge) |

### 5. Restrictions/Costs (d10)

| Roll | Restriction | Drawback |
|------|-------------|----------|
| 1-5 | **None** | No restrictions |
| 6 | **Alignment** | Must match item's alignment |
| 7 | **Class** | Specific class requirement |
| 8 | **Attunement** | Requires attunement |
| 9 | **Curse** | Minor curse (removable) |
| 10 | **Cost** | HP/resource cost per use |

---

## 🛠️ Item Templates by Rarity

### Common Items (50-100 gp)

**Formula:** Simple utility + flavor

**Examples:**
- **Everburning Torch:** Never needs fuel, casts bright light 20 ft, dim 40 ft
- **Cleansing Stone:** Purifies 1 gallon of water per day
- **Whispering Quill:** Writes up to 50 words on command
- **Compass of Direction:** Always points north, advantage on Survival (navigation)
- **Pouch of Seasoning:** Food always tastes excellent

**Template:**
```
[NAME] (Common, [GP])
- Simple, convenient utility
- No combat benefit
- Flavor-focused
- No attunement
```

### Uncommon Items (200-500 gp, Level 3+)

**Formula:** +1 bonus OR spell 1/day OR utility ability

**Examples:**
- **Weapon +1:** +1 to attack and damage rolls
- **Cloak of Billowing:** Bonus action to dramatically billow cloak
- **Boots of Striding and Springing:** Speed +10 ft, jump distance x3
- **Ring of Feather Falling:** Activate when falling (no action)
- **Wand of Magic Detection:** Cast *Detect Magic* 3/day

**Template:**
```
[NAME] (Uncommon, Requires Attunement, [GP])
- +1 bonus to attacks/AC/saves, OR
- Cast 1st-2nd level spell 1-3/day, OR
- Advantage on specific check type, OR
- Minor mobility/utility ability
```

### Rare Items (1,000-5,000 gp, Level 5+)

**Formula:** +2 bonus OR spell 2-3/day OR significant ability

**Examples:**
- **Weapon +2:** +2 to attack and damage rolls
- **Armor of Resistance:** Resistance to one damage type
- **Ring of Spell Storing:** Store 5 levels of spells
- **Boots of Speed:** Double speed as bonus action (10 min/day)
- **Amulet of Health:** Constitution score becomes 19

**Template:**
```
[NAME] (Rare, Requires Attunement, [GP])
- +2 bonus to attacks/AC/saves, OR
- Cast 3rd-4th level spell 1-2/day, OR
- Resistance to damage type, OR
- Significant combat/utility ability
- May have 1d6+4 charges
```

### Very Rare Items (10,000-50,000 gp, Level 9+)

**Formula:** +3 bonus OR powerful spell OR major ability

**Examples:**
- **Weapon +3:** +3 to attack and damage rolls
- **Belt of Giant Strength:** Strength becomes 21-27
- **Ring of Three Wishes:** 3 *Wish* spells (consumable)
- **Cloak of Invisibility:** Become invisible for 1 hour (1/day)
- **Manual of Bodily Health:** Permanently increase Constitution by 2

**Template:**
```
[NAME] (Very Rare, Requires Attunement, [GP])
- +3 bonus to attacks/AC/saves, OR
- Cast 5th-6th level spell 1-2/day, OR
- Multiple resistances/immunities, OR
- Game-changing combat ability
- May have limited charges
- May have permanent stat boost
```

### Legendary Items (100,000+ gp, Level 13+)

**Formula:** Multiple powerful effects + sentience

**Examples:**
- **Holy Avenger:** +3 weapon, spell resistance aura, extra radiant damage
- **Ring of Elemental Command:** Control element, cast multiple spells
- **Armor of Invulnerability:** Immunity to nonmagical damage (10 min)
- **Vorpal Sword:** +3 weapon, decapitate on 20
- **Ioun Stone (Greater):** Multiple stat bonuses + special abilities

**Template:**
```
[NAME] (Legendary, Requires Attunement, [GP])
- +3 bonus PLUS additional effect(s)
- Cast 7th-9th level spell, OR
- Multiple powerful abilities
- May be sentient (personality, goals)
- May have legendary actions/resistances
- Story-defining item
```

---

## 🎨 Flavor Generation

### Item Appearance (d12)

| Roll | Description |
|------|-------------|
| 1 | Ancient and weathered, covered in runes |
| 2 | Pristine and polished, almost new |
| 3 | Glowing with magical energy |
| 4 | Wrapped in vines or organic material |
| 5 | Adorned with gemstones and filigree |
| 6 | Battle-scarred and well-used |
| 7 | Crystalline or translucent |
| 8 | Made from unusual material (bone, crystal, star metal) |
| 9 | Changes appearance based on wielder |
| 10 | Ethereal or partially transparent |
| 11 | Decorated with religious symbols |
| 12 | Roll twice and combine |

### Item Origin (d10)

| Roll | Origin |
|------|--------|
| 1 | **Guild Crystalia:** Created by guild wizards |
| 2 | **Ancient Artifact:** Predates the Floating Continent |
| 3 | **Divine Gift:** Blessed by a deity |
| 4 | **Draconic:** Forged with dragon magic |
| 5 | **Fey-Touched:** Made in the Feywild |
| 6 | **Underworld:** Found in the dungeons below |
| 7 | **Elemental:** Infused with elemental power |
| 8 | **Necromantic:** Created from death magic (cursed?) |
| 9 | **Celestial:** Fallen from the heavens |
| 10 | **Custom:** Commissioned by a past hero |

### Item History (d8)

| Roll | History |
|------|---------|
| 1 | Belonged to a famous hero or villain |
| 2 | Lost for centuries, recently recovered |
| 3 | Part of a matched set (others exist) |
| 4 | Created during a great war |
| 5 | Gift from a powerful patron |
| 6 | Stolen from a dragon's hoard |
| 7 | Forged in a moment of great sacrifice |
| 8 | Grows in power with its wielder |

---

## ⚔️ Weapon-Specific Tables

### Weapon Properties (d10)

| Roll | Property | Effect |
|------|----------|--------|
| 1 | **Returning** | Returns to hand after thrown |
| 2 | **Finesse** | Use DEX for attacks if weapon lacks it |
| 3 | **Reach** | +5 ft reach |
| 4 | **Versatile** | Can use two-handed for extra damage |
| 5 | **Light** | Can dual-wield more easily |
| 6 | **Heavy** | +1d4 damage but disadvantage if Small |
| 7 | **Ammunition** | Creates magical ammunition |
| 8 | **Two-Handed** | +2 damage when using both hands |
| 9 | **Thrown** | Can be thrown 20/60 ft |
| 10 | **Special** | Unique property (DM choice) |

### Weapon Special Abilities (d20)

| Roll | Ability | Effect |
|------|---------|--------|
| 1-2 | **Flaming** | +1d6 fire damage |
| 3-4 | **Frost** | +1d6 cold damage |
| 5-6 | **Shock** | +1d6 lightning damage |
| 7-8 | **Venom** | +1d6 poison damage |
| 9-10 | **Holy** | +1d8 radiant vs undead/fiends |
| 11-12 | **Keen** | Crit on 19-20 |
| 13-14 | **Vorpal** | Extra damage on crit, chance to decapitate |
| 15-16 | **Life-Stealing** | Heal for half damage dealt (1/day) |
| 17-18 | **Defending** | Transfer +1/+2/+3 bonus to AC |
| 19-20 | **Spell-Storing** | Store one spell to release on hit |

---

## 🛡️ Armor-Specific Tables

### Armor Properties (d10)

| Roll | Property | Effect |
|------|----------|--------|
| 1 | **Lightened** | No Stealth disadvantage, reduce weight by half |
| 2 | **Glamoured** | Can change appearance as bonus action |
| 3 | **Resistance** | Resistance to one damage type |
| 4 | **Improved** | +1 to AC |
| 5 | **Absorbing** | Store damage and release it |
| 6 | **Reflective** | Reflect portion of damage back |
| 7 | **Animated** | Don/doff as action |
| 8 | **Buoyant** | Swim speed equal to walk speed |
| 9 | **Climate Control** | Comfortable in any temperature |
| 10 | **Adaptive** | AC bonus improves with level |

### Shield Special Abilities (d12)

| Roll | Ability | Effect |
|------|---------|--------|
| 1-2 | **Spellguard** | Advantage on saves vs spells |
| 3-4 | **Missile Deflection** | Reaction to add AC vs ranged |
| 5-6 | **Animated** | Shield floats and defends without hands |
| 7-8 | **Reflection** | Reflect spell back at caster (1/day) |
| 9-10 | **Bulwark** | Grant half-cover to adjacent ally |
| 11 | **Spell Absorption** | Absorb spell, gain charges |
| 12 | **Resistance** | Resistance to one damage type |

---

## 🔮 Wondrous Item Tables

### Ring Effects (d20)

| Roll | Effect |
|------|--------|
| 1-2 | **Protection** | +1 to AC and saves |
| 3-4 | **Resistance** | Resistance to damage type |
| 5-6 | **Spell Storing** | Store spells (5 levels) |
| 7-8 | **Free Action** | Ignore difficult terrain, can't be grappled |
| 9-10 | **Feather Falling** | Always active |
| 11-12 | **Water Walking** | Walk on water |
| 13-14 | **Invisibility** | Turn invisible (action, 1 hour) |
| 15-16 | **Telepathy** | 60 ft telepathy |
| 17-18 | **Sustenance** | Don't need food or water |
| 19-20 | **Regeneration** | Regain HP every minute |

### Cloak/Robe Effects (d12)

| Roll | Effect |
|------|--------|
| 1-2 | **Displacement** | Attacks against you have disadvantage |
| 3-4 | **Resistance** | Resistance to damage type |
| 5-6 | **Elvenkind** | +2 Stealth, creatures disadvantage on Perception |
| 7-8 | **Protection** | +1 to AC and saves |
| 9-10 | **Flying** | Fly speed equal to walk speed |
| 11 | **Invisibility** | Turn invisible (1 hour/day) |
| 12 | **Arachnida** | Climb walls, spider climb |

### Boots/Footwear (d12)

| Roll | Effect |
|------|--------|
| 1-2 | **Striding and Springing** | +10 ft speed, triple jump |
| 3-4 | **Elvenkind** | Silent movement, advantage on Stealth |
| 5-6 | **Levitation** | Cast *Levitate* on self at will |
| 7-8 | **Speed** | Double speed for 10 minutes (1/day) |
| 9-10 | **Water Walking** | Walk on water |
| 11 | **Winged** | Fly speed 30 ft (4 hours/day) |
| 12 | **Teleportation** | *Misty Step* 3/day |

### Gloves/Gauntlets (d10)

| Roll | Effect |
|------|--------|
| 1-2 | **Ogre Power** | Strength becomes 19 |
| 3-4 | **Missile Snaring** | Catch projectiles (reaction) |
| 5-6 | **Swimming and Climbing** | +5 ft swim/climb, advantage |
| 7-8 | **Thievery** | +5 to Sleight of Hand and thieves' tools |
| 9 | **Soul Catching** | Steal enemy's soul on kill |
| 10 | **Storing** | Store one object to summon later |

---

## 🧪 Consumable Items

### Potions (by rarity)

| Rarity | Effect | Price |
|--------|--------|-------|
| **Common** | Healing (2d4+2), Climbing, Swimming | 50 gp |
| **Uncommon** | Greater Healing (4d4+4), Resistance, Speed | 150 gp |
| **Rare** | Superior Healing (8d4+8), Heroism, Invulnerability (1 min) | 500 gp |
| **Very Rare** | Supreme Healing (10d4+20), Giant Strength, Flying | 5,000 gp |
| **Legendary** | Full Heal, Invulnerability (10 min), Immortality (24 hr) | 50,000 gp |

### Scrolls (by spell level)

| Spell Level | Rarity | Price | DC |
|-------------|--------|-------|-----|
| Cantrip | Common | 25 gp | 10 |
| 1st | Common | 50 gp | 11 |
| 2nd | Uncommon | 150 gp | 12 |
| 3rd | Uncommon | 300 gp | 13 |
| 4th | Rare | 1,000 gp | 14 |
| 5th | Rare | 2,500 gp | 15 |
| 6th | Very Rare | 10,000 gp | 16 |
| 7th | Very Rare | 25,000 gp | 17 |
| 8th | Legendary | 50,000 gp | 18 |
| 9th | Legendary | 100,000 gp | 19 |

### Ammunition (magical)

| Type | Effect | Price (per 20) |
|------|--------|----------------|
| **+1 Ammunition** | +1 to attack and damage | 250 gp |
| **+2 Ammunition** | +2 to attack and damage | 1,000 gp |
| **+3 Ammunition** | +3 to attack and damage | 5,000 gp |
| **Elemental** | +1d6 elemental damage | 300 gp |
| **Slaying** | Extra 6d10 vs specific creature type | 500 gp |
| **Walloping** | Push target 10 ft on hit | 200 gp |

---

## 🎲 Quick Generation System

### Random Common Item (3d6 method)

1. **Roll 3d6** for total power level
2. **Consult table:**

| Total | Item Type | Effect |
|-------|-----------|--------|
| 3-5 | Pure flavor | Cosmetic or trivial utility |
| 6-8 | Minor utility | Advantage on specific skill check |
| 9-11 | Useful utility | Cast cantrip at will OR advantage on check type |
| 12-14 | Combat assist | +1 to specific action type |
| 15-17 | Strong utility | Cast 1st level spell 1/day |
| 18 | Exceptional | Multiple minor effects |

### Example Generation

**Roll:** 3d6 = 12 (Combat assist)

1. **Type:** d20 = 7 (Wondrous Item)
2. **Slot:** Ring
3. **Effect:** +1 to initiative
4. **Appearance:** Glowing silver band
5. **Origin:** Guild Crystalia creation

**Result:**  
**Ring of Readiness** (Common, 75 gp)  
*A silver ring that pulses with faint light. Grants +1 to initiative rolls.*

---

## 🔨 Crafting System

### Crafting Time & Cost

| Rarity | Time | Materials | Skill DC |
|--------|------|-----------|----------|
| **Common** | 1 week | 25 gp | DC 10 |
| **Uncommon** | 2 weeks | 100 gp | DC 12 |
| **Rare** | 10 weeks | 500 gp | DC 14 |
| **Very Rare** | 25 weeks | 5,000 gp | DC 16 |
| **Legendary** | 50 weeks | 50,000 gp | DC 18 |

### Required Skills

- **Weapons/Armor:** Smith's tools + Arcana
- **Wondrous Items:** Jeweler's tools/Tinker's tools + Arcana
- **Potions:** Alchemist's supplies + Arcana
- **Scrolls:** Calligrapher's supplies + Arcana
- **Wands/Staves:** Woodcarver's tools + Arcana

### Crafting Formula

```
Daily Progress = (Tool Proficiency + Arcana Proficiency) × GP
Success = Roll Tool/Arcana check vs DC
Failure = No progress that day
Critical Failure = Lose materials
```

---

## 🌟 Sentient Item Rules

### Creating Sentient Items

**Requirements:**
- Minimum Rare rarity
- Item must have backstory
- Define personality, alignment, goals

**Sentient Item Stats:**

| Attribute | Range |
|-----------|-------|
| **Intelligence** | 10-20 |
| **Wisdom** | 10-20 |
| **Charisma** | 10-20 |
| **Alignment** | Any |
| **Senses** | Hearing, vision (60 ft) |
| **Languages** | 1d4+1 languages |

### Communication Methods

- **Empathy:** Emotions only
- **Telepathy:** Mental communication with wielder
- **Speech:** Can speak audibly
- **Vision:** Share senses with wielder

### Sentient Item Conflicts

**If wielder disagrees with item's goals:**
- Contested Charisma checks
- Winner controls item for 24 hours
- Repeated failures = item may refuse to function

---

## 📖 Example Generated Items

### Uncommon: Dagger of Returning Strikes
**Type:** Weapon (dagger)  
**Rarity:** Uncommon  
**Attunement:** No  
**Price:** 350 gp  

*This silver dagger has runes of teleportation etched along the blade.*

- +1 to attack and damage rolls
- When thrown, returns to your hand at the end of your turn
- Range: 20/60 ft

---

### Rare: Cloak of the Shadow Stalker
**Type:** Wondrous Item (cloak)  
**Rarity:** Rare  
**Attunement:** Yes  
**Price:** 2,500 gp  

*A black cloak that seems to absorb light around it. Created by Guild Crystalia's Silent Vigil faction.*

- Advantage on Stealth checks in dim light or darkness
- Bonus action: Become invisible for 1 minute (2/day)
- Invisibility ends if you attack or cast a spell

---

### Very Rare: Amulet of the Phoenix Heart
**Type:** Wondrous Item (amulet)  
**Rarity:** Very Rare  
**Attunement:** Yes  
**Price:** 15,000 gp  

*A golden amulet shaped like a phoenix, warm to the touch. Legend says it contains the essence of a phoenix that died protecting its master.*

- Resistance to fire damage
- When you drop to 0 HP, you instead drop to 1 HP and regain 5d8+20 hit points (1/week)
- When this effect triggers, burst of flame deals 2d6 fire damage to all creatures within 10 ft

---

## 🎯 Integration with Darcnia Campaign

### Arcane Exchange Shop

**Stock Rotation:**
- **Common:** Always available (20+ items)
- **Uncommon:** Weekly rotation (10-15 items)
- **Rare:** Monthly rotation (5-8 items)
- **Very Rare:** Quarterly rotation (2-4 items)
- **Legendary:** Quest rewards or special commissions only

### Guild Toolwright

Can craft custom items:
- Commission fee: 20% of item cost
- Crafting time as per table above
- Player provides materials or pays full cost

### Quest Rewards

**Dungeon Level Progression:**
- **Level 0-2:** Common items, gold
- **Level 3-4:** Uncommon items
- **Level 5-8:** Rare items
- **Level 9-12:** Very Rare items
- **Level 13+:** Legendary items, artifacts

---

## 📝 DM Tips

### Balancing Magic Items

1. **Action Economy:** Items using bonus actions are more valuable
2. **Attunement:** Limits how many powerful items can be used
3. **Charges:** Prevents unlimited powerful effects
4. **Situational:** Highly specialized items are less powerful overall
5. **Trade-offs:** Cursed items should offer significant power

### Rewarding Players

- **1 item per level** is reasonable pace
- **Mix utility and combat** items
- **Consider character builds** when designing items
- **Make it memorable** with unique flavor

### Avoiding Power Creep

- Don't give +3 weapons before level 11
- Limit resistance items (powerful in 5e)
- Save legendary items for level 13+
- Consider consumables for one-time power spikes

---

## 🔗 Related Systems

- See `PRICING-SYSTEM-README.md` for dynamic pricing
- See `bluebrick-market.md` for available stock
- See `magic-items.md` in /items for campaign-specific items

---

*Generated for Darcnia Campaign - D&D 5e*  
*Version 1.0 - Compatible with market v1.50*
