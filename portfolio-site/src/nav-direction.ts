import { createSignal } from 'thunderous';
import { routeIndex } from './routes';
import { safeTry } from './result';

/** Navigation flags for native transitions, plus shared signals for scenery position and timing. */

export type NavDirection = 'forward' | 'back';

/** Fired on `document` when a navigation's direction is determined. */
export const NAV_DIRECTION = 'nav:direction';

export type NavDirectionEvent = CustomEvent<{ direction: NavDirection }>;

export const [voyage, setVoyage] = createSignal(0);
export const [navigationDuration, setNavigationDuration] = createSignal(1080);

type NavigateEventLike = Event & { destination?: { url?: string } };

/** Publishes a route coordinate for persistent scenery to follow. */
const publishVoyage = (index: number) => {
	setVoyage(Math.max(0, index));
};

/**
 * Starts flagging navigation direction. Call once from the composition root.
 *
 * @example
 * ```ts
 * const stop = startNavDirection();
 * ```
 */
export const startNavDirection = (): (() => void) => {
	// Seed the starting coordinate so a direct load of any page begins in the right place.
	publishVoyage(routeIndex(location.pathname));

	const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
	// No Navigation API means no client-side routing either, so there is nothing to flag.
	if (navigation === undefined) return () => {};

	const onNavigate = (event: Event) => {
		const destinationUrl = (event as NavigateEventLike).destination?.url;
		const from = routeIndex(location.pathname);
		let to = -1;
		if (destinationUrl !== undefined) {
			const pathname = safeTry(() => new URL(destinationUrl, location.href).pathname);
			if (pathname.ok === true) to = routeIndex(pathname.value);
		}
		// Anything off the main nav keeps the default forward sweep rather than guessing.
		const direction: NavDirection = from !== -1 && to !== -1 && to < from ? 'back' : 'forward';
		document.documentElement.dataset['navDirection'] = direction;
		document.dispatchEvent(new CustomEvent(NAV_DIRECTION, { detail: { direction } }));
	};

	// Snapshot readiness starts the voyage; navigation completion also covers abort/fallback cases.
	const onArrival = () => {
		const endTimes = document
			.getAnimations()
			.filter(
				(animation) =>
					animation instanceof CSSAnimation &&
					(animation.animationName === 'orbit-in' || animation.animationName === 'orbit-out'),
			)
			.map((animation) => animation.effect?.getComputedTiming().endTime ?? 0)
			.filter((endTime): endTime is number => typeof endTime === 'number' && Number.isFinite(endTime));
		if (endTimes.length > 0) {
			setNavigationDuration(Math.max(...endTimes));
		}
		publishVoyage(routeIndex(location.pathname));
	};
	document.addEventListener('view:transition-ready', onArrival);
	navigation.addEventListener('navigate', onNavigate);
	navigation.addEventListener('navigatesuccess', onArrival);
	return () => {
		document.removeEventListener('view:transition-ready', onArrival);
		navigation.removeEventListener('navigate', onNavigate);
		navigation.removeEventListener('navigatesuccess', onArrival);
	};
};
