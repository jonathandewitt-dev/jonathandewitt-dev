import { css, customElement, html } from 'thunderous';

export const Blockquote = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`<blockquote><slot></slot></blockquote>`;
});

const stylesheet = css`
	:host {
		display: block;
	}
	blockquote {
		margin: 3rem 0 0 0;
		padding: 1.1rem 1.25rem;
		/* Replaces a flat 50% opacity, which dimmed the text below comfortable reading contrast. */
		border-left: 2px solid color-mix(in srgb, var(--color-brand-1) 55%, transparent);
		border-radius: 0 0.6rem 0.6rem 0;
		background: linear-gradient(90deg, color-mix(in srgb, var(--color-brand-1) 8%, transparent), transparent 70%);
		color: color-mix(in srgb, var(--color-page-1-c) 78%, transparent);
		font-size: 0.97rem;
	}
	::slotted(p) {
		margin: 0;
	}
`;
