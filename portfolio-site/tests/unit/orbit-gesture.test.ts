import assert from 'node:assert/strict';
import { test } from 'node:test';
import { moveOrbitGesture, finishOrbitGesture, type OrbitGesture } from '../../src/orbit-gesture.ts';

const press: OrbitGesture = {
	origin: 1,
	startX: 100,
	startY: 50,
	startRotation: 0,
	rotation: 0,
	cancelled: false,
	dragging: false,
};

for (const [name, gesture, item, expected] of [
	['matching press/release', press, 1, 1],
	['release over another item', press, 2, null],
	['release outside', press, null, null],
	['press outside then release over an item', { ...press, origin: null }, 1, null],
	['leave then return', { ...press, cancelled: true }, 1, null],
	['drag then release over the origin', { ...press, dragging: true }, 1, null],
] as const) {
	test(`orbit activation: ${name}`, () => assert.equal(finishOrbitGesture(gesture, item), expected));
}

for (const [name, x, y, item, rotation, cancelled, dragging] of [
	['stationary', 100, 50, 1, 0, false, false],
	['small movement', 102, 51, 1, 0, false, false],
	['horizontal drag', 150, 50, 1, 45, true, true],
	['reverse drag', 50, 50, 1, -45, true, true],
	['vertical drag', 100, 70, 1, 0, true, true],
	['positive limit', 500, 50, null, 90, true, true],
	['negative limit', -500, 50, null, -90, true, true],
	['leave without a drag', 101, 50, null, 0, true, false],
] as const) {
	test(`orbit movement: ${name}`, () => {
		const moved = moveOrbitGesture(press, { x, y, item, width: 200, limit: 90 });
		assert.equal(moved.rotation, rotation);
		assert.equal(moved.cancelled, cancelled);
		assert.equal(moved.dragging, dragging);
		assert.equal(press.rotation, 0);
	});
}

test('orbit drag continues from the previous gesture rotation', () => {
	const moved = moveOrbitGesture(
		{ ...press, startRotation: 45, rotation: 45 },
		{ x: 50, y: 50, item: null, width: 200, limit: 90 },
	);
	assert.equal(moved.rotation, 0);
});

test('orbit cancellation stays latched after re-entry', () => {
	const moved = moveOrbitGesture({ ...press, cancelled: true }, { x: 100, y: 50, item: 1, width: 200, limit: 90 });
	assert.equal(moved.cancelled, true);
});

test('orbit dragging stays latched after returning to the start', () => {
	const moved = moveOrbitGesture({ ...press, dragging: true }, { x: 100, y: 50, item: 1, width: 200, limit: 90 });
	assert.equal(moved.dragging, true);
});

test('orbit movement tolerates a hidden stage and a single destination', () => {
	assert.equal(moveOrbitGesture(press, { x: 150, y: 50, item: 1, width: 0, limit: 90 }).rotation, 0);
	assert.equal(moveOrbitGesture(press, { x: 150, y: 50, item: 1, width: 200, limit: 0 }).rotation, 0);
});
