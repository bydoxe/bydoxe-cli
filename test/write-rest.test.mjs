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

test('write command rejects invalid numeric and enum body parameters', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'place-order',
    '--body',
    '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"HOLD","amount":"0"}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /Invalid parameters for bydoxe spot trade place-order: amount must be a positive number; tradeType must be one of BUY, SELL/,
  );
});

test('write command accepts lowercase enum body parameters', () => {
  const parsed = parseArgs([
    'future',
    'order',
    'place',
    '--body',
    '{"symbol":"BTCUSDT","side":"buy","orderType":"limit","size":"0.01","holdSide":"long"}',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/place-order');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    side: 'buy',
    orderType: 'limit',
    size: '0.01',
    holdSide: 'long',
  });
});

test('write cancel and modify commands require an order identifier when supported', () => {
  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'spot',
      'trade',
      'cancel-order',
      '--symbol',
      'BTCUSDT',
      '--dry-run',
    ])),
    /Invalid parameter for bydoxe spot trade cancel-order: one of orderId, clientOid is required/,
  );

  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'future',
      'trigger',
      'modify',
      '--body',
      '{"symbol":"BTCUSDT","triggerPrice":"62000"}',
      '--dry-run',
    ])),
    /Invalid parameter for bydoxe future trigger modify: one of orderId, clientOid is required/,
  );
});

test('spot batch order command validates nested order items', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'batch-orders',
    '--body',
    '{"orders":[{"symbol":"BTCUSDT","orderType":"TRAILING","amount":"0"},{"orderType":"LIMIT","tradeType":"BUY","amount":"0.01"}]}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /orders\[0\]\.amount must be a positive number; orders\[0\]\.orderType must be one of MARKET, LIMIT; orders\[1\]\.symbol is required/,
  );
});

test('spot batch cancel replace command requires nested identifiers', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'batch-cancel-replace-order',
    '--body',
    '{"orders":[{"symbol":"BTCUSDT","orderType":"LIMIT","tradeType":"BUY","amount":"0.01"}]}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /one of orders\[0\]\.orderId, orders\[0\]\.clientOid is required/,
  );
});

test('future batch place command accepts valid nested order items', () => {
  const parsed = parseArgs([
    'future',
    'order',
    'batch-place',
    '--body',
    '{"orders":[{"symbol":"BTCUSDT","side":"BUY","orderType":"LIMIT","size":"0.01","price":"60000","holdSide":"LONG"}]}',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/batch-place-order');
  assert.deepEqual(match.body, {
    orders: [
      {
        symbol: 'BTCUSDT',
        side: 'BUY',
        orderType: 'LIMIT',
        size: '0.01',
        price: '60000',
        holdSide: 'LONG',
      },
    ],
  });
});

test('batch cancel commands require a non-empty identifier array', () => {
  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'future',
      'order',
      'batch-cancel',
      '--body',
      '{"symbol":"BTCUSDT","orderIds":[]}',
      '--dry-run',
    ])),
    /one of orderIds\[\], clientOids\[\] must be a non-empty array/,
  );

  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'spot',
      'trade',
      'batch-cancel-orders',
      '--body',
      '{"symbol":"BTCUSDT","orderIds":[""]}',
      '--dry-run',
    ])),
    /one of orderIds\[\], clientOids\[\] must be a non-empty array; orderIds\[\] must contain only usable string or number values/,
  );

  const match = findWriteRestCommand(parseArgs([
    'future',
    'order',
    'batch-cancel',
    '--body',
    '{"symbol":"BTCUSDT","clientOids":["client-1"]}',
    '--dry-run',
  ]));

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/batch-cancel-orders');
});

test('write command rejects invalid non-empty string parameters', () => {
  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'copytrading',
      'follower',
      'cancel-follow',
      '--body',
      '{"traderId":123}',
      '--dry-run',
    ])),
    /traderId must be a non-empty string/,
  );

  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'copytrading',
      'trader',
      'close-positions',
      '--body',
      '{"symbol":"BTCUSDT","trackingNo":99}',
      '--dry-run',
    ])),
    /trackingNo must be a non-empty string/,
  );
});

test('cancel withdraw command accepts supported withdrawal identifiers', () => {
  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'spot',
      'account',
      'cancel-withdraw',
      '--body',
      '{}',
      '--dry-run',
    ])),
    /one of withdrawId, orderId, clientOid is required/,
  );

  const match = findWriteRestCommand(parseArgs([
    'spot',
    'account',
    'cancel-withdraw',
    '--body',
    '{"withdrawId":"withdrawal-id"}',
    '--dry-run',
  ]));

  assert.ok(match);
  assert.equal(match.definition.path, '/spot/account/cancel-withdraw');
  assert.deepEqual(match.body, {
    withdrawId: 'withdrawal-id',
  });
});

test('futures tpsl command validates plan type and trigger price', () => {
  const parsed = parseArgs([
    'future',
    'tpsl',
    'place',
    '--body',
    '{"symbol":"BTCUSDT","planType":"TRAILING","triggerPrice":"-1"}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /Invalid parameters for bydoxe future tpsl place: triggerPrice must be a positive number; planType must be one of TAKE_PROFIT, STOP_LOSS/,
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
