import { css, customElement, html } from 'thunderous';

export const Content = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`<slot></slot>`;
});

/*
 * Typography for page copy. The headings and paragraphs live in the light DOM, so they are
 * reachable only as ::slotted() direct children — nested markup (inside x-section, x-card)
 * is styled by those components instead.
 */
const stylesheet = css`
	:host {
		display: block;
		max-width: 72ch;
		margin-inline: auto;
		overflow-wrap: anywhere;
	}

	::slotted(h2) {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 1.3rem + 1.8vw, 2.75rem);
		font-weight: 300;
		line-height: 1.14;
		letter-spacing: -0.025em;
		text-wrap: balance;
		margin: 3rem 0 1.1rem;
		color: var(--color-neutral-1);
	}
	::slotted(h2:first-child) {
		margin-top: 0;
	}
	::slotted(h3) {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem);
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.012em;
		margin: 2.25rem 0 0.75rem;
		color: var(--color-neutral-1);
	}
	/* Body copy is held just under pure white; full-strength text on near-black glares. */
	::slotted(p) {
		margin: 0 0 1.15rem;
		font-size: 1.0625rem;
		line-height: 1.75;
		color: color-mix(in srgb, var(--color-page-1-c) 88%, transparent);
		text-wrap: pretty;
	}
	::slotted(strong) {
		font-weight: 700;
		color: var(--color-neutral-1);
	}
	/* A horizon line rather than a rule — bright at the centre, dissolving at both edges. */
	::slotted(hr) {
		height: 1px;
		border: 0;
		margin: 3.5rem 0;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--color-brand-1) 55%, transparent) 50%,
			transparent
		);
	}
`;
