import { customElement, html, css } from 'thunderous';
import { theme } from '../theme';

export const Page = customElement(({ adoptStyleSheet, root, connectedCallback, disconnectedCallback }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(stylesheet);

	let cleanup = () => {};
	connectedCallback(() => {
		cleanup();
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
		cleanup = () => {
			menu.removeEventListener('keydown', closeOnEscape);
			menu.removeEventListener('click', closeOnNavigation);
			desktop.removeEventListener('change', closeOnResize);
		};
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
			<header>
				<slot name="header"></slot>
				<nav class="header-nav desktop-nav" aria-label="Main navigation">${links()}</nav>
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
		background:
			radial-gradient(circle at top left, var(--color-accent-1), transparent 30%),
			radial-gradient(circle at bottom right, var(--color-accent-1-1), transparent 35%),
			linear-gradient(180deg, var(--color-page-1) 0%, var(--color-page-1-1) 45%, var(--color-page-1-2) 100%);
		color: var(--color-page-1-c);
		font-family: 'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, sans-serif;
		font-size: 1rem;
		line-height: 1.6;
		font-weight: 400;
		letter-spacing: 0.01em;
		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-moz-osx-font-smoothing: grayscale;
		-webkit-font-smoothing: antialiased;
	}
	:host([prominent]) .page {
		align-items: center;
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
		padding: 1em 1.5em 0;
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
