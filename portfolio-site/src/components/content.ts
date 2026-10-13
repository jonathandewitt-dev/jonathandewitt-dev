import { css, customElement, html } from 'thunderous';
import { prose } from '../styles';

export const Content = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(prose);
	adoptStyleSheet(stylesheet);
	return html`<slot></slot>`;
});

const stylesheet = css`
	:host {
		display: flow-root;
		max-width: 72ch;
		margin-inline: auto;
		overflow-wrap: anywhere;
	}
	::slotted(x-portrait) {
		float: right;
		shape-outside: circle(50%);
		shape-margin: 1.1rem;
		margin: 0.35rem 0 1rem 1.75rem;
	}
	@media (max-width: 34rem) {
		::slotted(x-portrait) {
			float: none;
			margin: 0 auto 1.5rem;
		}
	}

	::slotted(h2) {
		margin: 3rem 0 1.1rem;
	}
	::slotted(h2:first-child) {
		margin-top: 0;
	}
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
