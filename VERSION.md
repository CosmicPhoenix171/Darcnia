# Darcnia Campaign - Version History

## Current Version: 1.30 (Centralized)

### � Centralized Version System!

**Single Source of Truth:** All version numbers now come from ONE file: `web/js/version.js`

- **Update ONLY**: `web/js/version.js` → Change `window.APP_VERSION = 'v1.30'`
- **Everything else automatically updates**: pricing.js, app.js, index.html
- **No more**: Updating multiple files with hardcoded versions

### How to Update Version (One File Only!)

Edit **`web/js/version.js`** and change the version number:

```javascript
window.APP_VERSION = 'v1.31'; // ← Change only this line!
```

Then commit and push. All other files will automatically use the new version! 🎉

### Legacy Manual Updates (v1.21-v1.25 only)

<details>
<summary>Old manual process (no longer needed)</summary>

When making changes, increment the version number and update it in these locations:

1. **web/index.html** (3 places)
2. **web/js/pricing.js** (version log)
3. **This file (VERSION.md)**

