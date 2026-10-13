/**
 * Motion preference, shared by every component that animates.
 *
 * The resolved value is published two ways, so nothing has to depend on this module's
 * behaviour to react to it:
 *
 *  - as `data-motion` on <html>, which global.css turns into the inherited `--motion` and
 *    `--motion-play` custom properties. Those cross shadow boundaries, so component
 *    stylesheets pick the preference up without importing anything at all.
 *  - as a MOTION_CHANGE custom event on `document`, for the few places that need to react in
 *    script rather than in CSS.
 *
 * Nothing here touches the DOM at module scope: this file is reachable from the isomorphic
 * component registry, so it is evaluated on the server during static generation too.
 */

export type MotionPreference = 'full' | 'reduced';

/** Fired on `document` whenever the effective preference changes. */
export const MOTION_CHANGE = 'motion:change';

export type MotionChangeEvent = CustomEvent<{ preference: MotionPreference }>;

const STORAGE_KEY = 'motion';

const isPreference = (value: unknown): value is MotionPreference => value === 'full' || value === 'reduced';

/** The user's explicit choice, or null when they have never chosen and the OS should win. */
export const getStoredMotion = (): MotionPreference | null => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return isPreference(stored) ? stored : null;
	} catch {
		// Storage can throw in private mode or with cookies blocked; treat it as "no choice".
		return null;
	}
};

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The preference actually in effect: an explicit choice if there is one, else the OS hint. */
export const resolveMotion = (): MotionPreference => getStoredMotion() ?? (prefersReducedMotion() ? 'reduced' : 'full');

const announce = (preference: MotionPreference) => {
	document.dispatchEvent(new CustomEvent(MOTION_CHANGE, { detail: { preference } }));
};

export const setMotion = (value: MotionPreference): void => {
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// Preference just won't survive a reload; the in-page toggle still works.
	}
	document.documentElement.dataset['motion'] = value;
	announce(value);
};

/**
 * Watches the OS preference and announces changes while the user has made no explicit choice.
 * No attribute is written in that case — the media query in global.css already covers the CSS
 * side, so this only exists to notify script. Call once from the composition root.
 */
export const startMotion = (): (() => void) => {
	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	const onSystemChange = () => {
		if (getStoredMotion() === null) announce(resolveMotion());
	};
	query.addEventListener('change', onSystemChange);
	return () => query.removeEventListener('change', onSystemChange);
};
