import { css, customElement, html } from 'thunderous';
import { MOTION_CHANGE, resolveMotion } from '../motion';
import { focusRing } from '../styles';
import { safeTry } from '../result';
import { NAV_REQUEST } from '../navigation-request';
import { moveOrbitGesture, finishOrbitGesture, type OrbitGesture } from '../orbit-gesture';
import { routes as destinations, routeIndex } from '../routes';
import { MAX_ROTATION, angleFor, ORBIT_ROTATION, readOrbitRotation, type OrbitRotationEvent } from '../orbit-position';

const HOVER_TRAVEL_FRACTION = 0.4;

export const OrbitNav = customElement(({ adoptStyleSheet, root, connectedCallback, disconnectedCallback }) => {
	adoptStyleSheet(focusRing);
	adoptStyleSheet(stylesheet);
	let cleanup = () => {};

	connectedCallback(() => {
		cleanup();
		if (!(root instanceof ShadowRoot)) return;
		const nav = root.querySelector<HTMLElement>('nav');
		const stage = root.querySelector<HTMLElement>('.stage');
		const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.nav-link'));
		if (nav === null || stage === null) return;
		const initial = Math.max(0, routeIndex(location.pathname));
		let rotation = readOrbitRotation(-angleFor(initial));
		let press: { kind: 'mouse' | 'touch'; identifier: number; gesture: OrbitGesture } | null = null;
		let activating = false;
		let modifiedRelease: HTMLAnchorElement | null = null;
		let hover: { x: number; rotation: number } | null = null;
		let hoverFrame = 0;
		let hoverTarget = rotation;
		let hoverTime = 0;

		const paint = (next: number, publish = true) => {
			rotation = next;
			stage.style.setProperty('--rotation', `${rotation}deg`);
			if (publish)
				document.dispatchEvent(new CustomEvent(ORBIT_ROTATION, { detail: { rotation, source: 'interaction' } }));
		};
		const itemAt = (x: number, y: number): number | null => {
			const element = root.elementFromPoint(x, y);
			const link = element?.closest<HTMLAnchorElement>('.nav-link') ?? null;
			const index = link === null ? -1 : links.indexOf(link);
			return index === -1 ? null : index;
		};
		const stopHover = () => {
			cancelAnimationFrame(hoverFrame);
			hoverFrame = 0;
			hover = null;
		};
		const animateHover = (time: number) => {
			const elapsed = Math.max(0, time - hoverTime);
			hoverTime = time;
			const next = rotation + (hoverTarget - rotation) * (1 - Math.exp(-elapsed / 60));
			if (Math.abs(hoverTarget - next) < 0.02) {
				paint(hoverTarget);
				hoverFrame = 0;
			} else {
				paint(next);
				hoverFrame = requestAnimationFrame(animateHover);
			}
		};
		const hoverMove = (event: MouseEvent) => {
			if (press !== null || event.buttons !== 0 || !nav.hasAttribute('data-enhanced')) return;
			if (hover === null) hover = { x: event.clientX, rotation };
			const bounds = stage.getBoundingClientRect();
			if (bounds.width <= 0) return;
			const delta = event.clientX - hover.x;
			hoverTarget = Math.max(
				-MAX_ROTATION,
				Math.min(MAX_ROTATION, hover.rotation - (delta * 2 * MAX_ROTATION) / (bounds.width * HOVER_TRAVEL_FRACTION)),
			);
			hover = { x: event.clientX, rotation: hoverTarget };
			if (hoverFrame === 0) {
				hoverTime = performance.now();
				hoverFrame = requestAnimationFrame(animateHover);
			}
		};
		const cancel = () => {
			stopHover();
			press = null;
			stage.removeAttribute('data-interacting');
		};
		const updateMode = () => {
			cancel();
			nav.toggleAttribute('data-enhanced', resolveMotion() === 'full');
			paint(rotation, false);
		};
		const onRotation = (event: Event) => {
			const detail = (event as OrbitRotationEvent).detail;
			if (detail.source !== 'navigation') return;
			stopHover();
			paint(detail.rotation, false);
		};
		const begin = (kind: 'mouse' | 'touch', identifier: number, x: number, y: number) => {
			cancel();
			modifiedRelease = null;
			stage.setAttribute('data-interacting', '');
			paint(rotation);
			press = {
				kind,
				identifier,
				gesture: {
					origin: itemAt(x, y),
					startX: x,
					startY: y,
					startRotation: rotation,
					rotation,
					cancelled: false,
					dragging: false,
				},
			};
		};
		const move = (x: number, y: number) => {
			if (press === null) return;
			press = {
				...press,
				gesture: moveOrbitGesture(press.gesture, {
					x,
					y,
					item: itemAt(x, y),
					width: stage.getBoundingClientRect().width,
					limit: MAX_ROTATION,
				}),
			};
			if (nav.hasAttribute('data-enhanced')) paint(press.gesture.rotation);
		};
		const activate = (link: HTMLAnchorElement) => {
			const unhandled = link.dispatchEvent(
				new CustomEvent(NAV_REQUEST, { detail: { href: link.href }, bubbles: true, composed: true, cancelable: true }),
			);
			if (unhandled === false) return;
			activating = true;
			const fallback = safeTry(() => link.click());
			activating = false;
			if (fallback.ok === false) document.dispatchEvent(new CustomEvent('nav:error', { detail: fallback.error }));
		};
		const release = (x: number, y: number, modified: boolean) => {
			if (press === null) return;
			move(x, y);
			const destination = finishOrbitGesture(press.gesture, itemAt(x, y));
			cancel();
			const link = destination === null ? undefined : links[destination];
			if (link === undefined) return;
			if (modified) modifiedRelease = link;
			else activate(link);
		};
		const mouseDown = (event: MouseEvent) => {
			if (event.button !== 0) return;
			begin('mouse', 0, event.clientX, event.clientY);
		};
		const mouseMove = (event: MouseEvent) => {
			if (press?.kind === 'mouse') move(event.clientX, event.clientY);
		};
		const mouseUp = (event: MouseEvent) => {
			if (event.button === 0 && press?.kind === 'mouse')
				release(event.clientX, event.clientY, event.ctrlKey || event.metaKey || event.shiftKey || event.altKey);
		};
		const leaveItem = (event: MouseEvent) => {
			if (press === null || press.kind !== 'mouse' || press.gesture.origin === null) return;
			const origin = links[press.gesture.origin];
			if (event.currentTarget !== origin) return;
			if (event.relatedTarget instanceof Node && origin?.contains(event.relatedTarget) === true) return;
			press = { ...press, gesture: { ...press.gesture, cancelled: true } };
		};
		const touchStart = (event: TouchEvent) => {
			if (event.touches.length !== 1) {
				cancel();
				return;
			}
			const touch = event.changedTouches[0];
			if (touch === undefined) return;
			if (event.cancelable) event.preventDefault();
			begin('touch', touch.identifier, touch.clientX, touch.clientY);
		};
		const touchMove = (event: TouchEvent) => {
			if (press?.kind !== 'touch') return;
			const identifier = press.identifier;
			const touch = Array.from(event.changedTouches).find((entry) => entry.identifier === identifier);
			if (touch === undefined) return;
			if (event.cancelable) event.preventDefault();
			move(touch.clientX, touch.clientY);
		};
		const touchEnd = (event: TouchEvent) => {
			if (press?.kind !== 'touch') return;
			const identifier = press.identifier;
			const touch = Array.from(event.changedTouches).find((entry) => entry.identifier === identifier);
			if (touch === undefined) return;
			if (event.cancelable) event.preventDefault();
			release(touch.clientX, touch.clientY, false);
		};
		const click = (event: MouseEvent) => {
			const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('.nav-link') : null;
			if (target === null || activating) return;
			if (event.detail === 0) {
				if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
				event.preventDefault();
				activate(target);
				return;
			}
			if (modifiedRelease === target) {
				modifiedRelease = null;
				return;
			}
			event.preventDefault();
		};
		const focusLink = (event: FocusEvent) => {
			if (press !== null) return;
			stopHover();
			const index = links.indexOf(event.target as HTMLAnchorElement);
			if (index !== -1) paint(-angleFor(index));
		};
		const keys = (event: KeyboardEvent) => {
			const index = links.indexOf(event.target as HTMLAnchorElement);
			if (index === -1) return;
			let next: number;
			if (event.key === 'ArrowRight') next = (index + 1) % links.length;
			else if (event.key === 'ArrowLeft') next = (index + links.length - 1) % links.length;
			else if (event.key === 'Home') next = 0;
			else if (event.key === 'End') next = links.length - 1;
			else return;
			event.preventDefault();
			links[next]?.focus({ preventScroll: true });
		};
		const preventDrag = (event: DragEvent) => event.preventDefault();
		links.forEach((link, index) => {
			if (index === routeIndex(location.pathname)) link.setAttribute('aria-current', 'page');
			link.addEventListener('mouseout', leaveItem);
			link.addEventListener('mouseleave', leaveItem);
		});
		updateMode();
		stage.addEventListener('mousedown', mouseDown);
		stage.addEventListener('mousemove', hoverMove);
		stage.addEventListener('mouseleave', stopHover);
		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
		stage.addEventListener('touchstart', touchStart, { passive: false });
		stage.addEventListener('touchmove', touchMove, { passive: false });
		stage.addEventListener('touchend', touchEnd, { passive: false });
		stage.addEventListener('touchcancel', cancel);
		stage.addEventListener('click', click);
		stage.addEventListener('dragstart', preventDrag);
		stage.addEventListener('contextmenu', cancel);
		stage.addEventListener('focusin', focusLink);
		stage.addEventListener('keydown', keys);
		window.addEventListener('blur', cancel);
		document.addEventListener(MOTION_CHANGE, updateMode);
		document.addEventListener(ORBIT_ROTATION, onRotation);
		cleanup = () => {
			cancel();
			links.forEach((link) => {
				link.removeEventListener('mouseout', leaveItem);
				link.removeEventListener('mouseleave', leaveItem);
			});
			stage.removeEventListener('mousedown', mouseDown);
			stage.removeEventListener('mousemove', hoverMove);
			stage.removeEventListener('mouseleave', stopHover);
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
			stage.removeEventListener('touchstart', touchStart);
			stage.removeEventListener('touchmove', touchMove);
			stage.removeEventListener('touchend', touchEnd);
			stage.removeEventListener('touchcancel', cancel);
			stage.removeEventListener('click', click);
			stage.removeEventListener('dragstart', preventDrag);
			stage.removeEventListener('contextmenu', cancel);
			stage.removeEventListener('focusin', focusLink);
			stage.removeEventListener('keydown', keys);
			window.removeEventListener('blur', cancel);
			document.removeEventListener(MOTION_CHANGE, updateMode);
			document.removeEventListener(ORBIT_ROTATION, onRotation);
		};
	});
	disconnectedCallback(() => cleanup());

	return html`
		<nav aria-label="Main navigation">
			<p class="hint">
				<span>Hover or drag to explore</span>
				<span>Click or tap to visit</span>
			</p>
			<div class="stage">
				<div class="shadow" aria-hidden="true"></div>
				<div class="tilt">
					<div class="ring">
						<div class="ribbon" aria-hidden="true">
							${Array.from({ length: 64 }, (_, index) => html`<i style="--angle: ${index * 5.625}deg"></i>`)}
						</div>
						${destinations.map(
							(item, index) => html`
								<a class="nav-link" href="${item.href}" style="--angle: ${angleFor(index)}deg">
									<span class="number" aria-hidden="true">0${index + 1}</span>
									${item.label}<span class="arrow" aria-hidden="true">↗</span>
								</a>
							`,
						)}
					</div>
				</div>
			</div>
		</nav>
	`;
});

const stylesheet = css`
	/* Must stay at the top level. CSS nesting does not permit @keyframes inside a style rule, so
	   moving this into nav[data-enhanced] drops it silently while animation-name still resolves. */
	@keyframes orbit-pitch {
		from {
			transform: rotateX(var(--pitch));
		}
		to {
			transform: rotateX(16deg);
		}
	}
	:host {
		display: block;
		min-width: 0;
	}
	nav {
		/* Arc length between destinations is radius * ITEM_SPREAD, so too small a radius makes
		   each link wider than its own slot and neighbours overlap. */
		--radius: clamp(15rem, 38vw, 28rem);
		--ribbon-height: 3.75rem;
		--rotation: 0deg;
		--pitch: 4deg;
		color: var(--color-page-1-c);
	}
	.ring {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 999px;
		background: var(--color-surface-1);
	}
	.nav-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		min-height: 44px;
		padding: 0.5rem 1rem;
		box-sizing: border-box;
		color: inherit;
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.005em;
		text-decoration: none;
		white-space: nowrap;
		border-radius: 0.75rem;
	}
	.nav-link:hover,
	.nav-link[aria-current='page'] {
		background: var(--color-accent-1);
	}
	.number,
	.arrow,
	.ribbon,
	.shadow,
	.hint {
		display: none;
	}

	nav[data-enhanced] {
		position: relative;
		text-align: center;
		.hint {
			position: absolute;
			cursor: default;
			display: inline-grid;
			top: 0;
			translate: -50% -60%;
			padding: 0.25rem 0.5rem;
			margin: 0;
			text-align: center;
			font-family: var(--font-body);
			font-size: 0.75rem;
			line-height: 1.1;
			color: var(--color-neutral-1);
			opacity: 0.5;
			transition: all calc(var(--motion) * 150ms) ease;
			z-index: 1;
		}
		.hint:hover {
			opacity: 1;
			font-size: 1rem;
		}
		.stage {
			touch-action: none;
			user-select: none;
			cursor: grab;
			position: relative;
			width: 100%;
			max-width: 72rem;
			height: 12.5rem;
			margin-inline: auto;
			perspective: 1500px;
			perspective-origin: 50% 50%;
		}
		.tilt,
		.ring,
		.ribbon {
			position: absolute;
			transform-style: preserve-3d;
		}
		.tilt {
			left: 50%;
			top: 50%;
			transform: rotateX(var(--pitch));
		}
		@supports (animation-timeline: scroll()) {
			.tilt {
				animation: orbit-pitch linear both;
				animation-timeline: scroll(root block);
				/* Short enough to finish within the scroll a page this size actually has. */
				animation-range: 0 420px;
				animation-play-state: var(--motion-play);
			}
		}
		.ring {
			display: block;
			width: 0;
			height: 0;
			padding: 0;
			border: 0;
			border-radius: 0;
			background: none;
			transform: rotateY(var(--rotation));
		}
		.stage[data-interacting] {
			cursor: grabbing;
		}

		.ribbon {
			display: block;
		}
		.ribbon i {
			position: absolute;
			width: calc(var(--radius) * 0.099 + 1px);
			height: var(--ribbon-height);
			box-sizing: border-box;
			border-block: 1px solid color-mix(in srgb, var(--color-brand-1) 60%, transparent);
			background: linear-gradient(
				180deg,
				color-mix(in srgb, var(--color-page-1) 82%, var(--color-brand-1)),
				color-mix(in srgb, var(--color-page-1) 95%, var(--color-brand-1))
			);
			transform: translate(-50%, -50%) rotateY(var(--angle)) translateZ(var(--radius));
			backface-visibility: visible;
		}
		.nav-link {
			position: absolute;
			width: 10.5rem;
			height: 3.25rem;
			padding: 0.65rem;
			transform: translate(-50%, -50%) rotateY(var(--angle)) translateZ(calc(var(--radius) + 3px));
			backface-visibility: hidden;
			background: transparent;
			border: 1px solid transparent;
			transition:
				background calc(var(--motion) * 150ms) ease,
				border-color calc(var(--motion) * 150ms) ease,
				color calc(var(--motion) * 150ms) ease;
		}
		.nav-link[aria-current='page'],
		.nav-link:hover {
			background: var(--color-brand-1);
			color: var(--color-page-1);
			border-color: var(--color-brand-1);
			box-shadow: 0 0 32px color-mix(in srgb, var(--color-brand-1) 30%, transparent);
		}
		/* The ring's own lit surface needs a brighter indicator than the page default. */
		.nav-link {
			--focus-ring-color: var(--color-page-1-c);
			--focus-ring-offset: 5px;
		}
		.number {
			display: inline;
			font-size: 0.65rem;
			opacity: 0.7;
			letter-spacing: 0.06em;
		}
		.arrow {
			display: inline;
		}
		.shadow {
			display: block;
			position: absolute;
			width: calc(var(--radius) * 2);
			height: 3rem;
			left: 50%;
			top: 78%;
			transform: translateX(-50%);
			border-radius: 50%;
			background: var(--color-accent-1);
			filter: blur(24px);
			pointer-events: none;
		}
	}
`;
