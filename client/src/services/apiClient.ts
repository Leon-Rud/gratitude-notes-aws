import { API_BASE_URL, API_KEY, MISSING_CONFIG_MESSAGE } from '../config/constants';

export type HttpMethod = 'GET' | 'PUT' | 'DELETE';

export type ApiResponse<T> = {
  data: T;
  status: number;
};

type Options = {
  body?: Record<string, unknown>;
  allowedStatuses?: number[];
  signal?: AbortSignal;
  timeoutMs?: number;
};

export async function callApi<T>(path: string, method: HttpMethod, opts: Options = {}): Promise<ApiResponse<T>> {
  if (!API_BASE_URL || !API_KEY) {
    throw new Error(MISSING_CONFIG_MESSAGE);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);

  const headers: HeadersInit = { 'x-api-key': API_KEY };
  const init: RequestInit = {
    method,
    headers,
    signal: opts.signal ?? controller.signal
  };

  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(opts.body ?? {});
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init);
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as T) : ({} as T);

    const allowed = new Set(opts.allowedStatuses ?? []);
    if (!response.ok && !allowed.has(response.status)) {
      const message = (payload as { message?: string }).message ?? `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return { data: payload, status: response.status };
  } finally {
    clearTimeout(timeout);
  }
}
