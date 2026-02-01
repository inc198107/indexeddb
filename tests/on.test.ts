import assert from 'node:assert/strict';
import { test } from 'node:test';
import { On } from '../on';

class TestErrorEvent extends Event {
  error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}

test('on yields events in order', async () => {
  const target = new EventTarget();
  const iterator = new On<Event>(target, 'data');

  const nextOne = iterator.next();
  target.dispatchEvent(new Event('data'));
  const resultOne = await nextOne;

  assert.equal(resultOne.done, false);
  assert.equal(resultOne.value.type, 'data');

  await iterator.return();
});

test('on rejects pending next on error event', async () => {
  const target = new EventTarget();
  const iterator = new On<Event>(target, 'data');
  const error = new Error('boom');

  const pending = iterator.next();
  target.dispatchEvent(new TestErrorEvent(error));

  await assert.rejects(pending, error);
});

test('on rejects pending next on abort', async () => {
  const target = new EventTarget();
  const controller = new AbortController();
  const iterator = new On<Event>(target, 'data', { signal: controller.signal });
  const error = new Error('stop');

  const pending = iterator.next();
  controller.abort(error);

  await assert.rejects(pending, error);
});
