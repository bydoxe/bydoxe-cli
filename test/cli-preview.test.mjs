import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import test from 'node:test';
import process from 'node:process';

const cliArgs = ['dist/cli.js'];

test('public REST dry-run output includes command metadata', () => {
  const preview = runCliJson([
    'future',
    'market',
    'depth',
    '--symbol',
    'BTCUSDT',
    '--dry-run',
    '--format',
    'json',
  ]);

  assert.equal(preview.dryRun, true);
  assert.deepEqual(preview.metadata, {
    auth: 'public',
    riskLevel: 'low',
    requiredParams: ['symbol'],
    optionalParams: ['limit'],
    parameterMode: 'query',
  });
});

test('write dry-run output includes high-risk metadata', () => {
  const preview = runCliJson([
    'spot',
    'trade',
    'place-order',
    '--body',
    '{"base":"BTC","quote":"USDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
    '--dry-run',
    '--format',
    'json',
  ]);

  assert.equal(preview.dryRun, true);
  assert.equal(preview.requiresConfirm, true);
  assert.deepEqual(preview.metadata, {
    auth: 'private',
    riskLevel: 'high',
    requiredParams: ['base', 'quote', 'orderType', 'tradeType', 'amount'],
    optionalParams: ['price', 'stopPrice', 'clientOid'],
    parameterMode: 'body',
  });
});

test('private read-like POST dry-run output includes low-risk body metadata', () => {
  const preview = runCliJson([
    'spot',
    'trade',
    'order-info',
    '--orderId',
    '123456789',
    '--dry-run',
    '--format',
    'json',
  ]);

  assert.equal(preview.dryRun, true);
  assert.deepEqual(preview.metadata, {
    auth: 'private',
    riskLevel: 'low',
    requiredParams: ['orderId'],
    optionalParams: [],
    parameterMode: 'body',
  });
  assert.equal(preview.request.method, 'POST');
  assert.equal(preview.request.body, '{"orderId":"123456789"}');
});

test('help output includes parameter metadata hints', () => {
  const output = execFileSync(process.execPath, [...cliArgs, '--help'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  assert.match(
    output,
    /future market depth\s+Build or execute a futures order book depth request \(required: symbol; optional: limit\)/,
  );
  assert.match(
    output,
    /spot trade place-order\s+Requires CONFIRM: place a spot order \(required: base, quote, orderType, tradeType, amount; optional: price, stopPrice, clientOid\)/,
  );
});

function runCliJson(args) {
  const output = execFileSync(process.execPath, [...cliArgs, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      BYDOXE_ACCESS_KEY: 'test-access',
      BYDOXE_SECRET_KEY: 'test-secret',
      BYDOXE_PASSPHRASE: 'test-passphrase',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return JSON.parse(output);
}
