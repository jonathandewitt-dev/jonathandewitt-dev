import { customElement, html, css } from 'thunderous';
import { theme } from '../theme';
import { MOTION_CHANGE, resolveMotion, setMotion, type MotionPreference } from '../motion';
import { routes } from '../routes';
import { focusRing } from '../styles';

export const Page = customElement(({ adoptStyleSheet, root, connectedCallback, disconnectedCallback }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(focusRing);
	adoptStyleSheet(stylesheet);

	let cleanup = () => {};
	connectedCallback(() => {
		cleanup();
		const teardowns: (() => void)[] = [];
		cleanup = () => {
			for (const teardown of teardowns.splice(0)) teardown();
		};

		const motionToggle = root.querySelector<HTMLButtonElement>('.motion-toggle');
		if (motionToggle !== null) {
			const renderMotion = () => {
				motionToggle.setAttribute('aria-pressed', String(resolveMotion() === 'reduced'));
			};
			renderMotion();
			const onMotionClick = () => {
				const next: MotionPreference = resolveMotion() === 'reduced' ? 'full' : 'reduced';
				setMotion(next);
			};
			motionToggle.addEventListener('click', onMotionClick);
			document.addEventListener(MOTION_CHANGE, renderMotion);
			teardowns.push(() => {
				motionToggle.removeEventListener('click', onMotionClick);
				document.removeEventListener(MOTION_CHANGE, renderMotion);
			});
		}
	});
	disconnectedCallback(() => cleanup());

	const links = () => html`${routes.map((route) => html`<a href="${route.href}">${route.label}</a>`)}`;

	return html`
		<div class="page">
			<button type="button" class="motion-toggle" aria-pressed="false">
				<span class="switch" aria-hidden="true"><span class="knob"></span></span>
				<span>Reduce motion</span>
			</button>
			<header>
				<slot name="header"></slot>
				<slot name="navigation"></slot>
			</header>
			<main>
				<slot></slot>
			</main>
			<footer>
				<nav class="footer-nav" aria-label="Footer navigation">${links()}</nav>
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
		/* The page backdrop paints below the persistent cosmos; only the content forms a higher layer. */
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

	/* Deliberately unnamed for view transitions, so the chrome holds still while the content
	   travels against it. See "Page transitions" in README.md. */
	header,
	main,
	footer {
		position: relative;
		z-index: 1;
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

	.footer-nav a,
	footer small a {
		--focus-ring-color: color-mix(in srgb, var(--color-brand-1) 50%, white 20%);
		--focus-ring-offset: 3px;
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
		border-radius: 0.25rem;
	}

	/* Wide screens have room to keep this reachable while scrolling. */
	.motion-toggle {
		position: fixed;
		top: 0.5rem;
		left: 0.5rem;
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
	.motion-toggle {
		--focus-ring-offset: 3px;
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

	@media (max-width: 27em) {
		.page {
			grid-template-rows: auto auto 1fr auto;
		}
		.motion-toggle {
			position: static;
			justify-self: start;
			margin: 0.5rem 0.5rem 0;
		}
	}
	@media (max-width: 40rem) {
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
