import { css, customElement, html } from 'thunderous';
import { prose } from '../styles';

export const Section = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(prose);
	adoptStyleSheet(stylesheet);
	return html`<section><slot></slot></section>`;
});

const stylesheet = css`
	:host {
		display: flow-root;
	}
	:host(:not(:first-child)) {
		padding-block-start: 3rem;
	}

	/* The section itself supplies the leading space, so its opening heading does not. */
	::slotted(h2) {
		margin: 0 0 1.1rem;
	}
	::slotted(nav) {
		margin-block-end: 1rem;
	}
`;
