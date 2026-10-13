/**
 * Motion preference, shared by every component that animates.
 *
 * The resolved value is published as `data-motion` on <html>, which global.css turns into
 * the inherited `--motion` / `--motion-play` custom properties. Custom properties cross
 * shadow boundaries, so component stylesheets pick the preference up without any of them
 * needing to import this module.
 *
 * Nothing here touches the DOM at module scope: this file is reachable from the isomorphic
 * component registry, so it is evaluated on the server during static generation too.
 */

export type MotionPreference = 'full' | 'reduced';

const STORAGE_KEY = 'motion';

const listeners = new Set<(value: MotionPreference) => void>();

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

export const setMotion = (value: MotionPreference): void => {
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// Preference just won't survive a reload; the in-page toggle still works.
	}
	document.documentElement.dataset['motion'] = value;
	for (const listener of listeners) listener(value);
};

/**
 * Subscribe to the effective preference. Fires on explicit changes and, while the user has
 * made no explicit choice, on OS-level changes too.
 */
export const subscribeMotion = (listener: (value: MotionPreference) => void): (() => void) => {
	listeners.add(listener);
	const query = window.matchMedia('(prefers-reduced-motion: reduce)');
	const onSystemChange = () => {
		if (getStoredMotion() === null) listener(resolveMotion());
	};
	query.addEventListener('change', onSystemChange);
	return () => {
		listeners.delete(listener);
		query.removeEventListener('change', onSystemChange);
	};
};
