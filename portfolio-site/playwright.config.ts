import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: process.env['CI'] !== undefined,
	retries: process.env['CI'] === undefined ? 0 : 2,
	reporter: [['list'], ['json', { outputFile: '.test-results/e2e.json' }]],
	outputDir: '.test-results/playwright',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		...(process.env['PLAYWRIGHT_CHANNEL'] === undefined ? {} : { channel: process.env['PLAYWRIGHT_CHANNEL'] }),
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true } },
	],
	webServer: {
		command: 'pnpm build && pnpm exec serve dist --listen tcp://127.0.0.1:4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: false,
		timeout: 60_000,
	},
});
