import { createSignal, css, customElement, html } from 'thunderous';
import { focusRing } from '../styles';

export const Link = customElement(({ adoptStyleSheet, attrSignals }) => {
	const [href] = attrSignals['href'] ?? createSignal(null);
	adoptStyleSheet(focusRing);
	adoptStyleSheet(stylesheet);
	return html`<a href="${href}"><slot></slot></a>`;
});

const stylesheet = css`
	a {
		color: var(--color-brand-1);
		text-underline-offset: 0.2em;
		text-decoration-color: color-mix(in srgb, var(--color-brand-1) 45%, transparent);
		text-decoration-thickness: 1px;
		border-radius: 0.2rem;
		transition:
			color calc(var(--motion) * 160ms) ease,
			text-decoration-color calc(var(--motion) * 160ms) ease;
	}
	a:hover {
		color: var(--color-brand-1-1);
		text-decoration-color: currentColor;
	}
	:host {
		--focus-ring-offset: 3px;
	}
`;
