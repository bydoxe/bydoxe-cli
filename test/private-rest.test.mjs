import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findPrivateRestCommand,
  redactPrivateRequest,
} from '../dist/commands/private-rest.js';
import { parseArgs } from '../dist/commands/public-rest.js';
import { loadConfig } from '../dist/config/load-config.js';
import { buildRequest } from '../dist/http/request.js';

const config = loadConfig({
  BYDOXE_ACCESS_KEY: 'access',
  BYDOXE_SECRET_KEY: 'secret',
  BYDOXE_PASSPHRASE: 'passphrase',
  BYDOXE_REST_BASE_URL: 'https://example.test/api/v1',
});

test('account funding-assets command builds a signed private request', () => {
  const parsed = parseArgs([
    'account',
    'funding-assets',
    '--coin',
    'USDT',
    '--dry-run',
    '--format',
    'json',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/account/funding-assets');
  assert.deepEqual(match.query, { coin: 'USDT' });

  const request = buildRequest(
    config,
    {
      method: match.definition.method,
      path: match.definition.path,
      query: match.query,
      privateRequest: true,
    },
    () => 1659076670000,
  );

  assert.equal(
    request.url,
    'https://example.test/api/v1/account/funding-assets?coin=USDT',
  );
  assert.equal(request.headers['ACCESS-KEY'], 'access');
  assert.equal(request.headers['ACCESS-PASSPHRASE'], 'passphrase');
  assert.equal(request.headers['ACCESS-TIMESTAMP'], '1659076670000');
  assert.ok(request.headers['ACCESS-SIGN']);
});

test('private request dry-run redacts credential-bearing headers', () => {
  const request = buildRequest(
    config,
    {
      method: 'GET',
      path: '/future/position/all-position',
      privateRequest: true,
    },
    () => 1659076670000,
  );
  const redacted = redactPrivateRequest(request);

  assert.equal(redacted.headers['ACCESS-KEY'], '<redacted>');
  assert.equal(redacted.headers['ACCESS-SIGN'], '<redacted>');
  assert.equal(redacted.headers['ACCESS-PASSPHRASE'], '<redacted>');
  assert.equal(redacted.headers['ACCESS-TIMESTAMP'], '1659076670000');
});

test('future order history command forwards query parameters', () => {
  const parsed = parseArgs([
    'future',
    'order',
    'orders-history',
    '--symbol',
    'BTCUSDT',
    '--limit',
    '100',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/orders-history');
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    limit: '100',
  });
});

test('spot order-info command builds a signed read-only POST body', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'order-info',
    '--orderId',
    '123456789',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/spot/trade/order-info');
  assert.equal(match.definition.method, 'POST');
  assert.deepEqual(match.body, { orderId: '123456789' });

  const request = buildRequest(
    config,
    {
      method: match.definition.method,
      path: match.definition.path,
      body: match.body,
      privateRequest: true,
    },
    () => 1659076670000,
  );

  assert.equal(request.url, 'https://example.test/api/v1/spot/trade/order-info');
  assert.equal(request.body, '{"orderId":"123456789"}');
  assert.ok(request.headers['ACCESS-SIGN']);
});

test('future trigger plan read commands require limit and forward query parameters', () => {
  const parsed = parseArgs([
    'future',
    'trigger',
    'orders-history',
    '--symbol',
    'BTCUSDT',
    '--limit',
    '100',
    '--clientOid',
    'client-1',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/orders-plan-history');
  assert.deepEqual(match.query, {
    symbol: 'BTCUSDT',
    limit: '100',
    clientOid: 'client-1',
  });

  assert.throws(
    () => findPrivateRestCommand(parseArgs(['future', 'trigger', 'orders-pending'])),
    /Missing required parameter for bydoxe future trigger orders-pending: limit/,
  );
});

test('copy trading trader followers command forwards query parameters', () => {
  const parsed = parseArgs([
    'copytrading',
    'trader',
    'followers',
    '--pageNo',
    '1',
    '--pageSize',
    '20',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/copy/mix-trader/query-followers');
  assert.deepEqual(match.query, {
    pageNo: '1',
    pageSize: '20',
  });
});

test('copy trading follower settings command maps to follower settings endpoint', () => {
  const parsed = parseArgs([
    'copytrading',
    'follower',
    'settings',
    '--traderId',
    'trader-1',
  ]);
  const match = findPrivateRestCommand(parsed);

  assert.ok(match);
  assert.equal(
    match.definition.path,
    '/copy/mix-follower/query-copy-trade-settings',
  );
  assert.deepEqual(match.query, {
    traderId: 'trader-1',
  });
});

test('private read command rejects missing required parameters', () => {
  const parsed = parseArgs(['future', 'position', 'single', '--dry-run']);

  assert.throws(
    () => findPrivateRestCommand(parsed),
    /Missing required parameter for bydoxe future position single: symbol/,
  );
});

test('private read-like body command rejects missing required parameters', () => {
  const parsed = parseArgs(['spot', 'trade', 'order-info', '--dry-run']);

  assert.throws(
    () => findPrivateRestCommand(parsed),
    /Missing required parameter for bydoxe spot trade order-info: orderId/,
  );
});
