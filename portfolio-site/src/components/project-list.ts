import { createSignal, css, customElement, derived, html } from 'thunderous';
import { focusRing } from '../styles';

export const ProjectList = customElement(({ adoptStyleSheet, internals, clientOnlyCallback }) => {
	clientOnlyCallback(() => {
		internals.role = 'list';
	});
	adoptStyleSheet(listStyles);
	return html`<slot></slot>`;
});

export const ProjectItem = customElement(({ adoptStyleSheet, attrSignals, internals, clientOnlyCallback }) => {
	const [href] = attrSignals['href'] ?? createSignal(null);
	const [image] = attrSignals['image'] ?? createSignal(null);
	const [imageSrcset] = attrSignals['imagesrcset'] ?? createSignal(null);
	const [imageCardSrcset] = attrSignals['imagecardsrcset'] ?? createSignal(null);
	const [actionText] = attrSignals['actiontext'] ?? createSignal(null);
	const actionLabel = derived(() => actionText() ?? 'Visit project');
	const thumbnail = derived(() => {
		const src = image();
		return src === null || src === ''
			? ''
			: html`<div class="thumbnail">
					<picture>
						<source media="(width > 36rem)" sizes="12rem" srcset="${imageCardSrcset}" />
						<img
							sizes="calc(100vw - 2rem)"
							srcset="${imageSrcset}"
							src="${src}"
							alt=""
							width="400"
							height="300"
							loading="lazy"
							decoding="async"
						/>
					</picture>
				</div>`;
	});
	clientOnlyCallback(() => {
		internals.role = 'listitem';
	});
	adoptStyleSheet(focusRing);
	adoptStyleSheet(itemStyles);
	return html`
		<a class="project" href="${href}">
			${thumbnail}
			<div class="details">
				<h2><slot name="title"></slot></h2>
				<p><slot></slot></p>
				<span class="action" aria-hidden="true">${actionLabel} <span>↗</span></span>
			</div>
		</a>
	`;
});

const listStyles = css`
	:host {
		display: grid;
		gap: 1.25rem;
		margin-block: 2rem;
	}
`;

const itemStyles = css`
	:host {
		display: block;
		min-width: 0;
	}
	.project {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: stretch;
		border: 1px solid var(--color-surface-1-2);
		border-radius: 1rem;
		background: var(--color-surface-1);
		color: var(--color-page-1-c);
		text-decoration: none;
		transition:
			border-color 160ms ease,
			box-shadow 160ms ease;
	}
	:host([image]:not([image=''])) .project {
		grid-template-columns: 12rem minmax(0, 1fr);
	}
	.project:hover {
		border-color: var(--color-brand-1);
		box-shadow: var(--shadow-1);
	}
	.thumbnail {
		position: relative;
		display: grid;
		place-items: center;
		min-height: 10rem;
		border-radius: 1rem 0 0 1rem;
		/* Logos still need a light plate to read against, but pure #fff glares in deep space. */
		background: #e8ecf8;
		overflow: hidden;
	}
	picture {
		position: absolute;
		inset: 0;
	}
	img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	:host([cover]) img {
		object-fit: cover;
	}
	:host([logo]) img {
		padding: 1.25rem;
		box-sizing: border-box;
	}
	.details {
		display: grid;
		align-content: center;
		gap: 0.6rem;
		padding: 1.25rem;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	h2 {
		margin: 0;
		font-size: 1.2rem;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}
	p {
		margin: 0;
		color: var(--color-neutral-1-1);
	}
	.action {
		margin-top: 0.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-brand-1);
	}
	.action span {
		margin-left: 0.25rem;
	}
	@media (max-width: 36rem) {
		.project,
		:host([image]:not([image=''])) .project {
			grid-template-columns: minmax(0, 1fr);
		}
		.thumbnail {
			aspect-ratio: 16 / 9;
			min-height: 0;
			border-radius: 1rem 1rem 0 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.project {
			transition: none;
		}
	}
`;
