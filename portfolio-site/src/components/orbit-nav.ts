import { css, customElement, html } from 'thunderous';
import { resolveMotion, subscribeMotion } from '../motion';

const destinations = [
	{ label: 'Home', href: '/' },
	{ label: 'About Me', href: '/about' },
	{ label: 'My Work', href: '/work' },
	{ label: 'Contact Me', href: '/contact' },
];
const angleFor = (index: number) => -75 + index * 50;

export const OrbitNav = customElement(({ adoptStyleSheet, root, connectedCallback, disconnectedCallback }) => {
	adoptStyleSheet(stylesheet);
	let cleanup = () => {};

	connectedCallback(() => {
		cleanup();
		const nav = root.querySelector<HTMLElement>('nav');
		const stage = root.querySelector<HTMLElement>('.stage');
		const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('.nav-link'));
		if (!nav || !stage) return;
		// The 3D ring needs a real pointer, and it is motion by definition — so the in-page
		// toggle has to gate it just as the OS preference does.
		const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const mode = {
			get matches() {
				return pointer.matches && resolveMotion() === 'full';
			},
		};
		const path = location.pathname.replace(/\/$/, '') || '/';
		const current = destinations.findIndex((item) => item.href === path);
		const initial = Math.max(0, current);
		let selected = -1;
		let frame = 0;
		let pointerX = 0;

		// The resting highlight only; while the pointer is over the stage, CSS :hover on the
		// real links owns the lit state so it can never disagree with what is under the cursor.
		const select = (index: number) => {
			if (selected === index) return;
			selected = index;
			links.forEach((link, i) => link.toggleAttribute('data-selected', i === index));
		};
		const rotateTo = (index: number) => {
			select(index);
			stage.style.setProperty('--rotation', `${-angleFor(index)}deg`);
		};
		links.forEach((link, index) => {
			if (index === current) link.setAttribute('aria-current', 'page');
		});
		const updateMode = () => {
			nav.toggleAttribute('data-enhanced', mode.matches);
			rotateTo(initial);
		};
		const track = (event: PointerEvent) => {
			if (!mode.matches || event.pointerType !== 'mouse') return;
			pointerX = event.clientX;
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				const bounds = stage.getBoundingClientRect();
				const progress = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
				select(-1);
				stage.style.setProperty('--rotation', `${75 - progress * 150}deg`);
			});
		};
		const focusLink = (event: FocusEvent) => {
			const index = links.indexOf(event.target as HTMLAnchorElement);
			if (index !== -1) rotateTo(index);
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
		const leave = () => {
			cancelAnimationFrame(frame);
			frame = 0;
			const focused = links.findIndex((link) => link.matches(':focus'));
			rotateTo(focused === -1 ? initial : focused);
		};
		updateMode();
		stage.addEventListener('pointermove', track);
		stage.addEventListener('pointerleave', leave);
		stage.addEventListener('focusin', focusLink);
		stage.addEventListener('keydown', keys);
		pointer.addEventListener('change', updateMode);
		const unsubscribeMotion = subscribeMotion(updateMode);
		cleanup = () => {
			cancelAnimationFrame(frame);
			stage.removeEventListener('pointermove', track);
			stage.removeEventListener('pointerleave', leave);
			stage.removeEventListener('focusin', focusLink);
			stage.removeEventListener('keydown', keys);
			pointer.removeEventListener('change', updateMode);
			unsubscribeMotion();
		};
	});
	disconnectedCallback(() => cleanup());

	return html`
		<nav aria-label="Main navigation">
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
	:host {
		display: block;
		min-width: 0;
	}
	:host([prominent]) {
		translate: 0 -3rem;
	}
	nav {
		--radius: clamp(11rem, 25vw, 19rem);
		--ribbon-height: 4.5rem;
		--rotation: 0deg;
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
	.nav-link:focus-visible {
		outline: 2px solid var(--color-brand-1);
		outline-offset: 4px;
	}
	.number,
	.arrow,
	.ribbon,
	.shadow {
		display: none;
	}

	nav[data-enhanced] {
		.stage {
			position: relative;
			width: 100%;
			max-width: 58rem;
			height: 20rem;
			margin-inline: auto;
			perspective: 1000px;
			perspective-origin: 50% 45%;
		}
		.tilt,
		.ring,
		.ribbon {
			position: absolute;
			transform-style: preserve-3d;
		}
		.tilt {
			left: 50%;
			top: 60%;
			transform: rotateX(20deg);
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
			transition: transform calc(var(--motion) * 180ms) ease-out;
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
			width: 12rem;
			height: 3.5rem;
			padding: 0.75rem;
			transform: translate(-50%, -50%) rotateY(var(--angle)) translateZ(calc(var(--radius) + 3px));
			backface-visibility: hidden;
			background: transparent;
			border: 1px solid transparent;
			transition:
				background calc(var(--motion) * 150ms) ease,
				border-color calc(var(--motion) * 150ms) ease,
				color calc(var(--motion) * 150ms) ease;
		}
		.nav-link[data-selected],
		.nav-link:hover {
			background: var(--color-brand-1);
			color: var(--color-page-1);
			border-color: var(--color-brand-1);
			box-shadow: 0 0 32px color-mix(in srgb, var(--color-brand-1) 30%, transparent);
		}
		.nav-link:focus-visible {
			outline: 2px solid var(--color-page-1-c);
			outline-offset: 5px;
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
			top: 74%;
			transform: translateX(-50%);
			border-radius: 50%;
			background: var(--color-accent-1);
			filter: blur(24px);
			pointer-events: none;
		}
	}
`;
