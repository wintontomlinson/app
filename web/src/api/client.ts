type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const cache = new Map<string, Promise<unknown>>();

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const key = path;
  if (!signal && cache.has(key)) return cache.get(key) as Promise<T>;

  async function makeRequest() {
    const response = await fetch(path, { headers: { Accept: 'application/json' }, signal });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!response.ok || !payload?.success) throw new ApiError(payload?.message || 'Unable to reach the music service.', response.status);
    return payload.data;
  }
  const request = (async () => {
    try { return await makeRequest(); }
    catch (error) {
      if (signal || (error instanceof ApiError && error.status && error.status < 500)) throw error;
      return makeRequest();
    }
  })();

  if (!signal) {
    cache.set(key, request);
    request.catch(() => cache.delete(key));
  }
  return request;
}

export function clearApiCache(prefix?: string) {
  for (const key of cache.keys()) if (!prefix || key.startsWith(prefix)) cache.delete(key);
}
