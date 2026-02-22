import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ObjectStoreAdapter } from '../IDBObjectStore';
import { IndexAdapter } from '../IDBIndex';
import { Cursor } from '../cursor';

function createRequest<T>(result: T): IDBRequest<T> {
  const req = new EventTarget() as IDBRequest<T>;
  (req as { result: T }).result = result;
  (req as { error: unknown }).error = null;
  setTimeout(() => req.dispatchEvent(new Event('success')), 0);
  return req;
}

function makeDomStringList(items: string[]): DOMStringList {
  return {
    length: items.length,
    item: (index: number) => items[index] ?? null,
    contains: (str: string) => items.includes(str),
    [Symbol.iterator]: items[Symbol.iterator].bind(items),
  } as unknown as DOMStringList;
}

class MockIDBObjectStore implements IDBObjectStore {
  name = 'testStore';

  keyPath: string | string[] = 'id';

  indexNames = makeDomStringList(['byName']);

  autoIncrement = false;

  transaction = {} as IDBTransaction;

  add(_value: unknown, _key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return createRequest(1 as IDBValidKey);
  }

  clear(): IDBRequest<undefined> {
    return createRequest(undefined);
  }

  count(_query?: IDBValidKey | IDBKeyRange): IDBRequest<number> {
    return createRequest(3);
  }

  createIndex(name: string, keyPath: string | string[], _options?: IDBIndexParameters): IDBIndex {
    return {
      name,
      keyPath,
      objectStore: this as unknown as IDBObjectStore,
      multiEntry: false,
      unique: false,
      get: createRequest,
      getAll: createRequest,
      getAllKeys: createRequest,
      getKey: createRequest,
      count: createRequest,
      openCursor: createRequest,
      openKeyCursor: createRequest,
    } as unknown as IDBIndex;
  }

  delete(_query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
    return createRequest(undefined);
  }

  deleteIndex(_name: string): void {}

  get(_query: IDBValidKey | IDBKeyRange): IDBRequest<unknown> {
    return createRequest<unknown>({ id: 1, name: 'test' });
  }

  getAll(_query?: IDBValidKey | IDBKeyRange | null, _count?: number): IDBRequest<unknown[]> {
    return createRequest<unknown[]>([{ id: 1 }, { id: 2 }]);
  }

  getAllKeys(
    _query?: IDBValidKey | IDBKeyRange | null,
    _count?: number,
  ): IDBRequest<IDBValidKey[]> {
    return createRequest<IDBValidKey[]>([1, 2, 3] as IDBValidKey[]);
  }

  getKey(_query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    return createRequest<IDBValidKey | undefined>(1 as IDBValidKey);
  }

  index(name: string): IDBIndex {
    return {
      name,
      keyPath: 'id',
      objectStore: this as unknown as IDBObjectStore,
      multiEntry: false,
      unique: false,
    } as unknown as IDBIndex;
  }

  put(_value: unknown, _key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return createRequest(42 as IDBValidKey);
  }

  private openCursorCalls = 0;

  openCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursorWithValue | null> {
    const self = this;
    const req = new EventTarget() as IDBRequest<IDBCursorWithValue | null>;
    const cursor: IDBCursorWithValue = {
      source: this as unknown as IDBObjectStore,
      direction: 'next',
      key: 1,
      primaryKey: 1,
      value: { id: 1 },
      request: req,
      advance: () => null as unknown as IDBRequest<IDBCursorWithValue | null>,
      continue: () => {
        self.openCursorCalls += 1;
        const nextReq = new EventTarget() as IDBRequest<IDBCursorWithValue | null>;
        (nextReq as { result: IDBCursorWithValue | null }).result =
          self.openCursorCalls < 2 ? cursor : null;
        setTimeout(() => nextReq.dispatchEvent(new Event('success')), 0);
        return nextReq;
      },
      continuePrimaryKey: () => null as unknown as IDBRequest<IDBCursorWithValue | null>,
      delete: () => null as unknown as IDBRequest<undefined>,
      update: () => null as unknown as IDBRequest<IDBValidKey>,
    };
    (req as { result: IDBCursorWithValue | null }).result = cursor;
    setTimeout(() => req.dispatchEvent(new Event('success')), 0);
    return req;
  }

  private openKeyCursorCalls = 0;

  openKeyCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursor | null> {
    const self = this;
    const req = new EventTarget() as IDBRequest<IDBCursor | null>;
    const cursor: IDBCursor = {
      source: this as unknown as IDBObjectStore,
      direction: 'next',
      key: 2,
      primaryKey: 2,
      request: req,
      advance: () => null as unknown as IDBRequest<IDBCursor | null>,
      continue: () => {
        self.openKeyCursorCalls += 1;
        const nextReq = new EventTarget() as IDBRequest<IDBCursor | null>;
        (nextReq as { result: IDBCursor | null }).result =
          self.openKeyCursorCalls < 2 ? cursor : null;
        setTimeout(() => nextReq.dispatchEvent(new Event('success')), 0);
        return nextReq;
      },
      continuePrimaryKey: () => null as unknown as IDBRequest<IDBCursor | null>,
      delete: () => null as unknown as IDBRequest<undefined>,
      update: () => null as unknown as IDBRequest<IDBValidKey>,
    };
    (req as { result: IDBCursor | null }).result = cursor;
    setTimeout(() => req.dispatchEvent(new Event('success')), 0);
    return req;
  }
}

test('ObjectStoreAdapter.add resolves with key', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const key = await adapter.add({ id: 1 });
  assert.equal(key, 1);
});

test('ObjectStoreAdapter.clear resolves with undefined', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const result = await adapter.clear();
  assert.equal(result, undefined);
});

test('ObjectStoreAdapter.count returns number', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const n = await adapter.count();
  assert.equal(n, 3);
});

test('ObjectStoreAdapter.delete resolves with undefined', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const result = await adapter.delete(1);
  assert.equal(result, undefined);
});

test('ObjectStoreAdapter.get returns value', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const value = await adapter.get(1);
  assert.deepEqual(value, { id: 1, name: 'test' });
});

test('ObjectStoreAdapter.getAll returns array', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const arr = await adapter.getAll();
  assert.deepEqual(arr, [{ id: 1 }, { id: 2 }]);
});

test('ObjectStoreAdapter.getAllKeys returns keys', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const keys = await adapter.getAllKeys();
  assert.deepEqual(keys, [1, 2, 3]);
});

test('ObjectStoreAdapter.getKey returns single key', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const key = await adapter.getKey(1);
  assert.equal(key, 1);
});

test('ObjectStoreAdapter.put resolves with key', async () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const key = await adapter.put({ id: 42 });
  assert.equal(key, 42);
});

test('ObjectStoreAdapter.createIndex returns IndexAdapter', () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const index = adapter.createIndex('byName', 'name');
  assert.ok(index instanceof IndexAdapter);
  assert.equal(index.name, 'byName');
});

test('ObjectStoreAdapter.index returns IndexAdapter', () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  const index = adapter.index('byName');
  assert.ok(index instanceof IndexAdapter);
  assert.equal(index.name, 'byName');
});

test('ObjectStoreAdapter.indexNames returns string array', () => {
  const adapter = new ObjectStoreAdapter(new MockIDBObjectStore());
  assert.deepEqual(adapter.indexNames, ['byName']);
});

test('ObjectStoreAdapter.openCursor yields Cursor entries', async () => {
  const store = new MockIDBObjectStore();
  const adapter = new ObjectStoreAdapter(store);
  const values: unknown[] = [];
  /* eslint-disable no-restricted-syntax -- for-await-of is required for async iterable */
  for await (const cursor of adapter.openCursor()) {
    values.push(cursor.value);
  }
  assert.equal(values.length, 2);
  assert.deepEqual(values[0], { id: 1 });
});

test('ObjectStoreAdapter.openKeyCursor yields Cursor entries', async () => {
  const store = new MockIDBObjectStore();
  const adapter = new ObjectStoreAdapter(store);
  const keys: IDBValidKey[] = [];
  /* eslint-disable no-restricted-syntax -- for-await-of is required for async iterable */
  for await (const cursor of adapter.openKeyCursor()) {
    keys.push(cursor.key!);
  }
  assert.equal(keys.length, 2);
  assert.equal(keys[0], 2);
});

test('ObjectStoreAdapter.from creates adapter', () => {
  const store = new MockIDBObjectStore();
  const adapter = ObjectStoreAdapter.from(store);
  assert.ok(adapter instanceof ObjectStoreAdapter);
  assert.equal(adapter.name, 'testStore');
  assert.equal(adapter.autoIncrement, false);
});

test('ObjectStoreAdapter yields Cursor instances', async () => {
  const store = new MockIDBObjectStore();
  const adapter = new ObjectStoreAdapter(store);
  /* eslint-disable no-restricted-syntax -- for-await-of is required for async iterable */
  for await (const cursor of adapter.openCursor()) {
    assert.ok(cursor instanceof Cursor);
  }
});
