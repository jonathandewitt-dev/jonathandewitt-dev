import { createSignal, css, customElement, html } from 'thunderous';

/**
 * A circular headshot, rimmed and bloomed to sit alongside the orbit nav.
 *
 * @example
 * ```html
 * <x-portrait src="/assets/portrait.png" alt="Jonathan DeWitt"></x-portrait>
 * ```
 */
export const Portrait = customElement(({ adoptStyleSheet, attrSignals }) => {
	const [src] = attrSignals['src'] ?? createSignal(null);
	const [alt] = attrSignals['alt'] ?? createSignal('');
	adoptStyleSheet(stylesheet);
	return html`
		<figure>
			<img src="${src}" alt="${alt}" decoding="async" />
		</figure>
	`;
});

const stylesheet = css`
	:host {
		display: block;
		width: var(--portrait-size, 11rem);
		height: var(--portrait-size, 11rem);
	}
	figure {
		position: relative;
		width: 100%;
		height: 100%;
		margin: 0;
		overflow: hidden;
		border-radius: 50%;
		border: 1px solid color-mix(in srgb, var(--color-brand-1) 45%, transparent);
		box-sizing: border-box;
		box-shadow:
			0 0 0 6px color-mix(in srgb, var(--color-brand-1) 7%, transparent),
			0 18px 50px rgba(2, 4, 16, 0.6),
			0 0 44px color-mix(in srgb, var(--color-brand-1) 20%, transparent);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		/* Biased upward so a head stays centred if the source is taller than it is wide. */
		object-position: 50% 38%;
		/* The full frame reads small at this diameter, so the crop is tightened onto the face. */
		transform: scale(var(--portrait-zoom, 1.14));
		display: block;
	}
	/* Darkens only the outer edge, so a photo shot against a bright background falls away into
	   the page instead of reading as a disc pasted onto it. */
	figure::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background:
			radial-gradient(circle at 50% 44%, transparent 46%, rgba(4, 5, 14, 0.78) 100%),
			linear-gradient(170deg, transparent 55%, color-mix(in srgb, var(--nebula-violet) 26%, transparent));
		pointer-events: none;
	}
`;
