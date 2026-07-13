import assert from 'node:assert/strict';
import test from 'node:test';
import {
  commandToString,
  findPublicRestCommand,
  parseArgs,
  PUBLIC_REST_COMMANDS,
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

test('spot market history-candles command maps to historical candles endpoint', () => {
  const parsed = parseArgs([
    'spot',
    'market',
    'history-candles',
    '--symbol',
    'BTCUSDT',
    '--granularity',
    '1m',
    '--limit',
    '100',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/spot/market/history-candles');
  assert.deepEqual(match.definition.requiredParams, ['symbol', 'granularity']);
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    granularity: '1m',
    limit: '100',
  });
});

test('future market depth command includes metadata for symbol and limit', () => {
  const parsed = parseArgs([
    'future',
    'market',
    'depth',
    '--symbol',
    'BTCUSDT',
    '--limit',
    '500',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/market/depth');
  assert.deepEqual(match.definition.requiredParams, ['symbol']);
  assert.deepEqual(match.definition.optionalParams, ['limit']);
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    limit: '500',
  });
});

test('future market ratio command requires symbol and period metadata', () => {
  const parsed = parseArgs([
    'future',
    'market',
    'taker-buy-sell',
    '--symbol',
    'BTCUSDT',
    '--period',
    '1h',
  ]);
  const match = findPublicRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/market/taker-buy-sell');
  assert.deepEqual(match.definition.requiredParams, ['symbol', 'period']);
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    period: '1h',
  });
});

test('public REST command rejects missing required parameters', () => {
  const parsed = parseArgs(['future', 'market', 'depth', '--dry-run']);

  assert.throws(
    () => findPublicRestCommand(parsed),
    /Missing required parameter for bydoxe future market depth: symbol/,
  );
});

test('public REST registry includes expanded market data commands', () => {
  const commands = new Set(
    PUBLIC_REST_COMMANDS.map((command) => command.command.join(' ')),
  );

  for (const command of [
    'spot market coins',
    'spot market history-candles',
    'spot market fills',
    'spot market fills-history',
    'future market book-ticker',
    'future market depth',
    'future market candles',
    'future market funding-info',
    'future market open-interest',
    'future market fills',
    'future market fills-history',
    'future market history-fund-rate',
    'future market history-candles',
    'future market history-index-candles',
    'future market history-mark-candles',
    'future market taker-buy-sell',
    'future market account-long-short',
    'future market top-trader-position-long-short',
    'future market top-trader-account-long-short',
    'future market query-position-tier',
  ]) {
    assert.ok(commands.has(command), `Missing public REST command: ${command}`);
  }
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
