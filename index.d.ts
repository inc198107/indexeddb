import type { IDBEventMap, IDBTarget, OnOptions, OnceOptions } from './types';

export type { IDBEventMap, IDBTarget, OnOptions, OnceOptions } from './types';

export class Once<TEvent = Event> {
  constructor(eventTarget: EventTarget, eventName: string, options?: OnceOptions);

  static from<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
    eventTarget: T,
    eventName: K,
    options?: OnceOptions,
  ): Once<IDBEventMap<T>[K]>;

  listen(): Promise<TEvent>;
}

export class On<TEvent = Event> implements AsyncIterableIterator<TEvent> {
  constructor(eventTarget: EventTarget, eventName: string, options?: OnOptions);

  static from<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
    eventTarget: T,
    eventName: K,
    options?: OnOptions,
  ): On<IDBEventMap<T>[K]>;

  [Symbol.asyncIterator](): this;

  next(): Promise<IteratorResult<TEvent>>;

  return(): Promise<IteratorResult<TEvent>>;

  throw(reason?: unknown): Promise<IteratorResult<TEvent>>;
}

export class AdoptRequest<T> {
  constructor(request: IDBRequest<T>);

  toPromise(): Promise<T>;
}

export class IndexAdapter {
  constructor(index: IDBIndex);

  static from(index: IDBIndex): IndexAdapter;

  readonly name: string;

  readonly objectStore: IDBObjectStore;

  readonly keyPath: string | string[];

  readonly multiEntry: boolean;

  readonly unique: boolean;

  get(key: IDBValidKey | IDBKeyRange): Promise<unknown>;

  getAll(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<unknown[]>;

  getAllKeys(
    query?: IDBValidKey | IDBKeyRange,
    count?: number,
  ): Promise<IDBValidKey[]>;

  getKey(query?: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;

  count(query?: IDBValidKey | IDBKeyRange): Promise<number>;

  openCursor(
    range?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined>;

  openKeyCursor(
    range?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined>;
}

export class Cursor {
  constructor(cursor: IDBCursor | IDBCursorWithValue);

  static from(cursor: IDBCursor | IDBCursorWithValue): Cursor;

  readonly source: IDBObjectStore | IDBIndex;

  readonly direction: IDBCursorDirection;

  readonly key: IDBValidKey | undefined;

  readonly primaryKey: IDBValidKey | undefined;

  readonly request: IDBRequest<IDBCursor | IDBCursorWithValue | null>;

  readonly value: unknown;

  advance(count: number): Promise<IDBCursor | IDBCursorWithValue | null>;

  continue(key?: IDBValidKey): Promise<IDBCursor | IDBCursorWithValue | null>;

  continuePrimaryKey(
    key: IDBValidKey,
    primaryKey: IDBValidKey,
  ): Promise<IDBCursor | IDBCursorWithValue | null>;

  delete(): Promise<IDBValidKey>;

  update(value: unknown): Promise<IDBValidKey>;
}

export class ObjectStoreAdapter {
  constructor(store: IDBObjectStore);

  static from(store: IDBObjectStore): ObjectStoreAdapter;

  readonly name: string;

  readonly keyPath: string | string[] | null;

  readonly indexNames: string[];

  readonly autoIncrement: boolean;

  readonly transaction: IDBTransaction;

  add(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;

  clear(): Promise<undefined>;

  count(query?: IDBValidKey | IDBKeyRange): Promise<number>;

  delete(query: IDBValidKey | IDBKeyRange): Promise<undefined>;

  get(query: IDBValidKey | IDBKeyRange): Promise<unknown>;

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<unknown[]>;

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]>;

  getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined>;

  put(value: unknown, key?: IDBValidKey): Promise<IDBValidKey>;

  createIndex(
    name: string,
    keyPath: string | string[],
    options?: IDBIndexParameters,
  ): IndexAdapter;

  deleteIndex(name: string): void;

  index(name: string): IndexAdapter;

  openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined>;

  openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined>;
}

export class TransactionAdapter {
  constructor(transaction: IDBTransaction);

  static from(transaction: IDBTransaction): TransactionAdapter;

  readonly db: IDBDatabase;

  readonly durability: IDBTransactionDurability;

  readonly error: DOMException | null;

  readonly mode: IDBTransactionMode;

  readonly objectStoreNames: string[];

  objectStore(name: string): ObjectStoreAdapter;

  commit(): void;

  abort(): void;
}

export class DatabaseAdapter {
  constructor(db: IDBDatabase);

  static from(db: IDBDatabase): DatabaseAdapter;

  readonly name: string;

  readonly version: number;

  readonly objectStoreNames: string[];

  close(): void;

  deleteObjectStore(name: string): void;

  createObjectStore(name: string, options?: IDBObjectStoreParameters): ObjectStoreAdapter;

  transaction(
    storeNames: string | string[],
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions,
  ): TransactionAdapter;
}
