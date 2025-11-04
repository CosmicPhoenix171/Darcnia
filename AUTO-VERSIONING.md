# Auto-Versioning System

## How It Works

The Darcnia Campaign web app now uses **automatic cache-busting** based on file modification times. You just need to update the version number in one place!

### System Components

1. **`web/js/version.js`** - Simple version file containing:
   - `APP_VERSION` - Version string (e.g., "v1.26") - **Update this manually when needed**
   - `BUILD_TIME` - Automatically uses `document.lastModified` for cache-busting
   - `GIT_COMMIT` - Set to 'main' (or update manually if needed)

2. **No GitHub Actions needed!** - The previous GitHub Action approach had permission issues, so we use a simpler client-side solution

3. **UI Integration**:
   - Version badge in bottom-left corner displays the version
   - Console logs show version and build time
   - Hover over version badge to see build details
   - Automatic cache-busting via file modification timestamps

### How to Use

**Update version when needed, commit, and push!**

1. **For significant updates**, edit `web/js/version.js`:
   ```javascript
   window.APP_VERSION = 'v1.27'; // ← Change this
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

3. **That's it!** The version display updates automatically.

### Version Format

- **Format**: `v1.26`
- **Update manually** in `web/js/version.js` when you want to bump the version
- **Cache-busting** happens automatically via file modification timestamps

### Benefits

✅ **Simple updates** - Just edit one file (`version.js`) when you want to bump version
✅ **Automatic cache-busting** - Uses file modification timestamps
✅ **No GitHub Actions complexity** - No permission issues or workflow failures
✅ **Build timestamps** - Automatically tracked via document.lastModified
✅ **Hover tooltips** - Version badge shows version info on hover

### Updating the Version

To bump the version number:

1. Edit `web/js/version.js`:
   ```javascript
   window.APP_VERSION = 'v1.27'; // ← Increment this
   ```

2. Commit and push - done!

### Console Output

When the app loads, you'll see:
```
� Version.js loaded: v1.26
�💵 Pricing.js loaded - v1.26
✅ Firebase Realtime Database initialized
🎲 Darcnia Campaign Reference loaded successfully! (v1.26)
📦 Build: main at [file modification time]
📚 Search index built with 177 items
⚔️ Playing as: Nyra Vex
🔑 Access level: player
```

### GitHub Pages Deployment

The version updates happen in two stages:

1. **Commit your changes** → GitHub Action generates version.js
2. **Wait 1-2 minutes** → GitHub Pages deploys with new version

Hard refresh (Ctrl+Shift+R) to see the latest version immediately.

---

## Troubleshooting

**Q: Version not updating after push?**
- Hard refresh your browser (Ctrl+Shift+R)
- Clear cache and reload
- Check that GitHub Pages has deployed (wait 1-2 minutes after push)

**Q: Want to change the version number?**
- Just edit `web/js/version.js` and change `APP_VERSION`
- Commit and push

---

## Migration Notes

### Old System (v1.21-v1.25)
- Had to manually update 5 files for each version bump
- Easy to forget to update all locations
- Cache-busting required manual `?v=` query parameters

### New System (v1.26+)
- **Update only ONE file** (`web/js/version.js`)
- Automatic cache-busting via file modification timestamps
- No GitHub Actions complexity or permission issues
- Simple, reliable, works everywhere!
