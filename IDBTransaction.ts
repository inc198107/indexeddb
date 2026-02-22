import { ObjectStoreAdapter } from './IDBObjectStore';

export class TransactionAdapter {
  constructor(private readonly transaction: IDBTransaction) {}

  get db(): IDBDatabase {
    return this.transaction.db;
  }

  get durability(): IDBTransactionDurability {
    return this.transaction.durability;
  }

  get error(): DOMException | null {
    return this.transaction.error;
  }

  get mode(): IDBTransactionMode {
    return this.transaction.mode;
  }

  get objectStoreNames(): string[] {
    return Array.from(this.transaction.objectStoreNames);
  }

  objectStore(name: string): ObjectStoreAdapter {
    return new ObjectStoreAdapter(this.transaction.objectStore(name));
  }

  commit(): void {
    this.transaction.commit();
  }

  abort(): void {
    this.transaction.abort();
  }

  static from(transaction: IDBTransaction): TransactionAdapter {
    return new TransactionAdapter(transaction);
  }
}
