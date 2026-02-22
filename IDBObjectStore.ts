import { AdoptRequest } from './adoptRequest';
import { Cursor } from './cursor';
import { IndexAdapter } from './IDBIndex';

export class ObjectStoreAdapter {
  constructor(private readonly store: IDBObjectStore) {}

  get name(): string {
    return this.store.name;
  }

  get keyPath(): string | string[] {
    return this.store.keyPath;
  }

  get indexNames(): string[] {
    return Array.from(this.store.indexNames);
  }

  get autoIncrement(): boolean {
    return this.store.autoIncrement;
  }

  get transaction(): IDBTransaction {
    return this.store.transaction;
  }

  add(value: unknown, key?: IDBValidKey): Promise<IDBValidKey> {
    return new AdoptRequest<IDBValidKey>(this.store.add(value, key)).toPromise();
  }

  clear(): Promise<undefined> {
    return new AdoptRequest<undefined>(this.store.clear()).toPromise();
  }

  count(query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return new AdoptRequest<number>(this.store.count(query)).toPromise();
  }

  delete(query: IDBValidKey | IDBKeyRange): Promise<undefined> {
    return new AdoptRequest<undefined>(this.store.delete(query)).toPromise();
  }

  get(query: IDBValidKey | IDBKeyRange): Promise<unknown> {
    return new AdoptRequest(this.store.get(query)).toPromise();
  }

  getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<unknown[]> {
    return new AdoptRequest(this.store.getAll(query, count)).toPromise();
  }

  getAllKeys(query?: IDBValidKey | IDBKeyRange | null, count?: number): Promise<IDBValidKey[]> {
    return new AdoptRequest(this.store.getAllKeys(query, count)).toPromise();
  }

  getKey(query: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined> {
    return new AdoptRequest(this.store.getKey(query)).toPromise();
  }

  put(value: unknown, key?: IDBValidKey): Promise<IDBValidKey> {
    return new AdoptRequest<IDBValidKey>(this.store.put(value, key)).toPromise();
  }

  createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters): IndexAdapter {
    return new IndexAdapter(this.store.createIndex(name, keyPath, options));
  }

  deleteIndex(name: string): void {
    this.store.deleteIndex(name);
  }

  index(name: string): IndexAdapter {
    return new IndexAdapter(this.store.index(name));
  }

  async *openCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined> {
    const firstRequest = this.store.openCursor(
      query,
      direction,
    ) as unknown as IDBRequest<IDBCursorWithValue | null>;
    let cursor: IDBCursorWithValue | null = await new AdoptRequest<IDBCursorWithValue | null>(
      firstRequest,
    ).toPromise();

    while (cursor) {
      yield new Cursor(cursor);
      const nextRequest = cursor.continue() as unknown as IDBRequest<IDBCursorWithValue | null>;
      // eslint-disable-next-line no-await-in-loop -- each iteration awaits next cursor
      cursor = await new AdoptRequest<IDBCursorWithValue | null>(nextRequest).toPromise();
    }
  }

  async *openKeyCursor(
    query?: IDBValidKey | IDBKeyRange | null,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined> {
    const firstRequest = this.store.openKeyCursor(
      query,
      direction,
    ) as unknown as IDBRequest<IDBCursor | null>;
    let cursor: IDBCursor | null = await new AdoptRequest<IDBCursor | null>(
      firstRequest,
    ).toPromise();

    while (cursor) {
      yield new Cursor(cursor);
      const nextRequest = cursor.continue() as unknown as IDBRequest<IDBCursor | null>;
      // eslint-disable-next-line no-await-in-loop -- each iteration awaits next cursor
      cursor = await new AdoptRequest<IDBCursor | null>(nextRequest).toPromise();
    }
  }

  static from(store: IDBObjectStore): ObjectStoreAdapter {
    return new ObjectStoreAdapter(store);
  }
}
