import { css, customElement, html } from 'thunderous';

export const List = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'list';
	});
	adoptStyleSheet(listStyles);
	return html`<slot></slot>`;
});

export const ListItem = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'listitem';
	});
	adoptStyleSheet(itemStyles);
	return html`<slot></slot>`;
});

const listStyles = css`
	:host {
		display: block;
		margin-block: 1em;
		padding-inline-start: 40px;
		list-style-type: disc;
	}
`;

const itemStyles = css`
	:host {
		display: list-item;
	}
	:host(:not(:first-child)) {
		margin-top: 0.75rem;
	}
`;
