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
