import { css, customElement, html } from 'thunderous';

export const CardGrid = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(gridStyles);
	return html`<slot></slot>`;
});

export const Card = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(cardStyles);
	return html`
		<article>
			<header><slot name="heading"></slot></header>
			<div class="body"><slot></slot></div>
		</article>
	`;
});

const gridStyles = css`
	:host {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 1rem;
		margin-block: 1.5rem;
		min-width: 0;
	}
`;

const cardStyles = css`
	:host {
		display: block;
		min-width: 0;
		padding: 1.25rem;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 1rem;
		background: var(--color-surface-1);
		color: var(--color-page-1-c);
		overflow-wrap: anywhere;
	}
	article,
	header,
	.body {
		display: grid;
		gap: 0.75rem;
	}
	::slotted(*) {
		margin: 0;
	}
	::slotted([slot='heading']) {
		font-size: 1.125rem;
		line-height: 1.4;
	}
`;
