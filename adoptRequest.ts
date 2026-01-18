export function adoptRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    function cleanup() {
      request.removeEventListener('success', handleSuccess);
      request.removeEventListener('error', handleError);
    }

    function handleSuccess() {
      cleanup();
      resolve(request.result as T);
    }

    function handleError() {
      cleanup();
      reject(request.error);
    }

    request.addEventListener('success', handleSuccess, { once: true });
    request.addEventListener('error', handleError, { once: true });
  });
}
