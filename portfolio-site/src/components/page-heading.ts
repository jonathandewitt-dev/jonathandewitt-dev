import { css, customElement, html } from 'thunderous';

export const PageHeading = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`
		<nav aria-label="Breadcrumb"><slot name="breadcrumbs"></slot></nav>
		<hgroup>
			<h2 class="subtitle"><slot name="subtitle"></slot></h2>
			<h1><slot></slot></h1>
		</hgroup>
	`;
});

const stylesheet = css`
	:host {
		display: grid;
		justify-items: end;
		text-align: right;
		color: var(--color-page-1-c);
	}
	nav {
		display: none;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 0.75rem;
		color: var(--color-neutral-1-1);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.6;
		letter-spacing: 0.01em;
	}
	:host([with-breadcrumbs]) nav {
		display: flex;
	}
	hgroup {
		display: contents;
	}
	/*
	 * The headline is deliberately drawn at an extreme light weight. At display sizes a 200
	 * reads as elegant rather than frail, and it sets up the contrast against the heavy,
	 * tracked-out eyebrow above it.
	 */
	h1 {
		margin: 0;
		max-width: 20ch;
		font-family: var(--font-display);
		font-size: clamp(2.75rem, 1.5rem + 3.6vw, 5rem);
		font-weight: 200;
		line-height: 1.04;
		letter-spacing: -0.035em;
		text-wrap: balance;
		overflow-wrap: anywhere;
		padding: 0 0 1rem;
		background: linear-gradient(176deg, #ffffff 18%, var(--color-brand-1) 72%, var(--color-brand-1-1) 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		/* Starlight bloom. Sits behind the glyphs, so it never muddies their edges. */
		filter: drop-shadow(0 0 28px color-mix(in srgb, var(--color-brand-1) 22%, transparent));
	}
	/* Heavy, wide-tracked, small — the loud half of the thin/bold pairing. */
	.subtitle {
		display: none;
		max-width: 42ch;
		margin: 0 0 0.9rem;
		color: var(--color-brand-1);
		font-family: var(--font-display);
		font-size: clamp(0.7rem, 0.62rem + 0.26vw, 0.82rem);
		font-weight: 700;
		line-height: 1.5;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		text-wrap: balance;
	}
	:host([with-subtitle]) .subtitle {
		display: block;
	}
	:host([prominent]) h1 {
		translate: 0 -0.3rem;
		font-size: clamp(3.25rem, 1.5rem + 6.5vw, 8rem);
		font-weight: 150;
		line-height: 0.98;
		letter-spacing: -0.045em;
	}
`;
