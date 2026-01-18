type OnceOptions = {
  signal?: AbortSignal;
};

const getAbortReason = (signal?: AbortSignal) => {
  if (!signal) {
    const error = new Error('The operation was aborted');
    (error as { name: string }).name = 'AbortError';
    return error;
  }
  if (signal.reason !== undefined) {
    return signal.reason;
  }
  const error = new Error('The operation was aborted');
  (error as { name: string }).name = 'AbortError';
  return error;
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

export function once<T extends Event = Event>(
  eventTarget: EventTarget,
  eventName: string,
  options: OnceOptions = {},
): Promise<T> {
  if (options.signal?.aborted) {
    return Promise.reject(getAbortReason(options.signal));
  }
  return new Promise<T>((resolve, reject) => {
    function cleanup() {
      eventTarget.removeEventListener(eventName, handleEvent);
      if (eventName !== 'error') {
        eventTarget.removeEventListener('error', handleError);
      }
      if (options.signal) {
        options.signal.removeEventListener('abort', handleAbort);
      }
    }

    function handleEvent(event: Event) {
      cleanup();
      resolve(event as T);
    }

    function handleError(event: Event) {
      cleanup();
      const error = (event as ErrorEvent).error ?? event;
      reject(error);
    }

    function handleAbort() {
      cleanup();
      reject(getAbortReason(options.signal));
    }

    eventTarget.addEventListener(eventName, handleEvent);
    if (eventName !== 'error') {
      eventTarget.addEventListener('error', handleError);
    }
    if (options.signal) {
      options.signal.addEventListener('abort', handleAbort, { once: true });
    }
  });
}
