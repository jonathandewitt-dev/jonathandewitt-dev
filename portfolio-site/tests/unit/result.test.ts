import assert from 'node:assert/strict';
import { test } from 'node:test';
import { asyncSafeTry, safeTry } from '../../src/result.ts';

test('safeTry preserves successful values, including undefined', () => {
	assert.deepEqual(
		safeTry(() => 42),
		{ ok: true, value: 42 },
	);
	assert.deepEqual(
		safeTry(() => undefined),
		{ ok: true, value: undefined },
	);
});

test('safeTry preserves thrown values without requiring an Error instance', () => {
	for (const error of [new Error('failed'), 'failure', null, undefined]) {
		const result = safeTry(() => {
			throw error;
		});
		assert.equal(result.ok, false);
		if (result.ok === false) assert.equal(result.error, error);
	}
});

test('asyncSafeTry accepts immediate and asynchronous values', async () => {
	assert.deepEqual(await asyncSafeTry(() => 42), { ok: true, value: 42 });
	assert.deepEqual(await asyncSafeTry(() => Promise.resolve(undefined)), { ok: true, value: undefined });
});

test('asyncSafeTry captures synchronous throws and rejected promises', async () => {
	const error = new Error('failed');
	assert.deepEqual(
		await asyncSafeTry(() => {
			throw error;
		}),
		{ ok: false, error },
	);
	assert.deepEqual(await asyncSafeTry(() => Promise.reject(error)), { ok: false, error });
});
