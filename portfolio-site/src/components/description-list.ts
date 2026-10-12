import { css, customElement, html } from 'thunderous';

export const DescriptionList = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(listStyles);
	return html`<dl><slot></slot></dl>`;
});

export const DescriptionItem = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(itemStyles);
	return html`
		<div class="item">
			<dt><slot name="term"></slot></dt>
			<dd><slot></slot></dd>
		</div>
	`;
});

const listStyles = css`
	:host {
		display: block;
	}
	dl {
		margin-block: 2rem;
	}
`;

const itemStyles = css`
	:host {
		display: block;
	}
	.item {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 0.5rem 1.5rem;
		padding-block: 1.25rem;
	}
	:host(:not(:last-child)) .item {
		border-bottom: 1px solid color-mix(in srgb, currentColor 20%, transparent);
	}
	dt {
		font-weight: 600;
	}
	dd {
		margin: 0;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	@media (max-width: 36rem) {
		.item {
			grid-template-columns: minmax(0, 1fr);
		}
	}
`;
