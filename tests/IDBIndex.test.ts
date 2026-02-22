import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IndexAdapter } from '../IDBIndex';

function createRequest<T>(result: T): IDBRequest<T> {
  const req = new EventTarget() as IDBRequest<T>;
  (req as { result: T }).result = result;
  (req as { error: unknown }).error = null;
  setTimeout(() => req.dispatchEvent(new Event('success')), 0);
  return req;
}

class MockIDBIndex implements IDBIndex {
  name = 'testIndex';

  objectStore = {} as IDBObjectStore;

  keyPath: string | string[] = 'id';

  multiEntry = false;

  unique = false;

  get(_key: IDBValidKey | IDBKeyRange): IDBRequest<unknown> {
    return createRequest<unknown>({ id: 1, name: 'a' });
  }

  getAll(
    _query?: IDBValidKey | IDBKeyRange,
    _count?: number,
  ): IDBRequest<unknown[]> {
    return createRequest<unknown[]>([{ id: 1 }, { id: 2 }]);
  }

  getAllKeys(
    _query?: IDBValidKey | IDBKeyRange,
    _count?: number,
  ): IDBRequest<IDBValidKey[]> {
    return createRequest<IDBValidKey[]>([1, 2, 3]);
  }

  getKey(_query?: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    return createRequest<IDBValidKey | undefined>(1);
  }

  count(_query?: IDBValidKey | IDBKeyRange): IDBRequest<number> {
    return createRequest(42);
  }

  private cursorCalls = 0;

  openCursor(
    _range?: IDBValidKey | IDBKeyRange,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursorWithValue | null> {
    const self = this;
    const req = new EventTarget() as IDBRequest<IDBCursorWithValue | null>;
    const cursor: IDBCursorWithValue = {
      source: this,
      direction: 'next',
      key: 1,
      primaryKey: 1,
      value: { id: 1 },
      request: req,
      advance: () => (null as unknown) as IDBRequest<IDBCursorWithValue | null>,
      continue: () => {
        self.cursorCalls += 1;
        const nextReq = new EventTarget() as IDBRequest<IDBCursorWithValue | null>;
        (nextReq as { result: IDBCursorWithValue | null }).result =
          self.cursorCalls < 2 ? (cursor as IDBCursorWithValue) : null;
        setTimeout(() => nextReq.dispatchEvent(new Event('success')), 0);
        return nextReq;
      },
      continuePrimaryKey: () =>
        (null as unknown) as IDBRequest<IDBCursorWithValue | null>,
      delete: () => (null as unknown) as IDBRequest<undefined>,
      update: () => (null as unknown) as IDBRequest<IDBValidKey>,
    };
    (req as { result: IDBCursorWithValue | null }).result = cursor;
    setTimeout(() => req.dispatchEvent(new Event('success')), 0);
    return req;
  }

  openKeyCursor(
    _range?: IDBValidKey | IDBKeyRange,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursor | null> {
    const self = this;
    const req = new EventTarget() as IDBRequest<IDBCursor | null>;
    const cursor: IDBCursor = {
      source: this,
      direction: 'next',
      key: 1,
      primaryKey: 1,
      request: req,
      advance: () => (null as unknown) as IDBRequest<IDBCursor | null>,
      continue: () => {
        self.cursorCalls += 1;
        const nextReq = new EventTarget() as IDBRequest<IDBCursor | null>;
        (nextReq as { result: IDBCursor | null }).result =
          self.cursorCalls < 2 ? cursor : null;
        setTimeout(() => nextReq.dispatchEvent(new Event('success')), 0);
        return nextReq;
      },
      continuePrimaryKey: () => (null as unknown) as IDBRequest<IDBCursor | null>,
      delete: () => (null as unknown) as IDBRequest<undefined>,
      update: () => (null as unknown) as IDBRequest<IDBValidKey>,
    };
    (req as { result: IDBCursor | null }).result = cursor;
    setTimeout(() => req.dispatchEvent(new Event('success')), 0);
    return req;
  }
}

test('IndexAdapter.get returns value', async () => {
  const index = new MockIDBIndex();
  const adapter = new IndexAdapter(index);
  const value = await adapter.get(1);
  assert.deepEqual(value, { id: 1, name: 'a' });
});

test('IndexAdapter.getAll returns array', async () => {
  const adapter = new IndexAdapter(new MockIDBIndex());
  const arr = await adapter.getAll();
  assert.deepEqual(arr, [{ id: 1 }, { id: 2 }]);
});

test('IndexAdapter.getAllKeys returns keys', async () => {
  const adapter = new IndexAdapter(new MockIDBIndex());
  const keys = await adapter.getAllKeys();
  assert.deepEqual(keys, [1, 2, 3]);
});

test('IndexAdapter.getKey returns single key', async () => {
  const adapter = new IndexAdapter(new MockIDBIndex());
  const key = await adapter.getKey();
  assert.equal(key, 1);
});

test('IndexAdapter.count returns number', async () => {
  const adapter = new IndexAdapter(new MockIDBIndex());
  const n = await adapter.count();
  assert.equal(n, 42);
});

test('IndexAdapter.openCursor yields Cursor entries', async () => {
  const index = new MockIDBIndex();
  const adapter = new IndexAdapter(index);
  const results: unknown[] = [];
  /* eslint-disable no-restricted-syntax -- for-await-of is required for async iterable */
  for await (const cursor of adapter.openCursor()) {
    results.push(cursor.value);
  }
  assert.equal(results.length, 2);
  assert.deepEqual(results[0], { id: 1 });
  assert.deepEqual(results[1], { id: 1 });
});

test('IndexAdapter.openKeyCursor yields Cursor entries', async () => {
  const index = new MockIDBIndex();
  const adapter = new IndexAdapter(index);
  const keys: IDBValidKey[] = [];
  /* eslint-disable no-restricted-syntax -- for-await-of is required for async iterable */
  for await (const cursor of adapter.openKeyCursor()) {
    keys.push(cursor.key!);
  }
  assert.equal(keys.length, 2);
});

test('IndexAdapter.from creates adapter', () => {
  const index = new MockIDBIndex();
  const adapter = IndexAdapter.from(index);
  assert.equal(adapter.name, 'testIndex');
  assert.equal(adapter.objectStore, index.objectStore);
});
