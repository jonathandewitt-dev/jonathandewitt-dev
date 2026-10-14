import { expect, test } from '@playwright/test';

test('as a visitor, I can open every main destination directly and read its content', async ({ page }) => {
	for (const [path, coordinate, text] of [
		['/', '0', "Hi, I'm Jon!"],
		['/about', '1', 'Nice to meet you!'],
		['/work', '2', 'My Work'],
		['/contact', '3', 'Want to talk about developer tools'],
	] as const) {
		await page.goto(path);
		await expect(page.locator('x-page')).toContainText(text);
		await expect(page.locator('html')).toHaveAttribute('style', `--voyage: ${coordinate}`);
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
	await expect(page.locator('html')).toHaveCSS('--voyage', '1');
	await expect(page.locator('html')).toHaveAttribute('data-nav-direction', 'forward');
	expect(await page.evaluate(() => document.querySelector('x-cosmos') === Reflect.get(window, 'originalCosmos'))).toBe(
		true,
	);
});
