import { css, customElement, html } from 'thunderous';
import { theme } from '../theme';
import { routes } from '../routes';

/** Persistent scenery shared by every route. See "Travelling between pages" in README.md. */
export const Cosmos = customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(stylesheet);
	return html`
		<div class="orion" style="--voyage-stops: ${Math.max(1, routes.length - 1)}"></div>
		<div class="voyage clouds">
			${routes.map(
				(_, index) => html`
					<div class="sector" style="left: calc(${index * 100}% - 25%)">
						<div class="cloudscape variant-${index % 3}">
							<div class="band"></div>
							<div class="nebula n1"></div>
							<div class="nebula n2"></div>
							<div class="nebula n3"></div>
						</div>
					</div>
				`,
			)}
		</div>
		<div class="voyage v1" style="--field-width: ${routes.length * 100}%"><div class="stars s1"></div></div>
		<div class="voyage v2" style="--field-width: ${routes.length * 100}%"><div class="stars s2"></div></div>
		<div class="voyage v3" style="--field-width: ${routes.length * 100}%"><div class="stars s3"></div></div>
		<div class="vignette"></div>
	`;
});

const stylesheet = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		pointer-events: none;
		opacity: 0.5;
	}

	/* Voyage needs a carrier because drift and scroll parallax already own transform and translate. */
	.voyage,
	.orion {
		position: absolute;
		transition: transform calc(var(--motion) * var(--nav-duration) * 1ms) var(--ease-voyage);
	}
	.voyage {
		inset: 0;
		transform: translate3d(calc(var(--voyage, 0) * var(--voyage-step)), 0, 0);
	}
	.orion {
		/* Overscan reserves the entire route journey inside one photo, avoiding tiled seams. */
		inset: -7.5vh auto auto 0;
		width: 140vw;
		height: 130vh;
		background: url('/assets/orion-nebula.jpg') center / cover no-repeat;
		opacity: 0.3;
		transform: translate3d(
			calc(-40vw * var(--voyage, 0) / var(--voyage-stops)),
			calc(-15vh * var(--voyage, 0) / var(--voyage-stops)),
			0
		);
	}
	.clouds {
		--voyage-step: -50vw;
	}
	/* Overlapping masks soften region boundaries without stretching the viewport-sized scenery. */
	.sector {
		position: absolute;
		top: -100vh;
		width: 150%;
		height: calc(100% + 200vh);
		mask-image: linear-gradient(to right, transparent, black 33.333333%, black 66.666667%, transparent);
	}
	.sector:first-child {
		mask-image: linear-gradient(to right, black 66.666667%, transparent);
	}
	.sector:last-child {
		mask-image: linear-gradient(to right, transparent, black 33.333333%);
	}
	.cloudscape {
		position: absolute;
		top: 100vh;
		left: calc(100% / 6);
		width: calc(100% * 2 / 3);
		height: calc(100% - 200vh);
	}
	.variant-1 {
		transform: translateY(8vh) scaleX(-1);
	}
	.variant-2 {
		transform: translateY(-6vh);
	}
	.variant-2 .n1 {
		left: 25vw;
	}
	.variant-2 .n2 {
		right: 35vw;
	}
	.v1 {
		--voyage-step: -35vw;
	}
	.v2 {
		--voyage-step: -65vw;
	}
	.v3 {
		--voyage-step: -100vw;
	}

	.band {
		--parallax-distance: -70px;
		position: absolute;
		top: -30%;
		left: -30%;
		width: 160%;
		height: 160%;
		/* Stops are spread wide enough to be soft without a blur filter, which would be
		   re-rasterized every scroll-driven frame across a surface this large. */
		background: linear-gradient(
			104deg,
			transparent 30%,
			rgba(168, 180, 255, 0.055) 44%,
			rgba(224, 64, 154, 0.045) 50%,
			rgba(168, 180, 255, 0.055) 56%,
			transparent 70%
		);
	}

	.nebula {
		position: absolute;
		border-radius: 50%;
		/* Adds light to the void rather than painting over it. */
		mix-blend-mode: screen;
		will-change: transform;
		animation-play-state: var(--motion-play);
	}
	.n1 {
		--parallax-distance: -95px;
		top: -18vh;
		left: -10vw;
		width: 70vw;
		height: 70vh;
		background: radial-gradient(circle, var(--nebula-violet), transparent 62%);
		opacity: 0.4;
		filter: blur(28px);
		animation: drift-a 64s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}
	.n2 {
		--parallax-distance: -45px;
		top: 18vh;
		right: -16vw;
		width: 62vw;
		height: 66vh;
		background: radial-gradient(circle, var(--nebula-magenta), transparent 64%);
		opacity: 0.26;
		filter: blur(30px);
		animation: drift-b 82s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}
	.n3 {
		--parallax-distance: -130px;
		bottom: -24vh;
		left: 14vw;
		width: 66vw;
		height: 60vh;
		background: radial-gradient(circle, var(--nebula-cyan), transparent 66%);
		opacity: 0.22;
		filter: blur(32px);
		animation: drift-c 96s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}

	/* One repeating tile of gradients per layer, so a whole field costs a single painted layer
	   rather than hundreds of elements. Negative inset leaves room to drift without exposing
	   an edge. */
	.stars {
		position: absolute;
		top: -20%;
		left: -20%;
		width: calc(var(--field-width) + 40vw);
		height: calc(140vh + 560px);
		will-change: transform;
		animation-play-state: var(--motion-play);
	}
	.s1 {
		--parallax-distance: -35px;
		background-image:
			radial-gradient(circle 1.5px at 12% 18%, rgba(255, 255, 255, 0.9), transparent),
			radial-gradient(circle 1.5px at 37% 64%, rgba(255, 255, 255, 0.75), transparent),
			radial-gradient(circle 1.5px at 68% 28%, rgba(255, 255, 255, 0.85), transparent),
			radial-gradient(circle 1.5px at 84% 76%, rgba(255, 255, 255, 0.7), transparent),
			radial-gradient(circle 1.5px at 52% 88%, rgba(255, 255, 255, 0.8), transparent),
			radial-gradient(circle 1.5px at 24% 44%, rgba(255, 255, 255, 0.65), transparent),
			radial-gradient(circle 1.5px at 92% 12%, rgba(255, 255, 255, 0.75), transparent),
			radial-gradient(circle 1.5px at 6% 82%, rgba(255, 255, 255, 0.7), transparent);
		background-size: 280px 280px;
		opacity: 0.5;
		animation: drift-stars-slow 150s linear infinite;
		animation-play-state: var(--motion-play);
	}
	.s2 {
		/* Preserve the initial tile phase while reserving room for rightward drift on narrow screens. */
		left: calc(-20% - 440px);
		width: calc(var(--field-width) + 40vw + 440px);
		background-position: 440px 0;
		--parallax-distance: -180px;
		background-image:
			radial-gradient(circle 2.7px at 22% 34%, rgba(255, 255, 255, 0.95), transparent),
			radial-gradient(circle 2.7px at 74% 14%, rgba(199, 220, 255, 0.9), transparent),
			radial-gradient(circle 2.7px at 46% 72%, rgba(255, 255, 255, 0.85), transparent),
			radial-gradient(circle 2.7px at 88% 58%, rgba(255, 236, 214, 0.85), transparent),
			radial-gradient(circle 2.7px at 14% 90%, rgba(255, 255, 255, 0.8), transparent),
			radial-gradient(circle 2.7px at 62% 42%, rgba(214, 232, 255, 0.9), transparent);
		background-size: 440px 440px;
		opacity: 0.75;
		animation: drift-stars-mid 110s linear infinite;
		animation-play-state: var(--motion-play);
	}
	.s3 {
		--parallax-distance: -560px;
		background-image:
			radial-gradient(circle 4.2px at 18% 26%, rgba(255, 255, 255, 1), transparent),
			radial-gradient(circle 3.6px at 64% 68%, rgba(196, 166, 255, 0.95), transparent),
			radial-gradient(circle 3.9px at 86% 22%, rgba(255, 236, 214, 0.95), transparent),
			radial-gradient(circle 3.3px at 34% 86%, rgba(125, 211, 252, 0.9), transparent);
		background-size: 680px 680px;
		opacity: 0.9;
		animation: twinkle 9s ease-in-out infinite alternate;
		animation-play-state: var(--motion-play);
	}

	/* Keeps long-form text on an even ground regardless of what the nebulae are doing. */
	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse 85% 70% at 50% 42%, transparent 40%, rgba(4, 5, 14, 0.72) 100%);
	}

	@keyframes drift-a {
		to {
			transform: translate3d(6vw, 4vh, 0) scale(1.12);
		}
	}
	@keyframes drift-b {
		to {
			transform: translate3d(-7vw, -5vh, 0) scale(1.16);
		}
	}
	@keyframes drift-c {
		to {
			transform: translate3d(5vw, -4vh, 0) scale(1.1);
		}
	}
	@keyframes drift-stars-slow {
		to {
			transform: translate3d(-280px, -140px, 0);
		}
	}
	@keyframes drift-stars-mid {
		to {
			transform: translate3d(440px, 220px, 0);
		}
	}
	@keyframes twinkle {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}

	/*
	 * Parallax animates the independent translate property because the ambient drift above
	 * already owns transform; the two then compose without wrapper elements.
	 *
	 * @supports is required, not defensive: a browser without scroll timelines ignores
	 * animation-timeline and would otherwise run these keyframes on a time basis.
	 */
	@supports (animation-timeline: scroll()) {
		.band {
			animation: parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: scroll(root block);
		}
		.n1 {
			animation:
				drift-a 64s ease-in-out infinite alternate,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.n2 {
			animation:
				drift-b 82s ease-in-out infinite alternate,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.n3 {
			animation:
				drift-c 96s ease-in-out infinite alternate,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s1 {
			animation:
				drift-stars-slow 150s linear infinite,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s2 {
			animation:
				drift-stars-mid 110s linear infinite,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
		.s3 {
			animation:
				twinkle 9s ease-in-out infinite alternate,
				parallax linear;
			animation-play-state: var(--motion-play);
			animation-timeline: auto, scroll(root block);
		}
	}

	@keyframes parallax {
		to {
			translate: 0 var(--parallax-distance, 0);
		}
	}
`;
