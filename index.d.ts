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
