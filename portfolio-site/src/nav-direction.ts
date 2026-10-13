import { routeIndex } from './routes';

/**
 * Publishes which way a navigation is travelling.
 *
 * Like motion.ts, it publishes to the DOM rather than to callers: `data-nav-direction` on
 * <html> becomes the `--nav-dir` multiplier the transition keyframes read, and a
 * NAV_DIRECTION custom event carries the same value to anything that needs it in script. No
 * component has to import this module to be affected by it.
 *
 * This is the one part of the page transition CSS cannot work out alone — the direction comes
 * from comparing two routes, and no selector can see where a navigation is headed. The motion
 * itself stays entirely in CSS.
 *
 * Nothing runs at module scope; this file is reachable from the isomorphic registry.
 */

export type NavDirection = 'forward' | 'back';

/** Fired on `document` when a navigation's direction is determined. */
export const NAV_DIRECTION = 'nav:direction';

export type NavDirectionEvent = CustomEvent<{ direction: NavDirection }>;

type NavigateEventLike = Event & { destination?: { url?: string } };

/**
 * Starts flagging navigation direction. Call once from the composition root.
 *
 * The flag is set during the Navigation API's `navigate` event, which fires well before
 * thunderous-csr's interception handler reaches startViewTransition, so the value is always in
 * place before the first frame of the transition is composited.
 */
export const startNavDirection = (): (() => void) => {
	const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
	// No Navigation API means no client-side routing either, so there is nothing to flag.
	if (!navigation) return () => {};

	const onNavigate = (event: Event) => {
		const destination = (event as NavigateEventLike).destination;
		const from = routeIndex(location.pathname);
		let to = -1;
		if (destination?.url !== undefined) {
			try {
				to = routeIndex(new URL(destination.url).pathname);
			} catch {
				to = -1;
			}
		}
		// Anything off the main nav keeps the default forward sweep rather than guessing.
		const direction: NavDirection = from !== -1 && to !== -1 && to < from ? 'back' : 'forward';
		document.documentElement.dataset['navDirection'] = direction;
		document.dispatchEvent(new CustomEvent(NAV_DIRECTION, { detail: { direction } }));
	};

	navigation.addEventListener('navigate', onNavigate);
	return () => navigation.removeEventListener('navigate', onNavigate);
};
