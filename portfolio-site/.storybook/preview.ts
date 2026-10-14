import type { Preview } from '@storybook/web-components-vite';
import { html } from 'lit';
import { customElement, html as componentHTML, css } from 'thunderous';
import { theme } from '../src/theme';
import '../src/global.css';

customElement(({ adoptStyleSheet }) => {
	adoptStyleSheet(theme);
	adoptStyleSheet(css`
		:host {
			display: block;
			color: var(--color-page-1-c);
			font-family: var(--font-body);
		}
	`);
	return componentHTML`<slot></slot>`;
}).define('x-story-theme');

const preview: Preview = {
	decorators: [(story) => html`<x-story-theme>${story()}</x-story-theme>`],
};

export default preview;
