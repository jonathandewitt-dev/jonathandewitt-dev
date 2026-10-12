import { css, customElement, html } from 'thunderous';

export const Section = customElement(({ adoptStyleSheet }) => {
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
`;
