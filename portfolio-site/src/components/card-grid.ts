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
		padding: 1.4rem;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 1rem;
		background:
			linear-gradient(145deg, color-mix(in srgb, var(--color-brand-1) 7%, transparent), transparent 42%),
			var(--color-surface-1);
		color: var(--color-page-1-c);
		overflow-wrap: anywhere;
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		transition:
			border-color calc(var(--motion) * 200ms) ease,
			transform calc(var(--motion) * 200ms) ease,
			box-shadow calc(var(--motion) * 200ms) ease;
	}
	:host(:hover) {
		border-color: color-mix(in srgb, var(--color-brand-1) 42%, transparent);
		transform: translateY(-2px);
		box-shadow: var(--shadow-1);
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
		font-family: var(--font-display);
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.4;
		color: var(--color-neutral-1);
	}
`;
