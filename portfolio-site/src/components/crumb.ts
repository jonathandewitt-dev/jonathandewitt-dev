import { createSignal, css, customElement, html } from 'thunderous';

export const Crumb = customElement(({ adoptStyleSheet, attrSignals }) => {
	const [href] = attrSignals['href'] ?? createSignal(null);
	const [current] = attrSignals['current'] ?? createSignal('false');
	adoptStyleSheet(stylesheet);

	return html`
		<a href="${href}" aria-current="${current}"><slot></slot></a>
		<span class="separator" aria-hidden="true">/</span>
	`;
});

const stylesheet = css`
	:host {
		display: inline-flex;
		align-items: baseline;
		gap: 0.75rem;
		min-width: 0;
	}
	a {
		color: inherit;
		text-decoration: none;
		text-underline-offset: 0.2em;
		border-radius: 0.2rem;
	}
	a:hover {
		color: var(--color-page-1-c);
		text-decoration: underline;
	}
	a:focus-visible {
		outline: 2px solid var(--color-brand-1);
		outline-offset: 4px;
	}
	a[aria-current='page'] {
		color: var(--color-page-1-c);
		font-weight: 600;
	}
	.separator {
		color: var(--color-neutral-1-1);
	}
	:host(:last-child) .separator {
		display: none;
	}
`;
