import { signRestRequest, type HttpMethod } from '../auth/signature.js';
import type { BydoxeConfig } from '../config/load-config.js';

export interface RequestOptions {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  privateRequest?: boolean;
}

export interface BuiltRequest {
  method: HttpMethod;
  url: string;
  requestPath: string;
  queryString: string;
  body: string;
  headers: Record<string, string>;
}

export function buildRequest(
  config: BydoxeConfig,
  options: RequestOptions,
  now: () => number = Date.now,
): BuiltRequest {
  const requestPath = normalizePath(options.path);
  const queryString = encodeQuery(options.query);
  const body = options.body === undefined ? '' : JSON.stringify(options.body);
  const url = `${trimTrailingSlash(config.restBaseUrl)}${requestPath}${
    queryString ? `?${queryString}` : ''
  }`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.privateRequest) {
    if (!config.accessKey || !config.secretKey || !config.passphrase) {
      throw new Error('Private requests require BYDOXE API credentials.');
    }

    const timestamp = String(now());
    headers['ACCESS-KEY'] = config.accessKey;
    headers['ACCESS-TIMESTAMP'] = timestamp;
    headers['ACCESS-PASSPHRASE'] = config.passphrase;
    headers['ACCESS-SIGN'] = signRestRequest({
      timestamp,
      method: options.method,
      requestPath,
      queryString,
      body,
      secretKey: config.secretKey,
    });
  }

  return {
    method: options.method,
    url,
    requestPath,
    queryString,
    body,
    headers,
  };
}

function encodeQuery(
  query: Record<string, string | number | boolean | undefined> = {},
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

function normalizePath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
