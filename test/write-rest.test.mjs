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
    '{"base":"BTC","quote":"USDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.deepEqual(match.body, {
    base: 'BTC',
    quote: 'USDT',
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
    '{"base":"BTC","quote":"USDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
  );
  assert.ok(request.headers['ACCESS-SIGN']);
});

test('write command rejects missing required body parameters', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'place-order',
    '--body',
    '{"base":"BTC","quote":"USDT","amount":"0.001"}',
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
    '{"base":"BTC","quote":"USDT","orderType":"MARKET","tradeType":"HOLD","amount":"0"}',
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
    '{"symbol":"BTCUSDT","marginMode":"CROSS","side":"long","tradeSide":"open","orderType":"limit","size":"0.01"}',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/place-order');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    marginMode: 'CROSS',
    side: 'long',
    tradeSide: 'open',
    orderType: 'limit',
    size: '0.01',
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
    /Missing required parameter for bydoxe spot trade cancel-order: orderId/,
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
    '{"orderList":[{"side":"BUY","orderType":"TRAILING","size":"0"},{"orderType":"LIMIT","size":"0.01"}]}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /orderList\[0\]\.size must be a positive number; orderList\[0\]\.orderType must be one of MARKET, LIMIT; orderList\[1\]\.side is required/,
  );
});

test('spot batch cancel replace command requires nested identifiers', () => {
  const parsed = parseArgs([
    'spot',
    'trade',
    'batch-cancel-replace-order',
    '--body',
    '{"orderList":[{"symbol":"BTCUSDT","price":"60000","size":"0.01"}]}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /orderList\[0\]\.orderId is required/,
  );
});

test('future batch place command accepts valid nested order items', () => {
  const parsed = parseArgs([
    'future',
    'order',
    'batch-place',
    '--body',
    '{"symbol":"BTCUSDT","marginMode":"CROSS","orderList":[{"side":"LONG","tradeSide":"OPEN","orderType":"LIMIT","size":"0.01","price":"60000"}]}',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/batch-place-order');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    marginMode: 'CROSS',
    orderList: [
      {
        side: 'LONG',
        tradeSide: 'OPEN',
        orderType: 'LIMIT',
        size: '0.01',
        price: '60000',
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
      '{"orderIdList":[{}]}',
      '--dry-run',
    ])),
    /one of orderIdList\[0\]\.orderId, orderIdList\[0\]\.clientOid is required/,
  );

  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'spot',
      'trade',
      'batch-cancel-orders',
      '--body',
      '{"symbol":"BTCUSDT","orderList":[{"orderId":""}]}',
      '--dry-run',
    ])),
    /orderList\[0\]\.orderId is required/,
  );

  const match = findWriteRestCommand(parseArgs([
    'future',
    'order',
    'batch-cancel',
    '--body',
    '{"orderIdList":[{"clientOid":"client-1"}]}',
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
      '{"productType":"USDT-FUTURES","traderUid":123}',
      '--dry-run',
    ])),
    /traderUid must be a non-empty string/,
  );

  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'copytrading',
      'trader',
      'close-positions',
      '--body',
      '{"symbol":"BTCUSDT","productType":"USDT-FUTURES","trackingNo":99}',
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
    /Missing required parameter for bydoxe spot account cancel-withdraw: orderId/,
  );

  const match = findWriteRestCommand(parseArgs([
    'spot',
    'account',
    'cancel-withdraw',
    '--body',
    '{"orderId":"withdrawal-id"}',
    '--dry-run',
  ]));

  assert.ok(match);
  assert.equal(match.definition.path, '/spot/account/cancel-withdraw');
  assert.deepEqual(match.body, {
    orderId: 'withdrawal-id',
  });
});

test('futures tpsl command validates plan type and trigger price', () => {
  const parsed = parseArgs([
    'future',
    'tpsl',
    'place',
    '--body',
    '{"symbol":"BTCUSDT","planType":"TRAILING","holdSide":"LONG","orderType":"MARKET","triggerPrice":"-1","triggerPriceType":"LAST","size":"0.01"}',
    '--dry-run',
  ]);

  assert.throws(
    () => findWriteRestCommand(parsed),
    /Invalid parameters for bydoxe future tpsl place: triggerPrice must be a positive number; planType must be one of TAKE_PROFIT, STOP_LOSS/,
  );
});

test('futures tpsl cancel command validates nested order identifiers', () => {
  assert.throws(
    () => findWriteRestCommand(parseArgs([
      'future',
      'tpsl',
      'cancel',
      '--body',
      '{"symbol":"BTCUSDT","orderIdList":[{}]}',
      '--dry-run',
    ])),
    /one of orderIdList\[0\]\.orderId, orderIdList\[0\]\.clientOid is required/,
  );

  const match = findWriteRestCommand(parseArgs([
    'future',
    'tpsl',
    'cancel',
    '--body',
    '{"symbol":"BTCUSDT","orderIdList":[{"orderId":"tpsl-1"}]}',
    '--dry-run',
  ]));

  assert.ok(match);
  assert.equal(match.definition.path, '/future/order/cancel-tpsl-order');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    orderIdList: [{ orderId: 'tpsl-1' }],
  });
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
    '--productType',
    'USDT-FUTURES',
    '--dry-run',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/copy/mix-trader/order-close-positions');
  assert.deepEqual(match.body, {
    symbol: 'BTCUSDT',
    trackingNo: 'track-1',
    productType: 'USDT-FUTURES',
  });
  assert.match(match.definition.risk, /Closes copy trading trader positions/);
});

test('copy trading follower cancel follow command maps to cancel endpoint', () => {
  const parsed = parseArgs([
    'copytrading',
    'follower',
    'cancel-follow',
    '--productType',
    'USDT-FUTURES',
    '--traderUid',
    'trader-1',
  ]);
  const match = findWriteRestCommand(parsed);

  assert.ok(match);
  assert.equal(match.definition.path, '/copy/mix-follower/cancel-follow');
  assert.deepEqual(match.body, {
    productType: 'USDT-FUTURES',
    traderUid: 'trader-1',
  });
});
