import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Once } from '../once';

class TestErrorEvent extends Event {
  error: unknown;

  constructor(error: unknown) {
    super('error');
    this.error = error;
  }
}

test('once resolves with event data', async () => {
  const target = new EventTarget();
  const promise = new Once<Event>(target, 'ready').listen();
  target.dispatchEvent(new Event('ready'));

  const event = await promise;
  assert.equal(event.type, 'ready');
});

test('once rejects on error event', async () => {
  const target = new EventTarget();
  const error = new Error('fail');
  const promise = new Once<Event>(target, 'ready').listen();
  target.dispatchEvent(new TestErrorEvent(error));

  await assert.rejects(promise, error);
});

test('once rejects on abort with abort reason', async () => {
  const target = new EventTarget();
  const controller = new AbortController();
  const error = new Error('stop');
  const promise = new Once<Event>(target, 'ready', { signal: controller.signal }).listen();

  controller.abort(error);

  await assert.rejects(promise, error);
});
