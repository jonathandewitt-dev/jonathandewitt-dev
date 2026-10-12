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
		padding-left: 1rem;
		border-left: 0.25rem solid;
		opacity: 0.5;
	}
`;
