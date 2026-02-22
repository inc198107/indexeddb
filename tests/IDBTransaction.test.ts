import assert from 'node:assert/strict';
import { test } from 'node:test';
import { TransactionAdapter } from '../IDBTransaction';
import { ObjectStoreAdapter } from '../IDBObjectStore';

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
  name = 'mockStore';

  keyPath: string | string[] = 'id';

  indexNames = makeDomStringList([]);

  autoIncrement = false;

  transaction = {} as IDBTransaction;

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
    return createRequest(undefined);
  }

  getAll(_query?: IDBValidKey | IDBKeyRange | null, _count?: number): IDBRequest<unknown[]> {
    return createRequest([]);
  }

  getAllKeys(
    _query?: IDBValidKey | IDBKeyRange | null,
    _count?: number,
  ): IDBRequest<IDBValidKey[]> {
    return createRequest([]);
  }

  getKey(_query: IDBValidKey | IDBKeyRange): IDBRequest<IDBValidKey | undefined> {
    return createRequest(undefined);
  }

  index(_name: string): IDBIndex {
    return {} as IDBIndex;
  }

  openCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursorWithValue | null> {
    return createRequest(null);
  }

  openKeyCursor(
    _query?: IDBValidKey | IDBKeyRange | null,
    _direction?: IDBCursorDirection,
  ): IDBRequest<IDBCursor | null> {
    return createRequest(null);
  }

  put(_value: unknown, _key?: IDBValidKey): IDBRequest<IDBValidKey> {
    return createRequest(1 as IDBValidKey);
  }
}

class MockIDBTransaction extends EventTarget implements IDBTransaction {
  db = {} as IDBDatabase;

  durability: IDBTransactionDurability = 'default';

  error: DOMException | null = null;

  mode: IDBTransactionMode = 'readonly';

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
    if (!this.storeNames.includes(name)) {
      throw new DOMException(`No objectStore named ${name} in this transaction`, 'NotFoundError');
    }
    const store = new MockIDBObjectStore();
    store.name = name;
    return store as unknown as IDBObjectStore;
  }

  commit(): void {}

  abort(): void {}
}

test('TransactionAdapter.objectStoreNames returns string array', () => {
  const tx = new MockIDBTransaction(['users', 'posts']);
  const adapter = new TransactionAdapter(tx);
  assert.deepEqual(adapter.objectStoreNames, ['users', 'posts']);
});

test('TransactionAdapter.objectStore returns ObjectStoreAdapter', () => {
  const tx = new MockIDBTransaction(['users']);
  const adapter = new TransactionAdapter(tx);
  const store = adapter.objectStore('users');
  assert.ok(store instanceof ObjectStoreAdapter);
  assert.equal(store.name, 'users');
});

test('TransactionAdapter exposes db, mode, durability, error', () => {
  const tx = new MockIDBTransaction(['items']);
  const adapter = new TransactionAdapter(tx);
  assert.equal(adapter.db, tx.db);
  assert.equal(adapter.mode, 'readonly');
  assert.equal(adapter.durability, 'default');
  assert.equal(adapter.error, null);
});

test('TransactionAdapter.from creates adapter', () => {
  const tx = new MockIDBTransaction(['a', 'b']);
  const adapter = TransactionAdapter.from(tx);
  assert.ok(adapter instanceof TransactionAdapter);
  assert.deepEqual(adapter.objectStoreNames, ['a', 'b']);
});

test('TransactionAdapter.commit and abort are callable', () => {
  const tx = new MockIDBTransaction([]);
  const adapter = new TransactionAdapter(tx);
  assert.doesNotThrow(() => adapter.commit());
  assert.doesNotThrow(() => adapter.abort());
});
