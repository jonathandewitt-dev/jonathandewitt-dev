import { css, customElement, html } from 'thunderous';

export const PageHeading = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(stylesheet);
	return html`
		<nav aria-label="Breadcrumb"><slot name="breadcrumbs"></slot></nav>
		<hgroup>
			<h2 class="subtitle"><slot name="subtitle"></slot></h2>
			<h1><slot></slot></h1>
		</hgroup>
	`;
});

const stylesheet = css`
	:host {
		display: grid;
		justify-items: end;
		text-align: right;
		color: var(--color-page-1-c);
	}
	nav {
		display: none;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 0.75rem;
		color: var(--color-neutral-1-1);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.6;
		letter-spacing: 0.01em;
	}
	:host([with-breadcrumbs]) nav {
		display: flex;
	}
	hgroup {
		display: contents;
	}
	h1 {
		margin: 0;
		max-width: 20ch;
		font-family: inherit;
		font-size: clamp(2.5rem, 1.5rem + 3vw, 4.5rem);
		font-weight: 700;
		line-height: 1.08;
		letter-spacing: -0.045em;
		text-wrap: balance;
		overflow-wrap: anywhere;
		padding: 0 0 1rem;
	}
	.subtitle {
		display: none;
		max-width: 42ch;
		margin: 0;
		color: var(--color-neutral-1-1);
		font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
		font-weight: 400;
		line-height: 1.55;
		letter-spacing: 0.015em;
		text-wrap: balance;
	}
	:host([with-subtitle]) .subtitle {
		display: block;
	}
	:host([prominent]) h1 {
		translate: 0 -0.3rem;
		font-size: clamp(3rem, 1.5rem + 5vw, 6rem);
		line-height: 1.04;
	}
`;
