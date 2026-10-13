import { customElement, html, css, derived } from 'thunderous';
import { theme } from '../theme';
import { resolveMotion, setMotion, subscribeMotion, type MotionPreference } from '../motion';

export const Page = customElement(({ adoptStyleSheet, root, attrSignals, connectedCallback, disconnectedCallback }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(stylesheet);
	const [prominent] = attrSignals['prominent'] ?? [() => null];

	let cleanup = () => {};
	connectedCallback(() => {
		cleanup();
		// Each feature registers its own teardown, so one missing element cannot strand another.
		const teardowns: (() => void)[] = [];
		cleanup = () => {
			for (const teardown of teardowns.splice(0)) teardown();
		};

		const motionToggle = root.querySelector<HTMLButtonElement>('.motion-toggle');
		if (motionToggle) {
			const renderMotion = (value: MotionPreference) => {
				motionToggle.setAttribute('aria-pressed', String(value === 'reduced'));
			};
			// Reflect whatever is already in effect before listening for changes.
			renderMotion(resolveMotion());
			const unsubscribeMotion = subscribeMotion(renderMotion);
			const onMotionClick = () => {
				const next: MotionPreference = resolveMotion() === 'reduced' ? 'full' : 'reduced';
				setMotion(next);
				renderMotion(next);
			};
			motionToggle.addEventListener('click', onMotionClick);
			teardowns.push(() => {
				motionToggle.removeEventListener('click', onMotionClick);
				unsubscribeMotion();
			});
		}

		const menu = root.querySelector<HTMLDetailsElement>('.mobile-menu');
		const toggle = menu?.querySelector('summary');
		if (!menu || !toggle) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || !menu.open) return;
			menu.open = false;
			toggle.focus();
		};
		const closeOnNavigation = (event: MouseEvent) => {
			if (event.target instanceof Element && event.target.closest('a')) menu.open = false;
		};
		const desktop = window.matchMedia('(min-width: 40.001rem)');
		const closeOnResize = () => {
			if (desktop.matches) menu.open = false;
		};
		menu.addEventListener('keydown', closeOnEscape);
		menu.addEventListener('click', closeOnNavigation);
		desktop.addEventListener('change', closeOnResize);
		teardowns.push(() => {
			menu.removeEventListener('keydown', closeOnEscape);
			menu.removeEventListener('click', closeOnNavigation);
			desktop.removeEventListener('change', closeOnResize);
		});
	});
	disconnectedCallback(() => cleanup());

	const links = () => html`
		<a href="/">Home</a>
		<a href="/about">About Me</a>
		<a href="/work">My Work</a>
		<a href="/contact">Contact Me</a>
	`;

	return html`
		<div class="page">
			<button type="button" class="motion-toggle" aria-pressed="false">
				<span class="switch" aria-hidden="true"><span class="knob"></span></span>
				<span>Reduce motion</span>
			</button>
			<div class="cosmos" aria-hidden="true">
				<div class="band"></div>
				<div class="nebula n1"></div>
				<div class="nebula n2"></div>
				<div class="nebula n3"></div>
				<div class="stars s1"></div>
				<div class="stars s2"></div>
				<div class="stars s3"></div>
				<div class="vignette"></div>
			</div>
			<header>
				<slot name="header"></slot>
				<x-orbit-nav class="desktop-nav" prominent="${derived(() => (prominent() === null ? '' : null))}"></x-orbit-nav>
				<details class="mobile-menu">
					<summary><span aria-hidden="true">☰</span> Menu</summary>
					<nav class="header-nav" aria-label="Main navigation">${links()}</nav>
				</details>
			</header>
			<main>
				<slot></slot>
			</main>
			<footer>
				<nav class="footer-nav" aria-label="Footer navigation">
					<a href="/">Home</a> <a href="/about">About Me</a> <a href="/work">My Work</a>
					<a href="/contact">Contact Me</a>
				</nav>
				<slot name="footer"></slot>
				<small
					>&copy; ${new Date().getFullYear()} Jonathan DeWitt &mdash; Powered by
					<a href="https://thunderous.dev">Thunderous</a></small
				>
			</footer>
		</div>
	`;
});

const stylesheet = css`
	:host {
		display: block;
		height: 100%;
		width: 100%;
	}
	.page {
		display: grid;
		grid-template-rows: auto 1fr auto;
		box-sizing: border-box;
		min-width: 0;
		overflow-wrap: anywhere;
		min-height: 100vh;
		isolation: isolate;
		background:
			radial-gradient(ellipse 120% 80% at 50% -10%, rgba(67, 56, 202, 0.28), transparent 60%),
			linear-gradient(180deg, var(--color-page-1) 0%, var(--color-page-1-1) 45%, var(--color-page-1-2) 100%);
		color: var(--color-page-1-c);
		font-family: var(--font-body);
		font-size: 1.0625rem;
		line-height: 1.7;
		font-weight: 400;
		letter-spacing: 0.005em;
		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
	}
	:host([prominent]) .page {
		align-items: center;
	}

	/*
	 * Deep space. Fixed rather than absolute so the field stays put while the page scrolls,
	 * which reads as looking *through* a window into depth rather than past a flat texture.
	 * Out-of-flow, so it never becomes a row of the .page grid.
	 */
	.cosmos {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
	}
	/*
	 * The page chrome deliberately has no view-transition-name: it stays put while the
	 * content rotates through, so the starfield and nav read as a fixed frame you are
	 * travelling behind. Transition rules live in global.css — view-transition-name has no
	 * effect on elements inside a shadow root, so the named elements have to be the
	 * light-DOM content blocks.
	 */
	header,
	main,
	footer {
		position: relative;
		z-index: 1;
	}

	/* A faint galactic band raked across the view, anchoring the composition diagonally. */
	.band {
		position: absolute;
		top: -30%;
		left: -30%;
		width: 160%;
		height: 160%;
		/*
		 * Stops are spread wide enough to be soft on their own. This element covers roughly
		 * 1800x1500px, so the blur it used to carry was re-rasterizing a ~2.8M pixel surface
		 * on every scroll-driven frame — by far the most expensive thing on the page.
		 */
		background: linear-gradient(
			104deg,
			transparent 30%,
			rgba(168, 180, 255, 0.055) 44%,
			rgba(224, 64, 154, 0.045) 50%,
			rgba(168, 180, 255, 0.055) 56%,
			transparent 70%
		);
	}

	.nebula {
		position: absolute;
		border-radius: 50%;
		/* screen makes the clouds add light to the void instead of painting over it. */
		mix-blend-mode: screen;
		will-change: transform;
		animation-play-state: var(--motion-play);
	}
	.n1 {
		top: -18vh;
		left: -10vw;
		width: 70vw;
		height: 70vh;
		background: radial-gradient(circle, var(--nebula-violet), transparent 62%);
		opacity: 0.4;
		filter: blur(28px);
		animation: drift-a 64s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}
	.n2 {
		top: 18vh;
		right: -16vw;
		width: 62vw;
		height: 66vh;
		background: radial-gradient(circle, var(--nebula-magenta), transparent 64%);
		opacity: 0.26;
		filter: blur(30px);
		animation: drift-b 82s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}
	.n3 {
		bottom: -24vh;
		left: 14vw;
		width: 66vw;
		height: 60vh;
		background: radial-gradient(circle, var(--nebula-cyan), transparent 66%);
		opacity: 0.22;
		filter: blur(32px);
		animation: drift-c 96s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}

	/*
	 * Three parallax star layers. Each is one repeating tile of tiny radial gradients, so an
	 * entire field costs a single painted layer instead of hundreds of elements. Inset is
	 * negative to leave room to drift without exposing an edge.
	 */
	.stars {
		position: absolute;
		inset: -20%;
		will-change: transform;
		animation-play-state: var(--motion-play);
	}
	.s1 {
		background-image:
			radial-gradient(circle 0.5px at 12% 18%, rgba(255, 255, 255, 0.9), transparent),
			radial-gradient(circle 0.5px at 37% 64%, rgba(255, 255, 255, 0.75), transparent),
			radial-gradient(circle 0.5px at 68% 28%, rgba(255, 255, 255, 0.85), transparent),
			radial-gradient(circle 0.5px at 84% 76%, rgba(255, 255, 255, 0.7), transparent),
			radial-gradient(circle 0.5px at 52% 88%, rgba(255, 255, 255, 0.8), transparent),
			radial-gradient(circle 0.5px at 24% 44%, rgba(255, 255, 255, 0.65), transparent),
			radial-gradient(circle 0.5px at 92% 12%, rgba(255, 255, 255, 0.75), transparent),
			radial-gradient(circle 0.5px at 6% 82%, rgba(255, 255, 255, 0.7), transparent);
		background-size: 280px 280px;
		opacity: 0.5;
		animation: drift-stars-slow 150s linear infinite;
		animation-play-state: var(--motion-play);
	}
	.s2 {
		background-image:
			radial-gradient(circle 0.9px at 22% 34%, rgba(255, 255, 255, 0.95), transparent),
			radial-gradient(circle 0.9px at 74% 14%, rgba(199, 220, 255, 0.9), transparent),
			radial-gradient(circle 0.9px at 46% 72%, rgba(255, 255, 255, 0.85), transparent),
			radial-gradient(circle 0.9px at 88% 58%, rgba(255, 236, 214, 0.85), transparent),
			radial-gradient(circle 0.9px at 14% 90%, rgba(255, 255, 255, 0.8), transparent),
			radial-gradient(circle 0.9px at 62% 42%, rgba(214, 232, 255, 0.9), transparent);
		background-size: 440px 440px;
		opacity: 0.75;
		animation: drift-stars-mid 110s linear infinite;
		animation-play-state: var(--motion-play);
	}
	.s3 {
		background-image:
			radial-gradient(circle 1.4px at 18% 26%, rgba(255, 255, 255, 1), transparent),
			radial-gradient(circle 1.2px at 64% 68%, rgba(196, 166, 255, 0.95), transparent),
			radial-gradient(circle 1.3px at 86% 22%, rgba(255, 236, 214, 0.95), transparent),
			radial-gradient(circle 1.1px at 34% 86%, rgba(125, 211, 252, 0.9), transparent);
		background-size: 680px 680px;
		opacity: 0.9;
		animation: twinkle 9s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}

	/* Darkens the corners so long-form text always sits on a calm, even ground. */
	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 85% 70% at 50% 42%, transparent 40%, rgba(4, 5, 14, 0.72) 100%);
	}

	@keyframes drift-a {
		to {
			transform: translate3d(6vw, 4vh, 0) scale(1.12);
		}
	}
	@keyframes drift-b {
		to {
			transform: translate3d(-7vw, -5vh, 0) scale(1.16);
		}
	}
	@keyframes drift-c {
		to {
			transform: translate3d(5vw, -4vh, 0) scale(1.1);
		}
	}
	@keyframes drift-stars-slow {
		to {
			transform: translate3d(-280px, -140px, 0);
		}
	}
	@keyframes drift-stars-mid {
		to {
			transform: translate3d(440px, 220px, 0);
		}
	}
	@keyframes twinkle {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}

	/*
	 * Scroll parallax, pure CSS via scroll-driven animations.
	 *
	 * The ambient drift above already animates the transform property, so parallax animates
	 * the independent translate property instead — the two compose on the same element and
	 * no wrapper divs are needed. Nearer layers travel further, which is what sells depth.
	 *
	 * Wrapped in @supports because Firefox and older Safari lack scroll timelines; without
	 * it they would simply ignore animation-timeline and run the parallax keyframes on a
	 * time basis, which would look wrong. Unsupported browsers keep the static field.
	 */
	@supports (animation-timeline: scroll()) {
		.band {
			animation: parallax-band linear;
			animation-play-state: var(--motion-play);
			animation-timeline: scroll(root block);
			animation-play-state: var(--motion-play);
		}
		.n1 {
			animation:
				drift-a 64s ease-in-out infinite alternate,
				parallax-near linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.n2 {
			animation:
				drift-b 82s ease-in-out infinite alternate,
				parallax-far linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.n3 {
			animation:
				drift-c 96s ease-in-out infinite alternate,
				parallax-mid linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s1 {
			animation:
				drift-stars-slow 150s linear infinite,
				parallax-far linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s2 {
			animation:
				drift-stars-mid 110s linear infinite,
				parallax-mid linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s3 {
			animation:
				twinkle 9s ease-in-out infinite alternate,
				parallax-near linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
	}

	@keyframes parallax-far {
		to {
			translate: 0 -40px;
		}
	}
	@keyframes parallax-mid {
		to {
			translate: 0 -110px;
		}
	}
	@keyframes parallax-near {
		to {
			translate: 0 -210px;
		}
	}
	@keyframes parallax-band {
		to {
			translate: 0 -70px;
		}
	}
	.header-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 999px;
		background: linear-gradient(
			135deg,
			color-mix(in srgb, var(--color-surface-1) 88%, transparent),
			color-mix(in srgb, var(--color-surface-1-1) 92%, transparent)
		);
		backdrop-filter: blur(18px) saturate(160%);
		-webkit-backdrop-filter: blur(18px) saturate(160%);
		box-shadow: var(--shadow-1);
	}

	.header-nav a {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1rem;
		border-radius: 999px;
		color: var(--color-neutral-1);
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.01em;
		text-decoration: none;
		transition:
			transform 180ms ease,
			background 180ms ease,
			box-shadow 180ms ease,
			color 180ms ease;
	}

	.header-nav a::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(135deg, var(--color-brand-1), var(--color-brand-1-1));
		opacity: 0;
		transform: scale(0.96);
		transition:
			opacity 180ms ease,
			transform 180ms ease;
		z-index: -1;
	}

	.header-nav a:hover,
	.header-nav a:focus-visible {
		color: var(--color-neutral-1);
		transform: translateY(-1px);
		box-shadow:
			0 10px 24px color-mix(in srgb, var(--color-brand-1-1) 22%, transparent),
			inset 0 1px 0 color-mix(in srgb, white 30%, transparent);
	}

	.header-nav a:hover::before,
	.header-nav a:focus-visible::before {
		opacity: 1;
		transform: scale(1);
	}

	.header-nav a:active {
		transform: translateY(0);
	}

	.header-nav a:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-brand-1) 65%, white 35%);
		outline-offset: 4px;
	}

	header {
		min-width: 0;
		padding: 0.5em 1.5em 0;
	}
	main {
		min-width: 0;
		padding: 2em 1.5em 4em;
	}

	footer {
		display: grid;
		place-items: center;
		gap: 1.5rem;
		padding: 2rem 1.5rem;
		border-top: 1px solid var(--color-surface-1-2);
		background: linear-gradient(180deg, var(--color-surface-1-1), transparent);
		color: var(--color-neutral-1-1);
	}

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: none;
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
		box-shadow: none;
	}

	.footer-nav a {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 0.35rem 0.2rem;
		border-radius: 0.5rem;
		color: var(--color-neutral-1-1);
		font-weight: 500;
		text-decoration: none;
		transition:
			color 180ms ease,
			background-color 180ms ease;
	}

	.footer-nav a::before {
		content: none;
	}

	.footer-nav a:hover,
	.footer-nav a:focus-visible {
		color: var(--color-neutral-1);
		background: color-mix(in srgb, var(--color-surface-1) 70%, transparent);
		box-shadow: none;
		transform: none;
	}

	.footer-nav a:active {
		transform: none;
	}

	.footer-nav a:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-brand-1) 50%, white 20%);
		outline-offset: 3px;
	}

	footer small {
		display: block;
		color: var(--color-neutral-1-1);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	footer small a {
		color: var(--color-brand-1);
		text-decoration: none;
		font-weight: 600;
		transition: color 180ms ease;
	}

	footer small a:hover,
	footer small a:focus-visible {
		color: var(--color-brand-1-1);
	}

	footer small a:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--color-brand-1) 50%, white 20%);
		outline-offset: 3px;
		border-radius: 0.25rem;
	}

	/*
	 * Pinned top-left so it is reachable before any scrolling — an accessibility control is
	 * no use parked at the bottom of a long page. Sits above the content layer, and is kept
	 * out of the named view-transition regions so it stays put during page transitions.
	 */
	.motion-toggle {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 10;
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.9rem 0.5rem 0.6rem;
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
		border: 1px solid var(--color-surface-1-2);
		border-radius: 999px;
		background: var(--color-surface-1-1);
		color: var(--color-neutral-1-1);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			color calc(var(--motion) * 180ms) ease,
			border-color calc(var(--motion) * 180ms) ease,
			background calc(var(--motion) * 180ms) ease;
	}
	.motion-toggle:hover {
		color: var(--color-neutral-1);
		border-color: color-mix(in srgb, var(--color-brand-1) 40%, transparent);
	}
	.motion-toggle:focus-visible {
		outline: 2px solid var(--color-brand-1);
		outline-offset: 3px;
	}
	.switch {
		position: relative;
		width: 2rem;
		height: 1.125rem;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-page-1-c) 18%, transparent);
		transition: background calc(var(--motion) * 180ms) ease;
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 0.1875rem;
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: var(--color-neutral-1);
		translate: 0 -50%;
		transition: translate calc(var(--motion) * 180ms) ease;
	}
	.motion-toggle[aria-pressed='true'] .switch {
		background: color-mix(in srgb, var(--color-brand-1) 70%, transparent);
	}
	.motion-toggle[aria-pressed='true'] .knob {
		translate: 0.875rem -50%;
	}

	.mobile-menu {
		display: none;
	}
	.mobile-menu summary {
		list-style: none;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-height: 44px;
		box-sizing: border-box;
		padding: 0.75rem 1rem;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 1rem;
		background: var(--color-surface-1);
		color: var(--color-neutral-1);
		font-weight: 600;
		cursor: pointer;
	}
	.mobile-menu summary::-webkit-details-marker {
		display: none;
	}
	.mobile-menu summary:focus-visible {
		outline: 2px solid var(--color-brand-1);
		outline-offset: 4px;
	}
	@media (max-width: 40rem) {
		.desktop-nav {
			display: none;
		}
		.mobile-menu {
			display: block;
		}
		.mobile-menu .header-nav {
			flex-direction: column;
			align-items: stretch;
			margin-top: 0.5rem;
			border-radius: 1rem;
		}
		.mobile-menu .header-nav a {
			justify-content: flex-start;
			min-height: 44px;
			box-sizing: border-box;
		}
		header {
			padding-inline: 1rem;
		}
		main {
			padding-inline: 1rem;
		}
		footer {
			padding-inline: 1rem;
			text-align: center;
		}
		.footer-nav {
			justify-content: center;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		a,
		a::before {
			transition: none !important;
		}
	}
`;
