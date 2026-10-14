import { expect, test } from '@playwright/test';
import { routeIndex } from '../../src/routes.ts';

test('as a visitor, I can open every main destination directly and read its content', async ({ page }) => {
	for (const [path, text] of [
		['/', "Hi, I'm Jon!"],
		['/about', 'Nice to meet you!'],
		['/work', 'My Work'],
		['/resume', 'The short version'],
		['/blog', 'Ideas with a playground'],
		['/contact', 'Want to talk about developer tools'],
	] as const) {
		await page.goto(path);
		await expect(page.locator('x-page')).toContainText(text);
		await expect(page.locator('html')).toHaveCSS('--voyage', String(routeIndex(path)));
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
	await expect(page.locator('html')).toHaveCSS('--voyage', '0');
	expect(await page.evaluate(() => document.querySelector('x-cosmos') === Reflect.get(window, 'originalCosmos'))).toBe(
		true,
	);
	await page.goBack();
	await expect(page).toHaveURL(/\/about\/?$/);
	await expect(page.locator('html')).toHaveCSS('--voyage', String(routeIndex('/about')));
	await expect(page.locator('html')).toHaveAttribute('data-nav-direction', 'forward');
	expect(await page.evaluate(() => document.querySelector('x-cosmos') === Reflect.get(window, 'originalCosmos'))).toBe(
		true,
	);
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
	await expect(page.locator('html')).toHaveCSS('--voyage', String(routeIndex('/work')));
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
	await expect(page.locator('html')).toHaveCSS('--voyage', String(routeIndex('/blog')));
	await expect(page.locator('x-content')).toContainText('Ideas with a playground.');
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
});
