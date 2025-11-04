# Auto-Versioning System

## How It Works

The Darcnia Campaign web app now uses **automatic version numbering** based on Git commits. You never have to manually update version numbers again!

### System Components

1. **`web/js/version.js`** - Auto-generated file containing:
   - `APP_VERSION` - Version string with commit hash (e.g., "v1.25-a3f2b1c")
   - `BUILD_TIME` - ISO timestamp of when the build was created
   - `GIT_COMMIT` - Full commit hash
   - `GIT_COMMIT_SHORT` - Short commit hash (7 characters)

2. **`.github/workflows/update-version.yml`** - GitHub Action that:
   - Runs automatically on every push to `main` branch
   - Generates a new `version.js` with the latest commit info
   - Commits and pushes the updated file

3. **UI Integration**:
   - Version badge in bottom-left corner automatically updates
   - Console logs show version, commit, and build time
   - Hover over version badge to see build details

### How to Use

**Just commit and push - that's it!** 🎉

```bash
git add .
git commit -m "Your changes"
git push
```

The GitHub Action will automatically:
1. Generate a new version.js with your commit hash
2. Update the version display
3. Deploy to GitHub Pages

### Version Format

- **Format**: `v1.25-a3f2b1c`
- **v1.25** = Base version (update manually in version.js if major release)
- **a3f2b1c** = Short git commit hash (auto-generated)

### Benefits

✅ **No manual updates needed** - Version updates automatically on every commit
✅ **Traceability** - Know exactly which commit is deployed
✅ **Cache-busting** - Each commit gets a unique version string
✅ **Build timestamps** - See when the current version was built
✅ **Hover tooltips** - Version badge shows full build info on hover

### Manual Override

If you need to manually set a version (for testing locally):

Edit `web/js/version.js`:
```javascript
window.APP_VERSION = 'v1.26-dev';
window.BUILD_TIME = '2025-11-04T12:00:00Z';
window.GIT_COMMIT = 'local-dev';
window.GIT_COMMIT_SHORT = 'dev';
```

### Console Output

When the app loads, you'll see:
```
💵 Pricing.js loaded - v1.25-a3f2b1c
✅ Firebase Realtime Database initialized
🎲 Darcnia Campaign Reference loaded successfully! (v1.25-a3f2b1c)
📦 Build: a3f2b1c at 11/4/2025, 3:45:00 PM
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
- Check the [Actions tab](https://github.com/CosmicPhoenix171/Darcnia/actions) to see if the workflow ran
- Hard refresh your browser (Ctrl+Shift+R)
- Clear cache and reload

**Q: Want to skip version update?**
- Add `[skip ci]` to your commit message
- Example: `git commit -m "Update docs [skip ci]"`

**Q: Need to trigger version update manually?**
- Go to [Actions > Update Version on Deploy](https://github.com/CosmicPhoenix171/Darcnia/actions/workflows/update-version.yml)
- Click "Run workflow" button

---

## Migration Notes

### Old System (v1.21-v1.25)
- Had to manually update 5 files for each version bump
- Easy to forget to update all locations
- Cache-busting required manual version increments

### New System (v1.26+)
- Fully automatic version generation
- Single source of truth (Git commit hash)
- No manual updates required!
