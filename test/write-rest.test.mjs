import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertWriteConfirmed,
  findWriteRestCommand,
} from '../dist/commands/write-rest.js';
import { parseArgs } from '../dist/commands/public-rest.js';
import { loadConfig } from '../dist/config/load-config.js';
import { buildRequest } from '../dist/http/request.js';

const config = loadConfig({
  BYDOXE_ACCESS_KEY: 'access',
  BYDOXE_SECRET_KEY: 'secret',
  BYDOXE_PASSPHRASE: 'passphrase',
  BYDOXE_REST_BASE_URL: 'https://example.test/api/v1',
});

test('write command builds body from flags', () => {
  const parsed = parseArgs([
    'future',
    'account',
    'set-leverage',
    '--symbol',
    'BTCUSDT',
    '--longLeverage',
    '5',
    '--shortLeverage',
    '5',
    '--dry-run',
    '--format',
    'json',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/account/set-leverage');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    longLeverage: '5',
    shortLeverage: '5',
  });
});

test('write command builds body from JSON body flag', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'place-order',
    '--body',
    '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    orderType: 'MARKET',
    tradeType: 'BUY',
    amount: '0.001',
  });

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

  assert.equal(request.method, 'POST');
  assert.equal(request.requestPath, '/spot/trade/place-order');
  assert.equal(
    request.body,
    '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
  );
  assert.ok(request.headers['ACCESS-SIGN']);
});

test('write command rejects missing required body parameters', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'place-order',
    '--body',
    '{"symbol":"BTCUSDT","amount":"0.001"}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /Missing required parameters for bydoxe spot trade place-order: orderType, tradeType/,
  );
});

test('write command execution requires exact confirmation token', () => {
  assert.throws(() => assertWriteConfirmed({}), /--confirm CONFIRM/);
  assert.throws(
    () => assertWriteConfirmed({ confirm: 'confirm' }),
    /--confirm CONFIRM/,
  );
  assert.doesNotThrow(() => assertWriteConfirmed({ confirm: 'CONFIRM' }));
});

test('copy trading trader close positions command builds body from flags', () => {
  const parsed = parseArgs([
    'copytrading',
    'trader',
    'close-positions',
    '--symbol',
    'BTCUSDT',
    '--trackingNo',
    'track-1',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/copy/mix-trader/order-close-positions');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    trackingNo: 'track-1',
  });
  assert.match(match.definition.risk, /Closes copy trading trader positions/);
});

test('copy trading follower cancel follow command maps to cancel endpoint', () => {
  const parsed = parseArgs([
    'copytrading',
    'follower',
    'cancel-follow',
    '--traderId',
    'trader-1',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/copy/mix-follower/cancel-follow');
  assert.deepEqual(match.body, {
    traderId: 'trader-1',
  });
});
