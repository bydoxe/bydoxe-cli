import { createHmac } from 'node:crypto';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RestSignatureInput {
  timestamp: string;
  method: HttpMethod;
  requestPath: string;
  queryString?: string;
  body?: string;
  secretKey: string;
}

export interface WebSocketLoginSignatureInput {
  timestamp: string;
  secretKey: string;
}

export function signRestRequest(input: RestSignatureInput): string {
  const method = input.method.toUpperCase() as HttpMethod;
  const body = input.body ?? '';
  const queryString = normalizeQueryString(input.queryString);
  const pathWithQuery =
    method === 'GET' && queryString.length > 0
      ? `${input.requestPath}?${queryString}`
      : input.requestPath;
  const message = `${input.timestamp}${method}${pathWithQuery}${body}`;

  return hmacSha256Base64(input.secretKey, message);
}

export function signWebSocketLogin(
  input: WebSocketLoginSignatureInput,
): string {
  return hmacSha256Base64(input.secretKey, `${input.timestamp}GET/user/verify`);
}

export function hmacSha256Base64(secretKey: string, message: string): string {
  return createHmac('sha256', secretKey).update(message).digest('base64');
}

function normalizeQueryString(queryString?: string): string {
  if (!queryString) return '';
  return queryString.startsWith('?') ? queryString.slice(1) : queryString;
}
