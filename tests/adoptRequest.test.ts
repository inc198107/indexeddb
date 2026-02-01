import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AdoptRequest } from '../adoptRequest';

class MockRequest<T> extends EventTarget {
  result!: T;

  error: unknown = null;
}

test('adoptRequest resolves on success with request.result', async () => {
  const request = new MockRequest<number>();
  const promise = new AdoptRequest<number>(request as IDBRequest<number>).toPromise();
  request.result = 42;
  request.dispatchEvent(new Event('success'));

  const result = await promise;
  assert.equal(result, 42);
});

test('adoptRequest rejects on error with request.error', async () => {
  const request = new MockRequest<number>();
  const error = new Error('boom');
  request.error = error;

  const promise = new AdoptRequest<number>(request as IDBRequest<number>).toPromise();
  request.dispatchEvent(new Event('error'));

  await assert.rejects(promise, error);
});
