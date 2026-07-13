import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArgs } from '../dist/commands/public-rest.js';
import {
  assertPrivateWebSocketLiveBlocked,
  assertWebSocketConfirmed,
  findWebSocketCommand,
  redactWebSocketPreview,
} from '../dist/commands/websocket.js';
import { loadConfig } from '../dist/config/load-config.js';

const publicConfig = loadConfig({
  BYDOXE_PUBLIC_WS_URL: 'wss://example.test/v1/ws/public',
});

const privateConfig = loadConfig({
  BYDOXE_ACCESS_KEY: 'access',
  BYDOXE_SECRET_KEY: 'secret',
  BYDOXE_PASSPHRASE: 'passphrase',
  BYDOXE_PRIVATE_WS_URL: 'wss://example.test/v1/ws/private',
});

test('public WebSocket subscribe builds a channel message preview', () => {
  const parsed = parseArgs([
    'websocket',
    'public',
    'subscribe',
    '--instType',
    'SPOT',
    '--channel',
    'ticker',
    '--instId',
    'BTCUSDT',
    '--dry-run',
  ]);
  const match = findWebSocketCommand(parsed, publicConfig);

  assert.ok(match);
  assert.equal(match.preview.connection.url, 'wss://example.test/v1/ws/public');
  assert.deepEqual(match.preview.metadata, {
    auth: 'public',
    riskLevel: 'low',
    requiredParams: [],
    optionalParams: [],
    parameterMode: 'message',
  });
  assert.deepEqual(match.preview.message, {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'ticker',
        instId: 'BTCUSDT',
      },
    ],
  });
});

test('private WebSocket login signs and redacts credential fields', () => {
  const parsed = parseArgs(['websocket', 'private', 'login', '--dry-run']);
  const match = findWebSocketCommand(parsed, privateConfig, () => 1659076670000);

  assert.ok(match);
  assert.equal(match.preview.connection.url, 'wss://example.test/v1/ws/private');
  assert.equal(match.preview.message.args.apiKey, 'access');
  assert.equal(match.preview.message.args.passphrase, 'passphrase');
  assert.equal(match.preview.message.args.timestamp, '1659076670000');
  assert.ok(match.preview.message.args.sign);

  const redacted = redactWebSocketPreview(match.preview);
  assert.deepEqual(redacted.message, {
    op: 'login',
    args: {
      apiKey: '<redacted>',
      passphrase: '<redacted>',
      timestamp: '1659076670000',
      sign: '<redacted>',
    },
  });
});

test('private WebSocket spot trade builds params from flags', () => {
  const parsed = parseArgs([
    'websocket',
    'private',
    'spot',
    'trade',
    '--instId',
    'BTCUSDT',
    '--side',
    'buy',
    '--orderType',
    'limit',
    '--size',
    '0.01',
    '--price',
    '60000',
    '--dry-run',
  ]);
  const match = findWebSocketCommand(parsed, privateConfig);

  assert.ok(match);
  assert.equal(match.preview.requiresConfirm, true);
  assert.equal(match.preview.confirmToken, 'CONFIRM');
  assert.equal(match.preview.metadata.riskLevel, 'high');
  assert.equal(match.preview.metadata.parameterMode, 'message');
  assert.deepEqual(match.preview.message, {
    op: 'trade',
    args: [
      {
        instType: 'SPOT',
        instId: 'BTCUSDT',
        channel: 'place-order',
        params: {
          side: 'buy',
          orderType: 'limit',
          size: '0.01',
          price: '60000',
        },
      },
    ],
  });
});

test('private WebSocket spot trade execution requires exact confirmation token', () => {
  assert.throws(() => assertWebSocketConfirmed({}), /--confirm CONFIRM/);
  assert.throws(
    () => assertWebSocketConfirmed({ confirm: 'confirm' }),
    /--confirm CONFIRM/,
  );
  assert.doesNotThrow(() => assertWebSocketConfirmed({ confirm: 'CONFIRM' }));
});

test('private WebSocket live execution exposes the safety gate policy', () => {
  assert.throws(
    () => assertPrivateWebSocketLiveBlocked(['websocket', 'private', 'subscribe']),
    /Private WebSocket live execution is intentionally disabled.*authenticated login handshake verification.*exact CONFIRM.*opt-in environment gate/,
  );
});
