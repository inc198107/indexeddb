export type OnceOptions = {
  signal?: AbortSignal;
};

export type OnOptions = {
  signal?: AbortSignal;
};

export function once<K extends keyof IDBRequestEventMap>(
  eventTarget: IDBRequest,
  eventName: K,
  options?: OnceOptions,
): Promise<IDBRequestEventMap[K]>;

export function once<K extends keyof IDBOpenDBRequestEventMap>(
  eventTarget: IDBOpenDBRequest,
  eventName: K,
  options?: OnceOptions,
): Promise<IDBOpenDBRequestEventMap[K]>;

export function once<K extends keyof IDBTransactionEventMap>(
  eventTarget: IDBTransaction,
  eventName: K,
  options?: OnceOptions,
): Promise<IDBTransactionEventMap[K]>;
export function once<K extends keyof IDBDatabaseEventMap>(
  eventTarget: IDBDatabase,
  eventName: K,
  options?: OnceOptions,
): Promise<IDBDatabaseEventMap[K]>;

export function once<T extends Event = Event>(
  eventTarget: EventTarget,
  eventName: string,
  options?: OnceOptions,
): Promise<T>;

export function on<K extends keyof IDBRequestEventMap>(
  eventTarget: IDBRequest,
  eventName: K,
  options?: OnOptions,
): AsyncIterableIterator<IDBRequestEventMap[K]>;

export function on<K extends keyof IDBOpenDBRequestEventMap>(
  eventTarget: IDBOpenDBRequest,
  eventName: K,
  options?: OnOptions,
): AsyncIterableIterator<IDBOpenDBRequestEventMap[K]>;

export function on<K extends keyof IDBTransactionEventMap>(
  eventTarget: IDBTransaction,
  eventName: K,
  options?: OnOptions,
): AsyncIterableIterator<IDBTransactionEventMap[K]>;

export function on<K extends keyof IDBDatabaseEventMap>(
  eventTarget: IDBDatabase,
  eventName: K,
  options?: OnOptions,
): AsyncIterableIterator<IDBDatabaseEventMap[K]>;

export function on<T extends Event = Event>(
  eventTarget: EventTarget,
  eventName: string,
  options?: OnOptions,
): AsyncIterableIterator<T>;

export function adoptRequest<T>(request: IDBRequest<T>): Promise<T>;
