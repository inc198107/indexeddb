import type { IDBEventMap, IDBTarget, OnOptions, OnceOptions } from './types';

export type { IDBEventMap, IDBTarget, OnOptions, OnceOptions } from './types';

export function once<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
  eventTarget: T,
  eventName: K,
  options?: OnceOptions,
): Promise<IDBEventMap<T>[K]>;

export function once<T extends Event = Event>(
  eventTarget: EventTarget,
  eventName: string,
  options?: OnceOptions,
): Promise<T>;

export function on<T extends IDBTarget, K extends keyof IDBEventMap<T>>(
  eventTarget: T,
  eventName: K,
  options?: OnOptions,
): AsyncIterableIterator<IDBEventMap<T>[K]>;

export function on<T extends Event = Event>(
  eventTarget: EventTarget,
  eventName: string,
  options?: OnOptions,
): AsyncIterableIterator<T>;

export function adoptRequest<T>(request: IDBRequest<T>): Promise<T>;
