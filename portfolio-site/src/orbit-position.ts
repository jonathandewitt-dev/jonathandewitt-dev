import { createSignal } from 'thunderous';
import { resolveMotion } from './motion';
import { safeTry } from './result';
import { routes, routeIndex } from './routes';
import { createFrameScheduler } from './frame-scheduler';

const ITEM_SPREAD = 36;
export const MAX_ROTATION = ((routes.length - 1) * ITEM_SPREAD) / 2;
export const angleFor = (index: number): number => index * ITEM_SPREAD - MAX_ROTATION;
export const ORBIT_ROTATION = 'orbit:rotation';
export type OrbitRotationEvent = CustomEvent<{ rotation: number; source: 'interaction' | 'navigation' }>;

export const [orbitRotation, setOrbitRotation] = createSignal(0);

/** Keeps navigation centering alive while the view replaces its nav component. */
export const startOrbitPosition = (): (() => void) => {
	const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
	const initial = -angleFor(Math.max(0, routeIndex(location.pathname)));
	let journey: { from: number; target: number; start: number } | null = null;
	const frames = createFrameScheduler((time) => {
		if (journey === null) return;
		const progress = resolveMotion() === 'reduced' ? 1 : Math.min(1, Math.max(0, (time - journey.start) / 420));
		publish(journey.from + (journey.target - journey.from) * (1 - (1 - progress) ** 3));
		if (progress < 1) frames.request();
		else journey = null;
	});
	setOrbitRotation(initial);
	const stop = () => {
		frames.cancel();
		journey = null;
	};
	const publish = (next: number) => {
		setOrbitRotation(next);
		document.dispatchEvent(new CustomEvent(ORBIT_ROTATION, { detail: { rotation: next, source: 'navigation' } }));
	};
	const onRotation = (event: Event) => {
		const detail = (event as OrbitRotationEvent).detail;
		if (detail.source !== 'interaction' || !Number.isFinite(detail.rotation)) return;
		stop();
		setOrbitRotation(detail.rotation);
	};
	const onNavigate = (event: Event) => {
		const url = (event as Event & { destination?: { url?: string } }).destination?.url;
		if (url === undefined) return;
		const destination = safeTry(() => new URL(url, location.href));
		if (destination.ok === false || destination.value.origin !== location.origin) return;
		const index = routeIndex(destination.value.pathname);
		if (index === -1) return;
		stop();
		const target = -angleFor(index);
		if (resolveMotion() === 'reduced') {
			publish(target);
			return;
		}
		journey = { from: orbitRotation(), target, start: performance.now() };
		frames.request();
	};
	document.addEventListener(ORBIT_ROTATION, onRotation);
	navigation?.addEventListener('navigate', onNavigate);
	return () => {
		stop();
		document.removeEventListener(ORBIT_ROTATION, onRotation);
		navigation?.removeEventListener('navigate', onNavigate);
	};
};
