import { expect, test, type Page } from '@playwright/test';

/** Locates the visible face through the component's public host, without opening its shadow root. */
const orbitFace = async (page: Page) => {
	await page.locator('x-orbit-nav').scrollIntoViewIfNeeded();
	const box = await page.locator('x-orbit-nav').boundingBox();
	expect(box).not.toBeNull();
	if (box === null) throw new Error('Orbit nav is not visible');
	return { x: box.x + box.width / 2, y: box.y + box.height * 0.35, box };
};

const recordRequests = async (page: Page) => {
	await page.evaluate(() => {
		Reflect.set(window, 'orbitRequests', []);
		Reflect.set(window, 'orbitArrivals', []);
		const navigation = (window as unknown as { navigation: EventTarget }).navigation;
		navigation.addEventListener('navigatesuccess', () => {
			(Reflect.get(window, 'orbitArrivals') as string[]).push(location.pathname);
		});
		document.addEventListener('nav:request', (event) => {
			const requests = Reflect.get(window, 'orbitRequests') as string[];
			requests.push((event as CustomEvent<{ href: string }>).detail.href);
		});
	});
};

test('as a mouse visitor, I can explore by hovering and keep that position when I return to click', async ({
	page,
}) => {
	await page.goto('/about');
	const face = await orbitFace(page);
	await recordRequests(page);
	await page.mouse.move(face.x, face.y);
	await page.mouse.move(face.x + face.box.width * 0.4, face.y, { steps: 8 });
	await page.waitForTimeout(400);
	await page.mouse.move(face.x + face.box.width * 0.4, face.box.y - 10);
	expect(await page.evaluate(() => Reflect.get(window, 'orbitRequests'))).toEqual([]);
	await page.mouse.click(face.x, face.y);
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(1);
	await expect(page).toHaveURL(/\/contact\/?$/);
});

test('as a mouse visitor, I can reach the last destination in one hover pass within the frame', async ({ page }) => {
	await page.goto('/');
	const face = await orbitFace(page);
	await recordRequests(page);
	await page.mouse.move(face.x, face.y);
	await page.mouse.move(face.box.x + face.box.width * 0.9, face.y, { steps: 12 });
	await page.waitForTimeout(500);
	// Leave vertically after the single pass so clicking the front item cannot change its angle.
	await page.mouse.move(face.box.x + face.box.width * 0.9, face.box.y - 10);
	await page.mouse.click(face.x, face.y);
	await expect(page).toHaveURL(/\/contact\/?$/);
	expect(await page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(1);
});

test('as a mouse visitor, equal hover movements advance the same number of destinations', async ({ page }) => {
	for (const [start, destination] of [
		['/blog', '/work'],
		['/work', '/contact'],
	] as const) {
		await page.goto(start);
		const face = await orbitFace(page);
		await page.mouse.move(face.x, face.box.y - 10);
		await page.mouse.move(face.x, face.y);
		await page.mouse.move(face.x + face.box.width * 0.16, face.y, { steps: 12 });
		await page.waitForTimeout(500);
		await page.mouse.move(face.x + face.box.width * 0.16, face.box.y - 10);
		await page.mouse.click(face.x, face.y);
		await expect(page).toHaveURL(new RegExp(`${destination}/?$`));
	}
});

test('as a visitor, the orbit smoothly centers my destination through the page replacement', async ({ page }) => {
	await page.goto('/resume');
	await page.evaluate(() => {
		Reflect.set(window, 'centeringFrames', []);
		Reflect.set(window, 'departingOrbit', document.querySelector('x-orbit-nav'));
		document.addEventListener('orbit:rotation', (event) => {
			const detail = (event as CustomEvent<{ rotation: number; source: string }>).detail;
			if (detail.source !== 'navigation') return;
			(Reflect.get(window, 'centeringFrames') as { rotation: number; replaced: boolean }[]).push({
				rotation: detail.rotation,
				replaced: document.querySelector('x-orbit-nav') !== Reflect.get(window, 'departingOrbit'),
			});
		});
	});
	await page.route('**/work', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 100));
		await route.continue();
	});
	await page.locator('x-link[href="/work"]').click();
	await expect(page).toHaveURL(/\/work\/?$/);
	await expect(page.locator('x-project-list')).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--orbit-rotation')))
		.toBe('-18');
	const frames = await page.evaluate(
		() => Reflect.get(window, 'centeringFrames') as { rotation: number; replaced: boolean }[],
	);
	expect(frames.some((frame) => frame.rotation > -54 && frame.rotation < -18)).toBe(true);
	expect(frames.at(-1)?.rotation).toBe(-18);
	expect(
		await page.evaluate(() => document.querySelector('x-orbit-nav') !== Reflect.get(window, 'departingOrbit')),
	).toBe(true);
	await page.evaluate(async () => {
		const navigation = (window as unknown as { navigation: { transition: { finished: Promise<unknown> } | null } })
			.navigation;
		await navigation.transition?.finished;
	});
	await recordRequests(page);
	const face = await orbitFace(page);
	await page.mouse.click(face.x, face.y);
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(1);
	expect(
		await page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).map((href) => new URL(href).pathname)),
	).toEqual(['/work']);
});

test('as a visitor, my rapid presses on the orbit nav each navigate exactly once', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(220);
	const face = await orbitFace(page);
	await recordRequests(page);
	let releaseFetch: () => void = () => {};
	const heldFetch = new Promise<void>((resolve) => {
		releaseFetch = resolve;
	});
	await page.route('**/blog', async (route) => {
		await heldFetch;
		await route.continue();
	});
	for (let index = 0; index < 3; index++) {
		await page.mouse.move(face.x, face.y);
		await page.mouse.down();
		await page.mouse.up();
	}
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(3);
	releaseFetch();
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitArrivals') as string[]).length)).toBe(3);
	await expect(page).toHaveURL(/\/blog\/?$/);
	await expect(page.locator('x-content')).toContainText('Ideas with a playground.');
});

test('as a visitor, leaving a pressed nav item cancels it even if I return before releasing', async ({ page }) => {
	await page.goto('/about');
	const face = await orbitFace(page);
	await recordRequests(page);
	await page.mouse.move(face.x, face.y);
	await page.mouse.down();
	await page.mouse.move(face.x, face.box.y - 10);
	await page.mouse.move(face.x, face.y);
	await page.mouse.up();
	expect(await page.evaluate(() => Reflect.get(window, 'orbitRequests'))).toEqual([]);
	await expect(page).toHaveURL(/\/about\/?$/);
});

test('as a visitor, pressing outside the orbit item and releasing inside does not navigate', async ({ page }) => {
	await page.goto('/about');
	const face = await orbitFace(page);
	await recordRequests(page);
	await page.mouse.move(face.x, face.box.y - 10);
	await page.mouse.down();
	await page.mouse.move(face.x, face.y);
	await page.mouse.up();
	expect(await page.evaluate(() => Reflect.get(window, 'orbitRequests'))).toEqual([]);
	await expect(page).toHaveURL(/\/about\/?$/);
});

test('as a visitor, I can drag the orbit in stages and keep its position after leaving it', async ({ page }) => {
	await page.goto('/about');
	const face = await orbitFace(page);
	const nav = page.locator('x-orbit-nav');
	await recordRequests(page);
	for (let index = 0; index < 2; index++) {
		await page.mouse.move(face.x, face.y);
		await page.mouse.down();
		await page.mouse.move(face.x - face.box.width * 0.12, face.y, { steps: 8 });
		await page.mouse.up();
	}
	await page.mouse.move(face.x, face.box.y - 10);
	expect(await page.evaluate(() => Reflect.get(window, 'orbitRequests'))).toEqual([]);
	await expect(page).toHaveURL(/\/about\/?$/);
	await expect(nav).toBeVisible();
	// The new front item must stay reachable after multiple releases and a mouseleave.
	await page.mouse.click(face.x, face.y);
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(1);
	await expect(page).toHaveURL(/\/work\/?$/);
});

test('as a touch visitor, I can drag repeatedly and tap the item left in front', async ({
	page,
	context,
}, testInfo) => {
	test.skip(testInfo.project.name !== 'mobile', 'Requires a touch viewport');
	await page.goto('/about');
	const face = await orbitFace(page);
	await recordRequests(page);
	const cdp = await context.newCDPSession(page);
	for (let index = 0; index < 2; index++) {
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: face.x, y: face.y }] });
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x: face.x - face.box.width * 0.1, y: face.y }],
		});
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	}
	expect(await page.evaluate(() => Reflect.get(window, 'orbitRequests'))).toEqual([]);
	await page.touchscreen.tap(face.x, face.y);
	await expect.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).length)).toBe(1);
	await expect(page).toHaveURL(/\/work\/?$/);
});

test('as a reader, nested content only animates when its markup opts into transitions', async ({ page }) => {
	await page.goto('/resume');
	await expect(page.locator('x-content[view-transition-name="content"]')).toHaveCSS(
		'view-transition-name',
		'page-content',
	);
	await expect(page.locator('x-content[view-transition-name="supplement"]')).toHaveCSS(
		'view-transition-name',
		'page-supplement',
	);
	await page.locator('x-content[view-transition-name="content"]').evaluate((element) => {
		element.append(document.createElement('x-content'));
	});
	await expect(page.locator('x-content x-content')).toHaveCSS('view-transition-name', 'none');
	await expect(page.locator('x-content x-content')).toHaveCSS('animation-name', 'none');
});

test('as a visitor, choosing another destination while the first is loading reaches my last choice', async ({
	page,
}) => {
	await page.goto('/');
	await recordRequests(page);
	let releaseFetch: () => void = () => {};
	const heldFetch = new Promise<void>((resolve) => {
		releaseFetch = resolve;
	});
	await page.route('**/blog', async (route) => {
		await heldFetch;
		await route.continue();
	});
	const warnings: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'warning') warnings.push(message.text());
	});
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');
	const face = await orbitFace(page);
	await page.keyboard.press('ArrowRight');
	await page.waitForTimeout(220);
	await page.mouse.click(face.x, face.y);
	for (let index = 0; index < 2; index++) {
		await page.mouse.move(face.x, face.y);
		await page.mouse.down();
		await page.mouse.move(face.x - face.box.width * 0.2, face.y, { steps: 8 });
		await page.mouse.up();
		await page.mouse.click(face.x, face.y);
	}
	expect(
		await page.evaluate(() => (Reflect.get(window, 'orbitRequests') as string[]).map((href) => new URL(href).pathname)),
	).toEqual(['/blog', '/about', '/work']);
	releaseFetch();
	await expect
		.poll(() => page.evaluate(() => (Reflect.get(window, 'orbitArrivals') as string[]).length), { timeout: 15_000 })
		.toBe(3);
	await expect(page).toHaveURL(/\/work\/?$/);
	await expect(page.locator('x-project-list')).toBeVisible();
	expect(warnings.filter((message) => message.includes('Replacing the entire document'))).toEqual([]);
});
