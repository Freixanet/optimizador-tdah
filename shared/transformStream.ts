import type { ActionMapData, TransformStreamEvent } from './contracts';
import { normalizeMapData } from './mapData';

export const TRANSFORM_IDLE_TIMEOUT_MS = 60_000;
export const TRANSFORM_IDLE_TIMEOUT_MESSAGE =
  'La generación se ha detenido. Comprueba tu conexión e inténtalo de nuevo.';

export function isRenderablePartialMap(map: ActionMapData | null): boolean {
  if (!map) return false;
  const hasTitle = Boolean(map.title?.trim() && map.title !== 'Mapa sin título');
  const hasCore = Boolean(map.coreIdea?.trim());
  const hasSteps = Boolean(map.steps?.length);
  return (hasTitle && hasCore) || hasSteps;
}

export type TransformStreamHandlers = {
  onPartial?: (map: ActionMapData) => void;
  onDone: (map: ActionMapData, model?: string) => void;
  onError: (message: string) => void;
};

export type ConsumeTransformStreamResult = 'done' | 'error' | 'idle' | 'incomplete' | 'aborted';

function parseStreamLine(line: string): TransformStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as TransformStreamEvent;
  } catch {
    return null;
  }
}

export async function consumeTransformStream(
  response: Response,
  handlers: TransformStreamHandlers,
  options: {
    signal?: AbortSignal;
    idleTimeoutMs?: number;
  } = {}
): Promise<ConsumeTransformStreamResult> {
  const body = response.body;
  if (!body) return 'incomplete';

  const idleTimeoutMs = options.idleTimeoutMs ?? TRANSFORM_IDLE_TIMEOUT_MS;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let idleAborted = false;

  const clearIdle = () => {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const resetIdle = () => {
    clearIdle();
    idleTimer = setTimeout(() => {
      idleAborted = true;
      reader.cancel().catch(() => undefined);
    }, idleTimeoutMs);
  };

  const onExternalAbort = () => {
    idleAborted = true;
    reader.cancel().catch(() => undefined);
  };

  options.signal?.addEventListener('abort', onExternalAbort, { once: true });

  resetIdle();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (idleAborted) {
        return options.signal?.aborted ? 'aborted' : 'idle';
      }

      resetIdle();
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const event = parseStreamLine(line);
        if (!event) continue;

        if (event.type === 'partial' && event.map) {
          const normalized = normalizeMapData(event.map);
          if (normalized && isRenderablePartialMap(normalized)) {
            handlers.onPartial?.(normalized);
          }
          continue;
        }

        if (event.type === 'done' && event.map) {
          const normalized = normalizeMapData(event.map);
          if (!normalized) {
            handlers.onError('No se pudo interpretar el mapa generado.');
            return 'error';
          }
          handlers.onDone(normalized, event.model);
          return 'done';
        }

        if (event.type === 'error') {
          handlers.onError(event.error || 'Error desconocido durante la generación.');
          return 'error';
        }
      }
    }

    return 'incomplete';
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : '';
    if (options.signal?.aborted) {
      return 'aborted';
    }
    if (idleAborted || name === 'AbortError') {
      return 'idle';
    }
    throw err;
  } finally {
    clearIdle();
    options.signal?.removeEventListener('abort', onExternalAbort);
    try {
      reader.releaseLock();
    } catch {
      // ignore
    }
  }
}

export type FetchTransformOptions = {
  streamUrl: string;
  fallbackUrl: string;
  body: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  idleTimeoutMs?: number;
  handlers: TransformStreamHandlers;
};

export async function fetchTransformWithProgress({
  streamUrl,
  fallbackUrl,
  body,
  headers = {},
  signal,
  idleTimeoutMs,
  handlers,
}: FetchTransformOptions): Promise<'stream' | 'fallback'> {
  let receivedRenderablePartial = false;

  const wrappedHandlers: TransformStreamHandlers = {
    onPartial: (map) => {
      receivedRenderablePartial = true;
      handlers.onPartial?.(map);
    },
    onDone: handlers.onDone,
    onError: handlers.onError,
  };

  try {
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/x-ndjson',
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errPayload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(errPayload.error || `Error del servidor (${response.status})`);
    }

    if (!response.body) {
      throw new Error('Streaming no disponible');
    }

    const result = await consumeTransformStream(response, wrappedHandlers, {
      signal,
      idleTimeoutMs,
    });

    if (result === 'done') return 'stream';

    if (result === 'aborted') {
      throw new DOMException('Aborted', 'AbortError');
    }

    if (!receivedRenderablePartial) {
      throw new Error('Streaming incompleto');
    }

    handlers.onError(
      result === 'idle'
        ? TRANSFORM_IDLE_TIMEOUT_MESSAGE
        : 'La generación se interrumpió antes de completarse.'
    );
    return 'stream';
  } catch (err: unknown) {
    if (signal?.aborted) throw err;
    if (receivedRenderablePartial) throw err;

    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    });

    const parsed = (await fallbackResponse.json()) as ActionMapData & { error?: string };
    if (!fallbackResponse.ok || parsed.error) {
      throw new Error(parsed.error || `Error del servidor (${fallbackResponse.status})`);
    }

    const normalized = normalizeMapData(parsed);
    if (!normalized) {
      throw new Error('No se pudo interpretar el mapa generado.');
    }

    wrappedHandlers.onDone(normalized, parsed.modelUsed);
    return 'fallback';
  }
}
