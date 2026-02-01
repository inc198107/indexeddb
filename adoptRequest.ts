export class AdoptRequest<T> {
  private readonly request: IDBRequest<T>;

  constructor(request: IDBRequest<T>) {
    this.request = request;
  }

  toPromise(): Promise<T> {
    const { request } = this;
    const controller = new AbortController();

    const promise = new Promise<T>((resolve, reject) => {
      const handleSuccess = () => {
        controller.abort();
        resolve(request.result as T);
      };

      const handleError = () => {
        controller.abort();
        reject(request.error);
      };

      request.addEventListener('success', handleSuccess, {
        signal: controller.signal,
      });
      request.addEventListener('error', handleError, {
        signal: controller.signal,
      });
    });

    return promise.finally(() => {
      controller.abort();
    });
  }
}
