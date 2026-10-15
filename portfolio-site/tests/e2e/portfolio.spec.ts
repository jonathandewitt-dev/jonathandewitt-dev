import { expect, test, type Page } from '@playwright/test';
import { routeIndex } from '../../src/routes.ts';

const readVoyage = (page: Page) =>
	page.evaluate(async () => {
		const path = '/nav-direction.js';
		const state = (await import(path)) as { voyage: () => number };
		return state.voyage();
	});

test('as a mobile visitor, I can read the subtitle below the motion control and change my motion preference', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	for (const width of [320, 432]) {
		await page.setViewportSize({ width, height: 812 });
		await page.goto('/');
		const heading = await page.locator('x-page-heading').boundingBox();
		if (heading === null) throw new Error('Page heading is missing');
		expect(heading.y).toBeGreaterThanOrEqual(48);
		await expect(page.locator('x-page-heading [slot="subtitle"]')).toBeVisible();
	}
	await page.keyboard.press('Tab');
	await page.keyboard.press('Space');
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
});

test('as a desktop visitor, I receive a thumbnail prepared at the card’s displayed size', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	const thumbnail = page.waitForResponse((response) => response.url().includes('/stormy-cms-card-192.webp'));
	await page.goto('/work');
	await page.locator('x-project-item').filter({ hasText: 'Stormy CMS' }).scrollIntoViewIfNeeded();
	expect((await thumbnail).ok()).toBe(true);
});

test('as a hiring reviewer, I can load lightweight project thumbnails while keeping the nebula across navigation', async ({
	page,
}) => {
	const imageRequests: string[] = [];
	const failedImages: string[] = [];
	page.on('response', (response) => {
		if (response.request().resourceType() !== 'image') return;
		imageRequests.push(new URL(response.url()).pathname);
		if (response.status() >= 400) failedImages.push(response.url());
	});
	await page.goto('/resume');
	await page.locator('x-link[href="/work"]').click();
	await expect(page).toHaveURL(/\/work\/?$/);
	for (const card of await page.locator('x-project-item').all()) await card.scrollIntoViewIfNeeded();
	await expect.poll(() => new Set(imageRequests.filter((path) => path.startsWith('/assets/projects/'))).size).toBe(5);
	expect(imageRequests.filter((path) => path.includes('orion-nebula'))).toHaveLength(1);
	expect(imageRequests.every((path) => path.endsWith('.webp'))).toBe(true);
	expect(failedImages).toEqual([]);
});

const focusMainNavigation = async (page: Page) => {
	for (let index = 0; index < 16; index++) {
		await page.keyboard.press('Tab');
		if (await page.evaluate(() => document.activeElement === document.querySelector('x-orbit-nav'))) return;
	}
	throw new Error('Main navigation is not keyboard reachable');
};

test('as a visitor, I can open every main destination directly and read its content', async ({ page }) => {
	for (const [path, text] of [
		['/', "Hi, I'm Jon!"],
		['/about', 'Nice to meet you!'],
		['/work', 'My Work'],
		['/resume', 'The short version'],
		['/blog', 'Ideas with a playground'],
		['/contact', 'Want to talk about developer tools'],
	] as const) {
		const response = await page.goto(path);
		await expect(page.locator('x-page')).toContainText(text);
		await expect(page.locator('html')).not.toHaveAttribute('style');
		if (response === null) throw new Error('Direct page response is missing');
		expect(await response.text()).not.toContain('calc(NaN');
		await expect.poll(() => readVoyage(page)).toBe(routeIndex(path));
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	}
});

test('as a motion-sensitive visitor, I can choose reduced motion with the keyboard and retain it after reloading', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Space');
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
	expect(
		await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--motion').trim()),
	).toBe('0');
});

test('as a visitor, I can follow a breadcrumb home and go back while keeping my place in space', async ({ page }) => {
	await page.goto('/about');
	await page.evaluate(() => {
		Reflect.set(window, 'originalCosmos', document.querySelector('x-cosmos'));
	});
	await page.locator('x-crumb').filter({ hasText: 'Jonathan DeWitt' }).click();
	await expect(page).toHaveURL(/\/$/);
	await expect.poll(() => readVoyage(page)).toBe(0);
	expect(await page.evaluate(() => document.querySelector('x-cosmos') === Reflect.get(window, 'originalCosmos'))).toBe(
		true,
	);
	await page.goBack();
	await expect(page).toHaveURL(/\/about\/?$/);
	await expect.poll(() => readVoyage(page)).toBe(routeIndex('/about'));
	await expect(page.locator('html')).toHaveAttribute('data-nav-direction', 'forward');
	expect(await page.evaluate(() => document.querySelector('x-cosmos') === Reflect.get(window, 'originalCosmos'))).toBe(
		true,
	);
});

test('as a motion-sensitive visitor, I can open the hamburger, dismiss it, and navigate with the keyboard', async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/about');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Space');
	const nav = page.locator('x-orbit-nav');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await focusMainNavigation(page);
	await page.keyboard.press('Enter');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(300);
	await page.keyboard.press('Tab');
	await page.keyboard.press('Escape');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await page.keyboard.press('Space');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(300);
	for (let index = 0; index <= routeIndex('/blog'); index++) await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/blog\/?$/);
	await expect(page.locator('x-content[view-transition-name="content"]')).toContainText('Ideas with a playground.');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
});

test('as a visitor, changing my system motion preference restores the orbit without losing keyboard access', async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/work');
	const nav = page.locator('x-orbit-nav');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await page.keyboard.press('Tab');
	await focusMainNavigation(page);
	await page.keyboard.press('Enter');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(300);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(150);
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(300);
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/resume\/?$/);
});

test('as a motion-sensitive visitor, resizing expands the desktop nav and preserves usable keyboard focus', async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 767, height: 812 });
	await page.goto('/work');
	const nav = page.locator('x-orbit-nav');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await focusMainNavigation(page);
	await page.keyboard.press('Enter');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(300);
	await page.keyboard.press('Tab');
	await page.setViewportSize({ width: 768, height: 812 });
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(60);
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await page.setViewportSize({ width: 767, height: 812 });
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await page.keyboard.press('Space');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(300);
	await page.setViewportSize({ width: 768, height: 812 });
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(60);
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
	await page.keyboard.press('Escape');
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/resume\/?$/);
	await expect(page.locator('x-content[view-transition-name="content"]')).toContainText('The short version');
	await expect.poll(async () => (await nav.boundingBox())?.height ?? 0).toBeGreaterThan(60);
	await expect.poll(async () => (await nav.boundingBox())?.height ?? Infinity).toBeLessThan(80);
});

test('as a hiring reviewer, I can find the portfolio from the résumé page', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto('/resume');
	await page.evaluate(() => {
		document.addEventListener('view:transition-ready', () => {
			const deadline = performance.now() + 1500;
			const recordAnimations = () => {
				const names = document
					.getAnimations()
					.filter((animation): animation is CSSAnimation => animation instanceof CSSAnimation)
					.map((animation) => animation.animationName);
				Reflect.set(window, 'resumeTransitionAnimations', names);
				if (names.includes('orbit-out') || names.includes('orbit-in')) return;
				// Snapshot effects may be registered a frame after Navigation API success.
				if (performance.now() < deadline) requestAnimationFrame(recordAnimations);
			};
			recordAnimations();
		});
	});
	await expect(page.locator('x-blockquote')).toContainText('home address and phone number');
	await expect(page.locator('x-blockquote x-link[href="mailto:jon@jonathandewitt.dev"]')).toContainText('emailing me');
	await page.locator('x-link[href="/work"]').click();
	await expect(page).toHaveURL(/\/work\/?$/);
	await expect.poll(() => readVoyage(page)).toBe(routeIndex('/work'));
	await expect(page.locator('x-project-list')).toBeVisible();
	await expect
		.poll(() => page.evaluate(() => Reflect.get(window, 'resumeTransitionAnimations')))
		.toContain('orbit-out');
	await page.evaluate(() => Reflect.deleteProperty(window, 'resumeTransitionAnimations'));
	await page.goBack();
	await expect(page).toHaveURL(/\/resume\/?$/);
	await expect.poll(() => page.evaluate(() => Reflect.get(window, 'resumeTransitionAnimations'))).toContain('orbit-in');
});

test('as a reader, I can reach the blog from the main navigation using the keyboard', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await page.keyboard.press('Tab');

	for (let index = 0; index < routeIndex('/blog'); index++) await page.keyboard.press('Tab');
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/blog\/?$/);
	await expect.poll(() => readVoyage(page)).toBe(routeIndex('/blog'));
	await expect(page.locator('x-content[view-transition-name="content"]')).toContainText('Ideas with a playground.');
});

test('as a hiring reviewer, I can access the public résumé PDF', async ({ page, request }) => {
	await page.goto('/resume');
	const pdfPath = '/assets/Jonathan_Dewitt_Resume_Public.pdf';
	await expect(page.locator('x-feature')).toHaveAttribute('href', pdfPath);
	await expect(page.locator('x-feature')).not.toHaveAttribute('pending');
	const response = await request.get(pdfPath);
	expect(response.ok()).toBe(true);
	expect(response.headers()['content-type']).toContain('application/pdf');
	expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
	for (let index = 0; index < 16; index++) {
		await page.keyboard.press('Tab');
		if (await page.evaluate(() => document.activeElement === document.querySelector('x-feature'))) break;
	}
	expect(await page.evaluate(() => document.activeElement === document.querySelector('x-feature'))).toBe(true);
	const nativeRequest = page.waitForRequest(
		(request) => new URL(request.url()).pathname === pdfPath && request.resourceType() === 'document',
	);
	await page.keyboard.press('Enter');
	await nativeRequest;
});

test('as a reader, I can discover external articles below the blog introduction and follow one to its publisher', async ({
	page,
	request,
}) => {
	const response = await request.get('/blog');
	const markup = await response.text();
	expect(markup).not.toContain('{{callback:');
	expect(markup).not.toContain('{{signal:');
	await page.goto('/blog');
	await expect(page.locator('x-content[view-transition-name="content"]')).toContainText('Ideas with a playground.');
	await expect(page.locator('x-feature[pending]')).toContainText('Still setting the stage.');
	const articles = page.locator('x-content[view-transition-name="supplement"]');
	await expect(articles.getByRole('heading', { name: 'External articles' })).toBeVisible();
	await expect(articles.locator('x-project-item')).toHaveCount(8);
	await expect(articles.locator('x-project-item[actiontext="Read on LinkedIn"]')).toHaveCount(2);
	await expect(articles.locator('x-project-item[actiontext="Read on Medium"]')).toHaveCount(6);
	await expect(articles).toContainText('Agile Sucks!');
	await expect(articles).toContainText('Mastering Presentation Components');
	const article = articles.locator('x-project-item').filter({ hasText: 'Software Estimates Are Hurting You' });
	const href = await article.getAttribute('href');
	if (href === null) throw new Error('External article has no publisher URL');
	await page.route(href, (route) => route.fulfill({ contentType: 'text/html', body: '<title>Publisher</title>' }));
	const outgoing = page.waitForRequest((request) => request.url() === href && request.resourceType() === 'document');
	await article.click();
	await outgoing;
	await expect(page).toHaveURL(href);
});
