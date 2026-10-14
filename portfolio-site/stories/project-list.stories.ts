import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, within } from 'storybook/test';
import { ProjectList, ProjectItem } from '../src/components/project-list';

ProjectList.define('x-project-list');
ProjectItem.define('x-project-item');

const meta = {
	title: 'Components/External article cards',
	args: { containerWidth: 800 },
	render: ({ containerWidth }) => html`
		<div style="width: ${containerWidth}px; max-width: 100%">
			<x-project-list>
				<x-project-item href="#article" actiontext="Read article">
					<span slot="title">SCAAR: Software Design Principles for CSS</span>
					Principles for writing CSS that's easier to change and maintain.
				</x-project-item>
			</x-project-list>
		</div>
	`,
} satisfies Meta<{ containerWidth: number }>;

export default meta;
type Story = StoryObj<{ containerWidth: number }>;

export const ArticleWithoutThumbnail: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const title = canvas.getByText('SCAAR: Software Design Principles for CSS');
		await expect(title).toBeVisible();
		await expect(canvas.getByText("Principles for writing CSS that's easier to change and maintain.")).toBeVisible();
	},
};

export const ArticleOnNarrowScreens: Story = {
	args: { containerWidth: 280 },
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('x-project-item');
		await expect(card).not.toBeNull();
		if (card === null) return;
		const title = within(canvasElement).getByText('SCAAR: Software Design Principles for CSS');
		await expect(title).toBeVisible();
		await expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(280);
		await expect(title.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
	},
};
