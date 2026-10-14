import { resolveMotion } from './motion';
import { safeTry } from './result';
import { routes, routeIndex } from './routes';

const ITEM_SPREAD = 36;
export const MAX_ROTATION = ((routes.length - 1) * ITEM_SPREAD) / 2;
export const angleFor = (index: number): number => index * ITEM_SPREAD - MAX_ROTATION;
export const ORBIT_ROTATION = 'orbit:rotation';
export type OrbitRotationEvent = CustomEvent<{ rotation: number; source: 'interaction' | 'navigation' }>;

/** Reads the angle retained across CSR replacements. */
export const readOrbitRotation = (fallback: number): number => {
	const value = document.documentElement.style.getPropertyValue('--orbit-rotation');
	const rotation = Number(value);
	return value.trim() !== '' && Number.isFinite(rotation) ? rotation : fallback;
};

/** Keeps navigation centering alive while the view replaces its nav component. */
export const startOrbitPosition = (): (() => void) => {
	const navigation = (window as unknown as { navigation?: EventTarget }).navigation;
	let rotation = -angleFor(Math.max(0, routeIndex(location.pathname)));
	let frame = 0;
	document.documentElement.style.setProperty('--orbit-rotation', String(rotation));
	const stop = () => {
		cancelAnimationFrame(frame);
		frame = 0;
	};
	const publish = (next: number) => {
		rotation = next;
		document.documentElement.style.setProperty('--orbit-rotation', String(rotation));
		document.dispatchEvent(new CustomEvent(ORBIT_ROTATION, { detail: { rotation, source: 'navigation' } }));
	};
	const onRotation = (event: Event) => {
		const detail = (event as OrbitRotationEvent).detail;
		if (detail.source !== 'interaction' || !Number.isFinite(detail.rotation)) return;
		stop();
		rotation = detail.rotation;
		document.documentElement.style.setProperty('--orbit-rotation', String(rotation));
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
		const from = rotation;
		const start = performance.now();
		const animate = (time: number) => {
			const progress = resolveMotion() === 'reduced' ? 1 : Math.min(1, Math.max(0, (time - start) / 420));
			publish(from + (target - from) * (1 - (1 - progress) ** 3));
			frame = progress < 1 ? requestAnimationFrame(animate) : 0;
		};
		frame = requestAnimationFrame(animate);
	};
	document.addEventListener(ORBIT_ROTATION, onRotation);
	navigation?.addEventListener('navigate', onNavigate);
	return () => {
		stop();
		document.removeEventListener(ORBIT_ROTATION, onRotation);
		navigation?.removeEventListener('navigate', onNavigate);
	};
};
