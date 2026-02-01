import { getAbortReason } from './abort';
import type { IDBEventMap, IDBTarget, OnceOptions } from './types';

export class Once<TEvent = Event> {
  private readonly eventTarget: EventTarget;

  private readonly eventName: string;

  private readonly options: OnceOptions;

  constructor(eventTarget: EventTarget, eventName: string, options: OnceOptions = {}) {
    this.eventTarget = eventTarget;
    this.eventName = eventName;
    this.options = options;
  }

  static from<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
    eventTarget: T,
    eventName: K,
    options?: OnceOptions,
  ): Once<IDBEventMap<T>[K]> {
    return new Once(eventTarget, eventName as string, options);
  }

  listen(): Promise<TEvent> {
    const { eventTarget, eventName, options } = this;
    if (options.signal?.aborted) {
      return Promise.reject(getAbortReason(options.signal));
    }

    const controller = new AbortController();

    const promise = new Promise<TEvent>((resolve, reject) => {
      const handleEvent = (event: Event) => {
        controller.abort();
        resolve(event as TEvent);
      };

      const handleError = (event: Event) => {
        controller.abort();
        const error = (event as ErrorEvent).error ?? event;
        reject(error);
      };

      const handleAbort = () => {
        controller.abort();
        const error = getAbortReason(options.signal);
        reject(error);
      };

      eventTarget.addEventListener(eventName, handleEvent, {
        signal: controller.signal,
      });
      if (eventName !== 'error') {
        eventTarget.addEventListener('error', handleError, {
          signal: controller.signal,
        });
      }
      if (options.signal) {
        if (options.signal.aborted) {
          handleAbort();
        } else {
          options.signal.addEventListener('abort', handleAbort, {
            once: true,
          });
        }
      }
    });

    return promise.finally(() => {
      controller.abort();
    });
  }
}
