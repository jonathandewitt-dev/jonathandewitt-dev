/** Coalesces visual work into one pending frame, with a ceiling of about 60 updates per second. */
export const createFrameScheduler = (render: (time: number) => void) => {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let frame = 0;
	let lastFrame = -Infinity;
	const request = () => {
		if (timer !== null || frame !== 0) return;
		timer = setTimeout(
			() => {
				timer = null;
				frame = requestAnimationFrame((time) => {
					frame = 0;
					lastFrame = time;
					render(time);
				});
			},
			Math.max(0, lastFrame + 1000 / 60 - performance.now()),
		);
	};
	const cancel = () => {
		if (timer !== null) clearTimeout(timer);
		cancelAnimationFrame(frame);
		timer = null;
		frame = 0;
	};
	return { request, cancel };
};
