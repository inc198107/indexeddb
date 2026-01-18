import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adoptRequest } from '../adoptRequest';

class MockRequest<T> extends EventTarget {
  result!: T;

  error: unknown = null;
}

test('adoptRequest resolves on success with request.result', async () => {
  const request = new MockRequest<number>();
  const promise = adoptRequest<number>(request as IDBRequest<number>);
  request.result = 42;
  request.dispatchEvent(new Event('success'));

  const result = await promise;
  assert.equal(result, 42);
});

test('adoptRequest rejects on error with request.error', async () => {
  const request = new MockRequest<number>();
  const error = new Error('boom');
  request.error = error;

  const promise = adoptRequest<number>(request as IDBRequest<number>);
  request.dispatchEvent(new Event('error'));

  await assert.rejects(promise, error);
});
