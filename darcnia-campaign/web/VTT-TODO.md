# Darcnia VTT — TODO & Roadmap

Goal: Ship a polished, production-ready virtual tabletop integrated with the site’s existing login/auth, real-time sync, and a complete, reliable feature set.

Legend: [ ] Todo · [~] In progress · [x] Done

## 0) Baseline (current)
- [x] Canvas layers (grid/tokens/fog), pan/zoom, snap-to-grid, square/hex toggle
- [x] Token drag + arrow-key movement, DM/player role model (local)
- [x] Procedural dungeon/wilderness generation with traps/treasure/enemies, optional seed
- [x] Fog of War: reveal around token, DM reveal/hide tools
- [x] Save/Load JSON; simple chat; local real-time sync via BroadcastChannel
- [x] Website tabs navigation added: “🗺️ VTT Map” link in site tabs

## 1) Authentication & Session Integration (use the site’s login)
> Reuse the existing site login and session (Firebase compat already loaded in `web/index.html`). Ensure the VTT page requires sign-in and recognizes current user.

- [ ] Reuse Firebase app initialization (single source of truth config)
- [ ] On `map.html`, load Firebase SDK (compat) and read current user (or redirect to login flow)
- [ ] Store per-user profile: uid, displayName, avatar URL
- [ ] Role assignment:
  - [ ] DM can set who is DM (via a session control panel)
  - [ ] Persist `roleByUid` in session state; enforce on client (and server rules)
- [ ] Token ownership ties to `ownerUid`; players can only move owned tokens
- [ ] Display current user/role in header; allow DM handoff
- [ ] Acceptance:
  - [ ] If user not signed in, VTT shows login prompt
  - [ ] Player-only moves own token; DM can move all
  - [ ] Refresh preserves role/ownership

## 2) Networking & Persistence via Firebase
> Replace BroadcastChannel with Firebase Realtime Database for multi-user over the internet. Keep a local adapter for offline demo.

- [ ] Implement `FirebaseAdapter` (modular API or compat, matching project’s usage)
- [ ] Data model
  - [ ] `sessions/{sessionId}/state` (map, tokens, fog, initiative, meta)
  - [ ] `sessions/{sessionId}/events` (append-only small events: chat, moves)
  - [ ] `sessions/{sessionId}/presence/{uid}`
- [ ] Sync strategy
  - [ ] DM broadcasts periodic full state; clients apply diffs
  - [ ] Token moves: optimistic local update + DB write, de-dupe by clientId
  - [ ] Fog changes and spawns are DM-only writes
- [ ] Security rules (Realtime DB)
  - [ ] Read: members of session only (simple for now)
  - [ ] Write: DM-only for map/fog/spawn; players can write own token position; chat all members
  - [ ] Validate schemas and size limits
- [ ] Offline handling and reconnect (queue writes; reconcile on resume)
- [ ] Acceptance:
  - [ ] Two browsers in different networks stay in sync (map, tokens, fog, chat)
  - [ ] Security rules block unauthorized actions

## 3) Permissions & Session Control (DM authority)
- [ ] DM pause toggle: blocks player moves and tool actions
- [ ] Invite/join via shareable session code/URL
- [ ] Kick/ban (basic): DM can remove `uid` from session and prevent joins
- [ ] Action rate-limit (client-side debounce + server rule constraints)
- [ ] Audit log (who did what, when) for DM-only view

## 4) Grid & Engine Polish
- [ ] Correct hex math using axial/offset coords and hex-rounding for pick/snap
- [ ] Measurement tool (5 ft per square; hex distances rules options)
- [ ] Performance
  - [ ] Tile visibility culling by camera frustum
  - [ ] Offscreen canvas or layers for static tiles
  - [ ] DPR-aware crisp lines, hover effects
- [ ] Smooth zoom inertia; keyboard pan
- [ ] Configurable tile size; dynamic scale preserves 1:1 feel

## 5) Fog of War & Line of Sight
- [ ] LOS raycasting from token center to tile centers; stop at walls/opaque tiles
- [ ] Soft-edge reveal (alpha gradient) and animated fade-in/out
- [ ] Per-player FoW (DM sees all; players see their discovered areas)
- [ ] DM paint brush with size/shape presets; undo/redo for FoW

## 6) Map Generation & Content
- [ ] Deterministic seed pipeline (seed -> rooms -> corridors -> features -> spawns)
- [ ] More room shapes, doors, secret doors, water, chasms, stairs
- [ ] Difficulty-aware trap/enemy tables using CR and party level
- [ ] Ensure start and at least one exit/goal
- [ ] Place labels/room numbers and auto flavor text (optional AI)

## 7) Tokens, Combat & Tracker
- [ ] Token sheet panel: edit HP/AC/conditions; add image; size (2x2, etc.)
- [ ] Conditions with icons and effect reminders
- [ ] Initiative tracker linked to tokens; active turn highlight and next/prev controls
- [ ] Movement path preview with grid counting; difficult terrain costs
- [ ] Death saves and stabilize helper (configurable)

## 8) UI/UX & Accessibility
- [ ] Keyboard shortcuts cheat sheet (question-mark overlay)
- [ ] Touch gestures: pinch-zoom, two-finger pan; large buttons on mobile
- [ ] Theme polish: icons, feedback, toasts, error messages
- [ ] Resize behavior and panel collapse on small screens
- [ ] Accessibility: focus outlines, ARIA labels, color contrast

## 9) Save/Load & Campaign Storage
- [ ] Cloud saves bound to session and DM
- [ ] Manual export/import (JSON) kept for backup
- [ ] Versioned schema with migrations
- [ ] Share link that loads session state

## 10) AI-Assisted (Optional)
- [ ] Encounter auto-balance (party average level -> target XP/CR bands)
- [ ] Room/trap flavor text generator (configurable style)
- [ ] Enemy suggestions from SRD dataset (non-copyrighted)

## 11) Quality, Tests, and Release
- [ ] Unit tests: generators, LOS, hex math, dice
- [ ] Integration tests: token move sync, FoW, permissions
- [ ] Browser matrix (Chromium, Firefox, Safari)
- [ ] Performance budgets (FPS >= 50 on mid-range laptop; memory steady)
- [ ] Error monitoring (console scrub, optional Sentry)
- [ ] CI build + deploy to static hosting; semantic versioning; changelog

## Implementation Notes
- Mirror current `BroadcastChannel` events in Firebase adapter; prevent echo via clientId stamping
- Keep state minimal; prefer events for chat/movement; periodic DM snapshots for recovery
- Validate all server writes with security rules and simple schema checks to avoid bloat

## Acceptance (Definition of “Polished”)
- Stable across browsers; no uncaught errors during a 1-hour session
- All core features work with Firebase-backed multi-user sessions using site login
- Clear UI, responsive on desktop and tablet, pass basic a11y checks
- Save/Load round-trips without data loss; sessions survive reconnects
