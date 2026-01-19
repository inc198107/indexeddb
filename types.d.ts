export type OnceOptions = {
  signal?: AbortSignal;
};

export type OnOptions = {
  signal?: AbortSignal;
};

export type IDBTarget = IDBOpenDBRequest | IDBRequest | IDBTransaction | IDBDatabase;

export type IDBEventMap<T> = T extends IDBOpenDBRequest
  ? IDBOpenDBRequestEventMap
  : T extends IDBRequest
    ? IDBRequestEventMap
    : T extends IDBTransaction
      ? IDBTransactionEventMap
      : T extends IDBDatabase
        ? IDBDatabaseEventMap
        : never;
