export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  timeoutMessage?: string;
};

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 20000,
    timeoutMessage = 'La conexión está tardando demasiado. Inténtalo de nuevo.',
  } = options;

  const controller = new AbortController();
  const { signal } = init;

  let didTimeout = false;
  let externalAbortListener: (() => void) | null = null;

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      externalAbortListener = () => {
        controller.abort();
      };
      signal.addEventListener('abort', externalAbortListener, { once: true });
    }
  }

  const timer = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (didTimeout) {
      throw new Error(timeoutMessage);
    }
    if (err && err.name === 'AbortError') {
      if (signal?.aborted) {
        throw err;
      }
      throw new Error(timeoutMessage);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    if (signal && externalAbortListener) {
      signal.removeEventListener('abort', externalAbortListener);
    }
  }
}
