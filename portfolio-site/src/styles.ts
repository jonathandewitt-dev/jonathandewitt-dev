import { css } from 'thunderous';

/**
 * Typography for slotted page copy, adopted by any component that can receive prose.
 *
 * `::slotted()` only reaches direct children, so every wrapper that accepts copy needs these
 * rules in its own shadow root. Adopting one constructed stylesheet in each is how they stay
 * identical rather than drifting apart as separate declarations.
 *
 * Block spacing is deliberately absent: it depends on what the copy is nested inside, so each
 * adopting component sets its own margins.
 */
export const prose = css`
	::slotted(h2) {
		font-family: var(--font-display);
		font-size: clamp(1.9rem, 1.3rem + 1.8vw, 2.75rem);
		font-weight: 300;
		line-height: 1.14;
		letter-spacing: -0.025em;
		text-wrap: balance;
		color: var(--color-neutral-1);
	}
	::slotted(h3) {
		font-family: var(--font-display);
		font-size: clamp(1.25rem, 1.05rem + 0.6vw, 1.5rem);
		font-weight: 600;
		line-height: 1.25;
		letter-spacing: -0.012em;
		margin: 2.25rem 0 0.75rem;
		color: var(--color-neutral-1);
	}
	::slotted(p) {
		margin: 0 0 1.15rem;
		font-size: 1.0625rem;
		line-height: 1.75;
		/* Held just under pure white; full-strength text on near-black glares. */
		color: color-mix(in srgb, var(--color-page-1-c) 88%, transparent);
		text-wrap: pretty;
	}
	::slotted(strong) {
		font-weight: 700;
		color: var(--color-neutral-1);
	}
`;

/**
 * A single focus indicator for the whole site, adopted by any component with focusable content.
 *
 * Styles are not inherited across a shadow boundary, so a focus ring defined once in the
 * document cannot reach component internals. Adopting this gives every shadow root the same
 * indicator without restating it.
 *
 * Components vary it by setting the custom properties rather than redeclaring the rule.
 *
 * @example
 * ```css
 * .subdued-control {
 *   --focus-ring-offset: 3px;
 * }
 * ```
 */
export const focusRing = css`
	:focus-visible {
		outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, var(--color-brand-1));
		outline-offset: var(--focus-ring-offset, 4px);
	}
`;
