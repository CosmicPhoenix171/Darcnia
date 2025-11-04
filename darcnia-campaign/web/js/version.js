// ===== SINGLE SOURCE OF TRUTH FOR VERSION =====
// Update ONLY this file when bumping version - all other files read from here
window.APP_VERSION = 'v1.34';
window.BUILD_TIME = document.lastModified; // Automatically uses file modification time
window.GIT_COMMIT = 'main';

console.log('📦 Version.js loaded:', window.APP_VERSION);
