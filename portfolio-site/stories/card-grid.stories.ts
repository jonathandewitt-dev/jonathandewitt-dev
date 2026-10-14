import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, userEvent, within } from 'storybook/test';
import { Card, CardGrid } from '../src/components/card-grid';

Card.define('x-card');
CardGrid.define('x-card-grid');

const meta = {
	title: 'Components/Project cards',
	args: { containerWidth: 800 },
	render: ({ containerWidth }) => html`
		<div style="width: ${containerWidth}px; max-width: 100%">
			<x-card-grid>
				<x-card>
					<h2 slot="heading">Thunderous</h2>
					<p>Functional web components.</p>
					<button type="button">View project details</button>
				</x-card>
				<x-card
					><h2 slot="heading">Collab Hour</h2>
					<p>Agile collaboration.</p></x-card
				>
			</x-card-grid>
		</div>
	`,
} satisfies Meta<{ containerWidth: number }>;

export default meta;
type Story = StoryObj<{ containerWidth: number }>;

export const ProjectDetails: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const heading = canvas.getByRole('heading', { name: 'Thunderous' });
		const description = canvas.getByText('Functional web components.');
		await expect(heading).toBeVisible();
		await expect(description).toBeVisible();
		await expect(heading.getBoundingClientRect().bottom).toBeLessThanOrEqual(description.getBoundingClientRect().top);
		const button = canvas.getByRole('button', { name: 'View project details' });
		await userEvent.click(button);
		await expect(button).toHaveFocus();
	},
};

export const NarrowContainer: Story = {
	args: { containerWidth: 280 },
	play: async ({ canvasElement }) => {
		const cards = canvasElement.querySelectorAll('x-card');
		const first = cards[0]?.getBoundingClientRect();
		const second = cards[1]?.getBoundingClientRect();
		await expect(first).toBeDefined();
		await expect(second).toBeDefined();
		if (first === undefined || second === undefined) return;
		await expect(second.top).toBeGreaterThanOrEqual(first.bottom);
		await expect(first.width).toBeLessThanOrEqual(280);
		await expect(second.left).toBe(first.left);
	},
};
