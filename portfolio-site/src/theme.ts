import { css } from 'thunderous';

/*
 * Dark-only by design: the identity depends on luminous colour over a near-black ground, which
 * a light palette cannot reproduce. `color-scheme: dark` is set in global.css to match.
 */
export const theme = css`
	:host {
		--color-page-1: #06071a;
		--color-page-1-1: #080a22;
		--color-page-1-2: #04050e;
		--color-page-1-c: #e9edff;

		--color-accent-1: rgba(124, 58, 237, 0.2);
		--color-accent-1-1: rgba(34, 211, 238, 0.14);

		--color-surface-1: rgba(148, 163, 255, 0.07);
		--color-surface-1-1: rgba(148, 163, 255, 0.04);
		--color-surface-1-2: rgba(168, 180, 255, 0.16);
		--color-neutral-1: #f3f6ff;
		--color-neutral-1-1: #a7b2d8;
		--color-brand-1: #9db4ff;
		--color-brand-1-1: #c4a6ff;
		--shadow-1: 0 18px 50px rgba(2, 4, 16, 0.55);

		--color-surface-2: rgba(148, 163, 255, 0.12);
		--color-surface-2-1: rgba(124, 58, 237, 0.1);
		--color-surface-2-2: rgba(168, 180, 255, 0.22);
		--color-neutral-2: #eef1ff;
		--color-neutral-2-1: #a7b2d8;
		--color-brand-2: #7dd3fc;
		--color-brand-2-1: #c4b5fd;
		--shadow-2: 0 24px 70px rgba(2, 4, 16, 0.6);

		--nebula-violet: #7c3aed;
		--nebula-magenta: #e0409a;
		--nebula-cyan: #22d3ee;
		--nebula-indigo: #4338ca;
	}
`;
