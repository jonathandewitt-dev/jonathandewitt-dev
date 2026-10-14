import assert from 'node:assert/strict';
import { test } from 'node:test';
import { routeIndex, routes } from '../../src/routes.ts';

for (const [index, route] of routes.entries()) {
	test(`routeIndex places ${route.href} at navigation coordinate ${index}`, () => {
		assert.equal(routeIndex(route.href), index);
	});
	test(`routeIndex normalizes a trailing slash for ${route.href}`, () => {
		assert.equal(routeIndex(route.href === '/' ? '/' : `${route.href}/`), index);
	});
}

test('routeIndex uses the home coordinate for an empty pathname', () => {
	assert.equal(routeIndex(''), 0);
});

test('routeIndex marks unlisted paths as unknown', () => {
	assert.equal(routeIndex('/missing'), -1);
	assert.equal(routeIndex('/about/nested'), -1);
});
