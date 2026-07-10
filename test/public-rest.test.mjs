import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commandToString,
  findPublicRestCommand,
  parseArgs,
} from '../dist/commands/public-rest.js';
import { loadConfig } from '../dist/config/load-config.js';
import { executeRequest } from '../dist/http/execute.js';
import { buildRequest } from '../dist/http/request.js';

const config = loadConfig({
  BYDOXE_REST_BASE_URL: 'https://example.test/api/v1',
});

test('spot market tickers command builds a query URL', () => {
  const parsed = parseArgs([
    'spot',
    'market',
    'tickers',
    '--symbol',
    'BTCUSDT',
    '--format',
    'json',
    '--dry-run',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/spot/market/tickers');
  assert.deepEqual(match.query, { symbol: 'BTCUSDT' });
  assert.equal(commandToString(parsed.command), 'bydoxe spot market tickers');

  const request = buildRequest(config, {
    method: match.definition.method,
    path: match.definition.path,
    query: match.query,
  });

  assert.equal(
    request.url,
    'https://example.test/api/v1/spot/market/tickers?symbol=BTCUSDT',
  );
});

test('spot candles command forwards non-global flags as query parameters', () => {
  const parsed = parseArgs([
    'spot',
    'market',
    'candles',
    '--symbol',
    'BTCUSDT',
    '--granularity',
    '1m',
    '--limit',
    '100',
    '--base-url',
    'https://ignored.example',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    granularity: '1m',
    limit: '100',
  });

  const request = buildRequest(config, {
    method: match.definition.method,
    path: match.definition.path,
    query: match.query,
  });

  assert.equal(
    request.url,
    'https://example.test/api/v1/spot/market/candles?symbol=BTCUSDT&granularity=1m&limit=100',
  );
});

test('future market ticker maps to the 24h ticker endpoint', () => {
  const parsed = parseArgs([
    'future',
    'market',
    'ticker',
    '--symbol',
    'BTCUSDT',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/market/24h-ticker');
});

test('executeRequest uses a mocked fetch implementation', async () => {
  const request = buildRequest(config, {
    method: 'GET',
    path: '/public/time',
  });
  const calls = [];
  const result = await executeRequest(request, async (input, init) => {
    calls.push({ input, init });
    return {
      ok: true,
      status: 200,
      headers: new Headers([['content-type', 'application/json']]),
      async text() {
        return JSON.stringify({
          code: '00000',
          msg: 'success',
          data: { serverTime: 1659076670000 },
        });
      },
    };
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, 'https://example.test/api/v1/public/time');
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, {
    code: '00000',
    msg: 'success',
    data: { serverTime: 1659076670000 },
  });
});
