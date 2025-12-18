export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type ApiResponse<T> = {
  data: T;
  status: number;
};

type Options = {
  body?: Record<string, unknown>;
};

const rawApiBase = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.trim();
const API_BASE_URL = rawApiBase ? rawApiBase.replace(/\/+$/, "") : undefined;
const MISSING_CONFIG_MESSAGE =
  "API is not configured. Please set VITE_API_BASE_URL.";

export async function callApi<T>(
  path: string,
  method: HttpMethod,
  opts: Options = {},
): Promise<ApiResponse<T>> {
  if (!API_BASE_URL) {
    throw new Error(MISSING_CONFIG_MESSAGE);
  }

  // cancells the request after 15 sec
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const headers: HeadersInit = {};
  const init: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (method !== "GET") {
    headers["Content-Type"] = "application/json";
    if (opts.body !== undefined) {
      init.body = JSON.stringify(opts.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init);
    const text = await response.text();
    const payload = text ? (JSON.parse(text) as T) : ({} as T);

    if (!response.ok) {
      const candidate = (payload as { message?: unknown }).message;
      const message =
        typeof candidate === "string"
          ? candidate
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return { data: payload, status: response.status };
  } catch (e) {
    // Handle timeout aborts (our AbortController timeout triggers AbortError)
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(
        "Unable to connect to the service. Please check your internet connection and try again in a moment.",
      );
    }
    if (e instanceof SyntaxError) {
      throw new Error("Invalid JSON response from server.");
    }
    // Re-throw other errors (including our custom Error objects)
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
