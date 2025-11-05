# Firebase Realtime Database Rules for Darcnia VTT

This folder contains two ready-to-paste rules files for your Realtime Database.

- `rules.quick.json` — permissive (testing). Anyone can read/write session state and events.
- `rules.recommended.json` — safer (requires Firebase Auth, uses `sessions/$sessionId/roleByUid/$uid === "dm"` for DM writes).

## How to apply

1) Open Firebase Console → Realtime Database → Rules
2) Copy the entire JSON from the file you want and paste it into the Rules editor
3) Publish

Tip: Start with `rules.quick.json` to verify the VTT works over the internet. When ready, switch to `rules.recommended.json` and set your DM role for a session:

- Create a session id in your VTT (e.g., `party-1`)
- In the Database Data tab, set `sessions/party-1/roleByUid/<your-uid>` to `"dm"`
- Reload the VTT and connect as DM to that session

## What the rules cover

- `sessions/$sessionId/state`: The authoritative snapshot (map, tokens, fog, initiative, meta)
- `sessions/$sessionId/events`: Small events (chat, moves, markers) appended by clients
- `sessions/$sessionId/presence`: Non-sensitive presence entries per client
- `sessions/$sessionId/roleByUid`: Mapping of which users are DM in a session (recommended rules)

