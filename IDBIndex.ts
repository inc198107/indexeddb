import { AdoptRequest } from './adoptRequest';
import { Cursor } from './cursor';


export class IndexAdapter {
  constructor(private readonly index: IDBIndex) {}

  get name(): string {
    return this.index.name;
  }

  get objectStore(): IDBObjectStore {
    return this.index.objectStore;
  }

  get keyPath(): string | string[] {
    return this.index.keyPath;
  }

  get multiEntry(): boolean {
    return this.index.multiEntry;
  }

  get unique(): boolean {
    return this.index.unique;
  }

 
  get(key: IDBValidKey | IDBKeyRange): Promise<unknown> {
    return new AdoptRequest(this.index.get(key)).toPromise();
  }

 
  getAll(query?: IDBValidKey | IDBKeyRange, count?: number): Promise<unknown[]> {
    return new AdoptRequest(this.index.getAll(query, count)).toPromise();
  }


  getAllKeys(
    query?: IDBValidKey | IDBKeyRange,
    count?: number,
  ): Promise<IDBValidKey[]> {
    return new AdoptRequest(this.index.getAllKeys(query, count)).toPromise();
  }

  getKey(query?: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | undefined> {
    return new AdoptRequest(
      this.index.getKey(query as IDBValidKey | IDBKeyRange),
    ).toPromise();
  }

  count(query?: IDBValidKey | IDBKeyRange): Promise<number> {
    return new AdoptRequest(this.index.count(query)).toPromise();
  }

  
  async *openCursor(
    range?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined> {
    const firstRequest = this.index.openCursor(range, direction) as unknown as IDBRequest<IDBCursorWithValue | null>;
    let cursor: IDBCursorWithValue | null = await new AdoptRequest<
      IDBCursorWithValue | null
    >(firstRequest).toPromise();

    while (cursor) {
      yield new Cursor(cursor);
      const nextRequest = cursor.continue() as unknown as IDBRequest<
        IDBCursorWithValue | null
      >;
      // eslint-disable-next-line no-await-in-loop -- each iteration awaits next cursor
      cursor = await new AdoptRequest<IDBCursorWithValue | null>(
        nextRequest,
      ).toPromise();
    }
  }

 
  async *openKeyCursor(
    range?: IDBValidKey | IDBKeyRange,
    direction?: IDBCursorDirection,
  ): AsyncGenerator<Cursor, void, undefined> {
    const firstRequest = this.index.openKeyCursor(range, direction) as unknown as IDBRequest<IDBCursor | null>;
    let cursor: IDBCursor | null = await new AdoptRequest<IDBCursor | null>(
      firstRequest,
    ).toPromise();

    while (cursor) {
      yield new Cursor(cursor);
      const nextRequest = cursor.continue() as unknown as IDBRequest<
        IDBCursor | null
      >;
      // eslint-disable-next-line no-await-in-loop -- each iteration awaits next cursor
      cursor = await new AdoptRequest<IDBCursor | null>(nextRequest).toPromise();
    }
  }

 
  static from(index: IDBIndex): IndexAdapter {
    return new IndexAdapter(index);
  }
}
