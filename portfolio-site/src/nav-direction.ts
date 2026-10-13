import { routeIndex } from './routes';

/**
 * Which way a navigation travels through `routes`, published to the document for the page
 * transitions to read.
 *
 * See "Page transitions" in README.md. Nothing here runs at module scope, because this file is
 * reachable from the isomorphic component registry and is evaluated on the server too.
 */

export type NavDirection = 'forward' | 'back';

/** Fired on `document` when a navigation's direction is determined. */
export const NAV_DIRECTION = 'nav:direction';

export type NavDirectionEvent = CustomEvent<{ direction: NavDirection }>;

type NavigateEventLike = Event & { destination?: { url?: string } };

/**
 * Starts flagging navigation direction. Call once from the composition root.
 *
 * @example
 * ```ts
 * const stop = startNavDirection();
 * ```
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
