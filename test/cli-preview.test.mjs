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
    '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}',
    '--dry-run',
    '--format',
    'json',
  ]);

  assert.equal(preview.dryRun, true);
  assert.equal(preview.requiresConfirm, true);
  assert.deepEqual(preview.metadata, {
    auth: 'private',
    riskLevel: 'high',
    requiredParams: ['symbol', 'orderType', 'tradeType', 'amount'],
    optionalParams: ['price', 'clientOid'],
    parameterMode: 'body',
  });
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
