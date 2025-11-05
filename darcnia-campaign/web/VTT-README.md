# Darcnia VTT (Virtual Tabletop)

A lightweight, client-side virtual tabletop for D&D 5e built with HTML5 Canvas. It supports grid-based maps (square/hex), tokens, fog of war, simple procedural generation, and a local real-time mode via BroadcastChannel (open multiple browser tabs).

## Features

- Grid map engine: pan/zoom, square/hex toggle, snapping, smooth canvas rendering
- Tokens: DM/player control, drag or arrow keys, name/HP/AC/init/image
- Procedural maps: dungeon or wilderness with optional seed; auto traps/treasures/enemies
- Fog of War: auto-reveal around player, DM reveal/hide tools with smooth overlay
- Networking (local): BroadcastChannel for instant sync across tabs (stub for Firebase)
- UI: initiative tracker, simple chat, DM toolbar (spawn/erase/reveal/hide/randomize)
- Save/Load: export/import JSON

## Run

Open `web/map.html` in a browser. For local real-time between players, open the same file in multiple tabs/windows. Use the same Session ID and choose DM vs Player.

## Firebase (optional)

To use Firebase Realtime Database instead of BroadcastChannel:

1. Create Firebase project and enable Realtime Database.
2. Add a web app and copy your config.
3. Implement the `FirebaseAdapter` in `web/js/vtt/network.js` using the Firebase SDK v9+ modular APIs.
4. Swap `new LocalAdapter(session)` with `new FirebaseAdapter(config)`.

## Notes and Next Steps

- Line-of-sight and walls blocking vision: add raycasting on fog reveal.
- Initiative automation and combat turns: add turn tracker with active token highlighting.
- Inventory and character sheets: integrate with existing app components.
- Encounter auto-balance and SRD suggestions: wire to an AI service or local tables.
