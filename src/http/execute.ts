import { CliError } from '../errors/cli-error.js';
import type { BuiltRequest } from './request.js';

export interface HttpResult {
  status: number;
  headers: Record<string, string>;
  data: unknown;
}

export type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  },
) => Promise<{
  ok: boolean;
  status: number;
  headers: Headers;
  text(): Promise<string>;
}>;

export async function executeRequest(
  request: BuiltRequest,
  fetchImpl: FetchLike = fetch,
): Promise<HttpResult> {
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body || undefined,
  });
  const text = await response.text();
  const data = parseResponseBody(text);
  const result = {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    data,
  };

  if (!response.ok) {
    throw new CliError(
      `BYDOXE request failed with HTTP status ${response.status}.`,
    );
  }

  return result;
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
