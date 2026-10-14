import { asyncSafeTry, safeTry } from './result';

export const NAV_REQUEST = 'nav:request';
export type NavigationRequest = CustomEvent<{ href: string }>;

type NavigationController = EventTarget & {
	transition: { finished: Promise<unknown> } | null;
	navigate: (href: string) => { finished: Promise<unknown> };
};

/** Serializes requested destinations so CSR never receives overlapping view updates. */
export const startNavigationRequests = (): (() => void) => {
	const navigation = (window as unknown as { navigation?: NavigationController }).navigation;
	if (navigation === undefined) return () => {};
	let queue = Promise.resolve();
	const lifecycle = { active: true };
	const onRequest = (event: Event) => {
		const request = event as NavigationRequest;
		if (typeof request.detail?.href !== 'string') return;
		event.preventDefault();
		const href = request.detail.href;
		queue = queue.then(async () => {
			if (!lifecycle.active) return;
			const current = navigation.transition;
			if (current !== null) await asyncSafeTry(() => current.finished);
			if (!lifecycle.active) return;
			const arrival = await asyncSafeTry(() => navigation.navigate(href).finished);
			if (arrival.ok === false) {
				const fallback = safeTry(() => location.assign(href));
				if (fallback.ok === false) {
					document.dispatchEvent(new CustomEvent('nav:error', { detail: fallback.error }));
				}
			}
		});
	};
	document.addEventListener(NAV_REQUEST, onRequest);
	return () => {
		lifecycle.active = false;
		document.removeEventListener(NAV_REQUEST, onRequest);
	};
};
