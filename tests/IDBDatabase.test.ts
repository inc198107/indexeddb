import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseAdapter } from '../IDBDatabase';
import { ObjectStoreAdapter } from '../IDBObjectStore';
import { TransactionAdapter } from '../IDBTransaction';

function makeDomStringList(items: string[]): DOMStringList {
  return {
    length: items.length,
    item: (index: number) => items[index] ?? null,
    contains: (str: string) => items.includes(str),
    [Symbol.iterator]: items[Symbol.iterator].bind(items),
  } as unknown as DOMStringList;
}

function createRequest<T>(result: T): IDBRequest<T> {
  const req = new EventTarget() as IDBRequest<T>;
  (req as { result: T }).result = result;
  (req as { error: unknown }).error = null;
  setTimeout(() => req.dispatchEvent(new Event('success')), 0);
  return req;
}

class MockIDBObjectStore implements IDBObjectStore {
  name: string;

  keyPath: string | string[] = 'id';

  indexNames = makeDomStringList([]);

  autoIncrement = false;

  transaction = {} as IDBTransaction;

  constructor(name: string) {
    this.name = name;
  }

  add(_value: unknown, _key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return createRequest(1 as IDBValidKey);
  }

  clear(): IDBRequest<undefined> {
    return createRequest(undefined);
  }

  count(_query?: IDBValidKey | IDBKeyRange): IDBRequest<number> {
    return createRequest(0);
  }

  createIndex(_name: string, _keyPath: string | string[], _options?: IDBIndexParameters): IDBIndex {
    return {} as IDBIndex;
  }

  delete(_query: IDBValidKey | IDBKeyRange): IDBRequest<undefined> {
    return createRequest(undefined);
  }

  deleteIndex(_name: string): void {}

  get(_query: IDBValidKey | IDBKeyRange): IDBRequest<unknown> {
    return createRequest<unknown>(undefined);
  }

  getAll(_query?: IDBValidKey | IDBKeyRange | null, _count?: number): IDBRequest<unknown[]> {
    return createRequest<unknown[]>([]);
  }

  getAllKeys(
    _query?: IDBValidKey | IDBKeyRange | null,
    _count?: number,
  ): IDBRequest<IDBValidKey[]> {
    return createRequest<IDBValidKey[]>([]);
  }

  getKey(_query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    return createRequest<IDBValidKey | undefined>(undefined);
  }

  index(_name: string): IDBIndex {
    return {} as IDBIndex;
  }

  openCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursorWithValue | null> {
    return createRequest<IDBCursorWithValue | null>(null);
  }

  openKeyCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursor | null> {
    return createRequest<IDBCursor | null>(null);
  }

  put(_value: unknown, _key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return createRequest(1 as IDBValidKey);
  }
}

class MockIDBTransaction extends EventTarget implements IDBTransaction {
  db = {} as IDBDatabase;

  durability: IDBTransactionDurability = 'default';

  error: DOMException | null = null;

  mode: IDBTransactionMode = 'readwrite';

  objectStoreNames: DOMStringList;

  onabort: ((this: IDBTransaction, ev: Event) => unknown) | null = null;

  oncomplete: ((this: IDBTransaction, ev: Event) => unknown) | null = null;

  onerror: ((this: IDBTransaction, ev: Event) => unknown) | null = null;

  private readonly storeNames: string[];

  constructor(storeNames: string[]) {
    super();
    this.storeNames = storeNames;
    this.objectStoreNames = makeDomStringList(storeNames);
  }

  objectStore(name: string): IDBObjectStore {
    return new MockIDBObjectStore(name) as unknown as IDBObjectStore;
  }

  commit(): void {}

  abort(): void {}
}

class MockIDBDatabase extends EventTarget implements IDBDatabase {
  name: string;

  version: number;

  objectStoreNames: DOMStringList;

  onabort: ((this: IDBDatabase, ev: Event) => unknown) | null = null;

  onclose: ((this: IDBDatabase, ev: Event) => unknown) | null = null;

  onerror: ((this: IDBDatabase, ev: Event) => unknown) | null = null;

  onversionchange: ((this: IDBDatabase, ev: IDBVersionChangeEvent) => unknown) | null = null;

  private readonly stores: string[];

  constructor(name: string, version: number, storeNames: string[]) {
    super();
    this.name = name;
    this.version = version;
    this.stores = storeNames;
    this.objectStoreNames = makeDomStringList(storeNames);
  }

  close(): void {}

  deleteObjectStore(_name: string): void {}

  createObjectStore(name: string, _options?: IDBObjectStoreParameters): IDBObjectStore {
    return new MockIDBObjectStore(name) as unknown as IDBObjectStore;
  }

  transaction(
    storeNames: string | string[],
    _mode?: IDBTransactionMode,
    _options?: IDBTransactionOptions,
  ): IDBTransaction {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames];
    return new MockIDBTransaction(names) as unknown as IDBTransaction;
  }
}

test('DatabaseAdapter.name and version', () => {
  const db = new MockIDBDatabase('myDb', 2, ['users']);
  const adapter = new DatabaseAdapter(db);
  assert.equal(adapter.name, 'myDb');
  assert.equal(adapter.version, 2);
});

test('DatabaseAdapter.objectStoreNames returns string array', () => {
  const db = new MockIDBDatabase('test', 1, ['users', 'posts', 'comments']);
  const adapter = new DatabaseAdapter(db);
  assert.deepEqual(adapter.objectStoreNames, ['users', 'posts', 'comments']);
});

test('DatabaseAdapter.createObjectStore returns ObjectStoreAdapter', () => {
  const db = new MockIDBDatabase('test', 1, []);
  const adapter = new DatabaseAdapter(db);
  const store = adapter.createObjectStore('newStore', { keyPath: 'id' });
  assert.ok(store instanceof ObjectStoreAdapter);
  assert.equal(store.name, 'newStore');
});

test('DatabaseAdapter.transaction returns TransactionAdapter', () => {
  const db = new MockIDBDatabase('test', 1, ['users']);
  const adapter = new DatabaseAdapter(db);
  const tx = adapter.transaction('users', 'readwrite');
  assert.ok(tx instanceof TransactionAdapter);
  assert.deepEqual(tx.objectStoreNames, ['users']);
});

test('DatabaseAdapter.transaction with multiple stores', () => {
  const db = new MockIDBDatabase('test', 1, ['a', 'b']);
  const adapter = new DatabaseAdapter(db);
  const tx = adapter.transaction(['a', 'b'], 'readonly');
  assert.ok(tx instanceof TransactionAdapter);
  assert.deepEqual(tx.objectStoreNames, ['a', 'b']);
});

test('DatabaseAdapter.from creates adapter', () => {
  const db = new MockIDBDatabase('fromTest', 3, []);
  const adapter = DatabaseAdapter.from(db);
  assert.ok(adapter instanceof DatabaseAdapter);
  assert.equal(adapter.name, 'fromTest');
  assert.equal(adapter.version, 3);
});

test('DatabaseAdapter.close and deleteObjectStore are callable', () => {
  const db = new MockIDBDatabase('test', 1, ['store']);
  const adapter = new DatabaseAdapter(db);
  assert.doesNotThrow(() => adapter.close());
  assert.doesNotThrow(() => adapter.deleteObjectStore('store'));
});
