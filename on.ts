import { getAbortReason } from './abort';
import type { IDBEventMap, IDBTarget, OnOptions } from './types';

const DONE: IteratorResult<Event> = { done: true, value: undefined };

export class On<TEvent = Event> implements AsyncIterableIterator<TEvent> {
  private readonly events: Event[] = [];

  private readonly resolvers: Array<{
    resolve: (value: IteratorResult<TEvent>) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  private readonly abortController: AbortController;

  private done = false;

  constructor(
    private readonly eventTarget: EventTarget,
    private readonly eventName: string,
    private readonly options: OnOptions = {},
  ) {
    this.abortController = new AbortController();

    const listener = (event: Event) => {
      if (this.resolvers.length > 0) {
        const { resolve } = this.resolvers.shift()!;
        resolve({ done: false, value: event as TEvent });
      } else {
        this.events.push(event);
      }
    };

    const onerror = (event: Event) => {
      const error = (event as ErrorEvent).error ?? event;
      if (this.resolvers.length > 0) {
        const { reject } = this.resolvers.shift()!;
        reject(error);
        this.finalize();
      } else {
        this.finalize();
        this.events.push(event);
      }
    };

    this.eventTarget.addEventListener(this.eventName, listener, {
      signal: this.abortController.signal,
    });
    if (this.eventName !== 'error') {
      this.eventTarget.addEventListener('error', onerror, {
        signal: this.abortController.signal,
      });
    }

    if (this.options.signal) {
      if (this.options.signal.aborted) {
        this.finalize();
      } else {
        this.options.signal.addEventListener(
          'abort',
          () => {
            const error = getAbortReason(this.options.signal);
            if (this.resolvers.length > 0) {
              const { reject } = this.resolvers.shift()!;
              reject(error);
            }
            this.finalize();
          },
          { once: true },
        );
      }
    }
  }

  static from<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
    eventTarget: T,
    eventName: K,
    options?: OnOptions,
  ): On<IDBEventMap<T>[K]> {
    return new On(eventTarget, eventName as string, options);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<TEvent>> {
    if (this.events.length > 0) {
      const event = this.events.shift()!;
      if (event.type === 'error') {
        throw (event as ErrorEvent).error ?? event;
      }
      return { done: false, value: event as TEvent };
    }
    if (this.done) {
      return DONE as IteratorResult<TEvent>;
    }
    return new Promise<IteratorResult<TEvent>>((resolve, reject) => {
      this.resolvers.push({ resolve, reject });
    });
  }

  async return(): Promise<IteratorResult<TEvent>> {
    this.finalize();
    return DONE as IteratorResult<TEvent>;
  }

  async throw(): Promise<IteratorResult<TEvent>> {
    this.finalize();
    return DONE as IteratorResult<TEvent>;
  }

  private finalize() {
    if (this.done) {
      return;
    }
    this.done = true;
    this.abortController.abort();
    this.events.length = 0;
    while (this.resolvers.length > 0) {
      const { resolve } = this.resolvers.shift()!;
      resolve(DONE as IteratorResult<TEvent>);
    }
  }
}
