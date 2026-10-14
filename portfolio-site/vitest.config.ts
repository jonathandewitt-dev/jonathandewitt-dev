import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

export default defineConfig({
	plugins: [storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) })],
	test: {
		name: 'components',
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({
				launchOptions:
					process.env['PLAYWRIGHT_CHANNEL'] === undefined ? {} : { channel: process.env['PLAYWRIGHT_CHANNEL'] },
			}),
			instances: [{ browser: 'chromium' }],
		},
	},
});
