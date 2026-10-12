import { createSignal, css, customElement, html } from 'thunderous';

export const Link = customElement(({ adoptStyleSheet, attrSignals }) => {
	const [href] = attrSignals['href'] ?? createSignal(null);
	adoptStyleSheet(stylesheet);
	return html`<a href="${href}"><slot></slot></a>`;
});

const stylesheet = css`
	a {
		color: inherit;
		text-underline-offset: 0.2em;
	}
`;
