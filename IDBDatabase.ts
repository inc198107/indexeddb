import { ObjectStoreAdapter } from './IDBObjectStore';
import { TransactionAdapter } from './IDBTransaction';

export class DatabaseAdapter {
  constructor(private readonly db: IDBDatabase) {}

  get name(): string {
    return this.db.name;
  }

  get version(): number {
    return this.db.version;
  }

  get objectStoreNames(): string[] {
    return Array.from(this.db.objectStoreNames);
  }

  close(): void {
    this.db.close();
  }

  deleteObjectStore(name: string): void {
    this.db.deleteObjectStore(name);
  }

  createObjectStore(name: string, options?: IDBObjectStoreParameters): ObjectStoreAdapter {
    return new ObjectStoreAdapter(this.db.createObjectStore(name, options));
  }

  transaction(
    storeNames: string | string[],
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions,
  ): TransactionAdapter {
    return new TransactionAdapter(this.db.transaction(storeNames, mode, options));
  }

  static from(db: IDBDatabase): DatabaseAdapter {
    return new DatabaseAdapter(db);
  }
}
