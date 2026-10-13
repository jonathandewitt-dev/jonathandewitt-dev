import { css, customElement, html } from 'thunderous';

export const Section = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`<section><slot></slot></section>`;
});

/* Duplicates x-content's copy styles rather than sharing them. ::slotted() cannot reach past
   direct children. */
const stylesheet = css`
	:host {
		display: flow-root;
	}
	:host(:not(:first-child)) {
		padding-block-start: 3rem;
	}

	::slotted(h2) {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 1.3rem + 1.8vw, 2.75rem);
		font-weight: 300;
		line-height: 1.14;
		letter-spacing: -0.025em;
		text-wrap: balance;
		margin: 0 0 1.1rem;
		color: var(--color-neutral-1);
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
	::slotted(p) {
		margin: 0 0 1.15rem;
		font-size: 1.0625rem;
		line-height: 1.75;
		color: color-mix(in srgb, var(--color-page-1-c) 88%, transparent);
		text-wrap: pretty;
	}
	::slotted(nav) {
		margin-block-end: 1rem;
	}
`;
