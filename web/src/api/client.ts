type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

const cache = new Map<string, Promise<unknown>>();

declare global {
  interface Window {
    PULSE_API_BASE?: string;
    AndroidConfig?: { getApiBaseUrl?: () => string };
  }
}

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function configuredApiBase() {
  if (window.PULSE_API_BASE) return window.PULSE_API_BASE.replace(/\/$/, '');
  if (window.AndroidConfig?.getApiBaseUrl) {
    const nativeValue = window.AndroidConfig.getApiBaseUrl();
    if (nativeValue) return nativeValue.replace(/\/$/, '');
  }
  return window.location.hostname === 'appassets.androidplatform.net' ? null : '';
}

export const isOfflineAndroidBuild = configuredApiBase() === null;

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const base = configuredApiBase();
  if (base === null) throw new ApiError('This offline build is not connected to a catalog service.');
  const requestPath = `${base}${path}`;
  const key = requestPath;
  if (!signal && cache.has(key)) return cache.get(key) as Promise<T>;

  async function makeRequest() {
    const response = await fetch(requestPath, { headers: { Accept: 'application/json' }, signal });
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
