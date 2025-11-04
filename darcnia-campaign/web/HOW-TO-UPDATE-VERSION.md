# How to Update the Version Number

## ✅ Simple: Edit ONE File Only!

### Step 1: Edit `web/js/version.js`

Open `web/js/version.js` and change this line:

```javascript
window.APP_VERSION = 'v1.30'; // ← Change this to v1.31, v1.32, etc.
```

### Step 2: Commit and Push

```bash
git add .
git commit -m "Update to v1.31"
git push
```

### Step 3: Done! 🎉

All these places will automatically use the new version:
- ✅ Version badge in bottom-left corner
- ✅ Console logs in browser
- ✅ `pricing.js` load message
- ✅ `app.js` success message

---

## ❌ DO NOT Edit These Files:

- ~~`web/app.js`~~ - Reads from `window.APP_VERSION`
- ~~`web/js/pricing.js`~~ - Reads from `window.APP_VERSION`
- ~~`web/index.html`~~ - Updated by JavaScript

These files automatically get the version from `version.js`!

---

## 📋 Version Naming Convention

Use semantic versioning:
- **Major changes**: v2.0, v3.0 (big features, breaking changes)
- **Minor features**: v1.30, v1.31 (new features, improvements)
- **Bug fixes**: v1.30.1, v1.30.2 (hotfixes)

---

## 🔍 How It Works

1. Browser loads `version.js` first (in `<head>`)
2. Sets `window.APP_VERSION` globally
3. All other scripts read from `window.APP_VERSION`
4. Version badge updates via `updateVersionDisplay()` function

**Single Source of Truth = No More Version Confusion!** 🎯
