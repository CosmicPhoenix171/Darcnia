// ===== SINGLE SOURCE OF TRUTH FOR VERSION =====
// Update ONLY this file when bumping version - all other files import from here

export const APP_VERSION = 'v1.51';
export const BUILD_TIME = document.lastModified;
export const GIT_COMMIT = 'main';

if (typeof window !== 'undefined') {
	window.APP_VERSION = APP_VERSION;
	window.BUILD_TIME = BUILD_TIME;
	window.GIT_COMMIT = GIT_COMMIT;
}

console.log('📦 Version initialized:', APP_VERSION);
