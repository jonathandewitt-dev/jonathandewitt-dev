import { css, customElement, html } from 'thunderous';

export const Content = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`<slot></slot>`;
});

const stylesheet = css`
	:host {
		display: block;
		max-width: 72ch;
		margin-inline: auto;
		overflow-wrap: anywhere;
	}
`;
