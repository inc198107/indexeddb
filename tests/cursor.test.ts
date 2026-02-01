import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Cursor } from '../cursor';

class MockCursor extends EventTarget implements IDBCursor {
  source: IDBObjectStore | IDBIndex;

  direction: IDBCursorDirection = 'next';

  key: IDBValidKey = 1;

  primaryKey: IDBValidKey = 1;

  request: IDBRequest<IDBCursor | IDBCursorWithValue | null>;

  protected _value: unknown;

  constructor(source: IDBObjectStore | IDBIndex, value?: unknown) {
    super();
    this.source = source;
    this._value = value;
    this.request = this.createRequest();
  }

  private createRequest(): IDBRequest<IDBCursor | IDBCursorWithValue | null> {
    const request = new EventTarget() as IDBRequest<IDBCursor | IDBCursorWithValue | null>;
    (request as { result: IDBCursor | IDBCursorWithValue | null }).result = this as unknown as IDBCursor;
    (request as { error: unknown }).error = null;
    return request as IDBRequest<IDBCursor | IDBCursorWithValue | null>;
  }

  advance(count: number): IDBRequest<IDBCursor | IDBCursorWithValue | null> {
    const request = this.createRequest();
    setTimeout(() => {
      this.key = ((this.key as number) ?? 0) + count;
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request;
  }

  continue(key?: IDBValidKey): IDBRequest<IDBCursor | IDBCursorWithValue | null> {
    const request = this.createRequest();
    setTimeout(() => {
      if (key !== undefined) {
        this.key = key;
      } else {
        this.key = ((this.key as number) ?? 0) + 1;
      }
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request;
  }

  continuePrimaryKey(
    key: IDBValidKey,
    primaryKey: IDBValidKey,
  ): IDBRequest<IDBCursor | IDBCursorWithValue | null> {
    const request = this.createRequest();
    setTimeout(() => {
      this.key = key;
      this.primaryKey = primaryKey;
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request;
  }

  delete(): IDBRequest<undefined> {
    const request = new EventTarget() as IDBRequest<IDBValidKey>;
    const deletedKey = this.key;
    setTimeout(() => {
      (request as { result: IDBValidKey }).result = deletedKey;
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request as unknown as IDBRequest<undefined>;
  }

  update(value: unknown): IDBRequest<IDBValidKey> {
    const request = new EventTarget() as IDBRequest<IDBValidKey>;
    this._value = value;
    const updatedKey = this.key;
    setTimeout(() => {
      (request as { result: IDBValidKey }).result = updatedKey!;
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request as IDBRequest<IDBValidKey>;
  }
}

class MockCursorWithValue extends MockCursor implements IDBCursorWithValue {
  key: IDBValidKey = 1;

  constructor(
    source: IDBObjectStore | IDBIndex,
    public value: unknown,
  ) {
    super(source, value);
  }

  override update(value: unknown): IDBRequest<IDBValidKey> {
    const request = new EventTarget() as IDBRequest<IDBValidKey>;
    this.value = value;
    this._value = value;
    const updatedKey = this.key;
    setTimeout(() => {
      (request as { result: IDBValidKey }).result = updatedKey;
      request.dispatchEvent(new Event('success'));
    }, 0);
    return request as IDBRequest<IDBValidKey>;
  }
}

class MockDOMStringList extends Array<string> implements DOMStringList {
  contains(str: string): boolean {
    return this.includes(str);
  }

  item(index: number): string | null {
    return this[index] ?? null;
  }
}

class MockObjectStore extends EventTarget implements IDBObjectStore {
  name = 'testStore';

  keyPath: string | string[] | null = null;

  indexNames = new MockDOMStringList();

  autoIncrement = false;

  transaction = {} as IDBTransaction;

  add(): IDBRequest<IDBValidKey> {
    throw new Error('Not implemented');
  }

  clear(): IDBRequest<undefined> {
    throw new Error('Not implemented');
  }

  count(query?: IDBValidKey | IDBKeyRange): IDBRequest<number> {
    throw new Error('Not implemented');
  }

  createIndex(): IDBIndex {
    throw new Error('Not implemented');
  }

  delete(): IDBRequest<undefined> {
    throw new Error('Not implemented');
  }

  deleteIndex(): void {
    throw new Error('Not implemented');
  }

  get(): IDBRequest<unknown> {
    throw new Error('Not implemented');
  }

  getAll(): IDBRequest<unknown[]> {
    throw new Error('Not implemented');
  }

  getAllKeys(): IDBRequest<IDBValidKey[]> {
    throw new Error('Not implemented');
  }

  getKey(): IDBRequest<IDBValidKey | undefined> {
    throw new Error('Not implemented');
  }

  index(): IDBIndex {
    throw new Error('Not implemented');
  }

  openCursor(): IDBRequest<IDBCursorWithValue | null> {
    throw new Error('Not implemented');
  }

  openKeyCursor(): IDBRequest<IDBCursor | null> {
    throw new Error('Not implemented');
  }

  put(): IDBRequest<IDBValidKey> {
    throw new Error('Not implemented');
  }
}

test('Cursor exposes cursor properties', () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  const wrapper = new Cursor(cursor as IDBCursor);

  assert.equal(wrapper.source, store);
  assert.equal(wrapper.direction, 'next');
  assert.equal(wrapper.key, 1);
  assert.equal(wrapper.primaryKey, 1);
  assert.equal(wrapper.request, cursor.request);
});

test('Cursor exposes value for IDBCursorWithValue', () => {
  const store = new MockObjectStore();
  const cursor = new MockCursorWithValue(store, { id: 1, name: 'test' });
  const wrapper = new Cursor(cursor);

  assert.deepEqual(wrapper.value, { id: 1, name: 'test' });
});

test('Cursor.advance() moves cursor forward', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  cursor.key = 1;
  const wrapper = new Cursor(cursor as IDBCursor);

  const result = await wrapper.advance(3);

  assert.equal(result, cursor);
  assert.equal(cursor.key, 4);
});

test('Cursor.continue() moves cursor to next position', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  cursor.key = 1;
  const wrapper = new Cursor(cursor as IDBCursor);

  const result = await wrapper.continue();

  assert.equal(result, cursor);
  assert.equal(cursor.key, 2);
});

test('Cursor.continue(key) moves cursor to specific key', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  cursor.key = 1;
  const wrapper = new Cursor(cursor as IDBCursor);

  const result = await wrapper.continue(5);

  assert.equal(result, cursor);
  assert.equal(cursor.key, 5);
});

test('Cursor.continuePrimaryKey() moves cursor to key and primaryKey', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  cursor.key = 1;
  cursor.primaryKey = 1;
  const wrapper = new Cursor(cursor as IDBCursor);

  const result = await wrapper.continuePrimaryKey(10, 20);

  assert.equal(result, cursor);
  assert.equal(cursor.key, 10);
  assert.equal(cursor.primaryKey, 20);
});

test('Cursor.delete() deletes record and returns key', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  cursor.key = 42;
  const wrapper = new Cursor(cursor as IDBCursor);

  const deletedKey = await wrapper.delete();

  assert.equal(deletedKey, 42);
});

test('Cursor.update() updates record and returns key', async () => {
  const store = new MockObjectStore();
  const cursor = new MockCursorWithValue(store, { id: 1 });
  cursor.key = 42;
  const wrapper = new Cursor(cursor);

  const updatedKey = await wrapper.update({ id: 1, name: 'updated' });

  assert.equal(updatedKey, 42);
  assert.deepEqual(cursor.value, { id: 1, name: 'updated' });
});

test('Cursor.from() creates Cursor instance', () => {
  const store = new MockObjectStore();
  const cursor = new MockCursor(store);
  const wrapper = Cursor.from(cursor as IDBCursor);

  assert.ok(wrapper instanceof Cursor);
  assert.equal(wrapper.source, store);
});
