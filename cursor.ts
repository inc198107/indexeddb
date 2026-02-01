import { AdoptRequest } from './adoptRequest';

export class Cursor {
  constructor(private readonly cursor: IDBCursor | IDBCursorWithValue) {}

  get source(): IDBObjectStore | IDBIndex {
    return this.cursor.source;
  }

  get direction(): IDBCursorDirection {
    return this.cursor.direction;
  }

  get key(): IDBValidKey | undefined {
    return this.cursor.key;
  }

  get primaryKey(): IDBValidKey | undefined {
    return this.cursor.primaryKey;
  }

  get request(): IDBRequest<IDBCursor | IDBCursorWithValue | null> {
    return this.cursor.request;
  }

  advance(count: number): Promise<IDBCursor | IDBCursorWithValue | null> {
    const request = this.cursor.advance(count) as unknown as IDBRequest<
      IDBCursor | IDBCursorWithValue | null
    >;
    return new AdoptRequest<IDBCursor | IDBCursorWithValue | null>(request).toPromise();
  }

  continue(key?: IDBValidKey): Promise<IDBCursor | IDBCursorWithValue | null> {
    const request = this.cursor.continue(key) as unknown as IDBRequest<
      IDBCursor | IDBCursorWithValue | null
    >;
    return new AdoptRequest<IDBCursor | IDBCursorWithValue | null>(request).toPromise();
  }

  continuePrimaryKey(
    key: IDBValidKey,
    primaryKey: IDBValidKey,
  ): Promise<IDBCursor | IDBCursorWithValue | null> {
    const request = this.cursor.continuePrimaryKey(key, primaryKey) as unknown as IDBRequest<
      IDBCursor | IDBCursorWithValue | null
    >;
    return new AdoptRequest<IDBCursor | IDBCursorWithValue | null>(request).toPromise();
  }

  delete(): Promise<IDBValidKey> {
    const request = this.cursor.delete() as unknown as IDBRequest<IDBValidKey>;
    return new AdoptRequest<IDBValidKey>(request).toPromise();
  }

  update(value: unknown): Promise<IDBValidKey> {
    const request = this.cursor.update(value) as unknown as IDBRequest<IDBValidKey>;
    return new AdoptRequest<IDBValidKey>(request).toPromise();
  }

  get value(): unknown {
    if ('value' in this.cursor) {
      return (this.cursor as IDBCursorWithValue).value;
    }
    return undefined;
  }

  static from(cursor: IDBCursor | IDBCursorWithValue): Cursor {
    return new Cursor(cursor);
  }
}
