import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import process from 'node:process';

const cliArgs = ['dist/cli.js'];

test('config set stores credentials with restricted permissions', () => {
  const configPath = tempConfigPath();
  const result = runCliJson(
    [
      'config',
      'set',
      '--access-key',
      'test-access-key',
      '--secret-key',
      'test-secret-key',
      '--passphrase',
      'test-passphrase',
      '--format',
      'json',
    ],
    configPath,
  );
  const stored = JSON.parse(readFileSync(configPath, 'utf8'));
  const mode = statSync(configPath).mode & 0o777;

  assert.equal(result.status, 'saved');
  assert.equal(result.fileMode, '0600');
  assert.equal(result.credentials.configured, true);
  assert.equal(result.credentials.accessKey, '***********-key');
  assert.equal(result.credentials.secretKey, 'configured');
  assert.equal(result.credentials.passphrase, 'configured');
  assert.equal(stored.accessKey, 'test-access-key');
  assert.equal(stored.secretKey, 'test-secret-key');
  assert.equal(stored.passphrase, 'test-passphrase');
  assert.equal(mode, 0o600);
});

test('config status reports masked profile values', () => {
  const configPath = tempConfigPath();
  runCliJson(
    [
      'config',
      'set',
      '--access-key',
      'profile-access',
      '--secret-key',
      'profile-secret',
      '--passphrase',
      'profile-passphrase',
      '--format',
      'json',
    ],
    configPath,
  );

  const status = runCliJson(['config', 'status', '--format', 'json'], configPath);

  assert.equal(status.credentials.configured, true);
  assert.equal(status.credentials.accessKey, '**********cess');
  assert.equal(status.credentials.secretKey, 'configured');
  assert.equal(status.credentials.passphrase, 'configured');
});

test('private dry-run can use stored credential profile', () => {
  const configPath = tempConfigPath();
  runCliJson(
    [
      'config',
      'set',
      '--access-key',
      'profile-access',
      '--secret-key',
      'profile-secret',
      '--passphrase',
      'profile-passphrase',
      '--format',
      'json',
    ],
    configPath,
  );

  const preview = runCliJson(
    ['account', 'funding-assets', '--dry-run', '--format', 'json'],
    configPath,
  );

  assert.equal(preview.request.headers['ACCESS-KEY'], '<redacted>');
  assert.equal(preview.request.headers['ACCESS-SIGN'], '<redacted>');
  assert.equal(preview.request.headers['ACCESS-PASSPHRASE'], '<redacted>');
});

test('environment credentials take priority over stored profile', () => {
  const configPath = tempConfigPath();
  runCliJson(
    [
      'config',
      'set',
      '--access-key',
      'profile-access',
      '--secret-key',
      'profile-secret',
      '--passphrase',
      'profile-passphrase',
      '--format',
      'json',
    ],
    configPath,
  );

  const status = runCliJson(['config', 'status', '--format', 'json'], configPath, {
    BYDOXE_ACCESS_KEY: 'env-access',
    BYDOXE_SECRET_KEY: 'env-secret',
    BYDOXE_PASSPHRASE: 'env-passphrase',
  });

  assert.equal(status.credentials.configured, true);
  assert.equal(status.credentials.accessKey, '******cess');
});

test('config clear removes stored profile', () => {
  const configPath = tempConfigPath();
  runCliJson(
    [
      'config',
      'set',
      '--access-key',
      'profile-access',
      '--secret-key',
      'profile-secret',
      '--passphrase',
      'profile-passphrase',
      '--format',
      'json',
    ],
    configPath,
  );

  const clear = runCliJson(['config', 'clear', '--format', 'json'], configPath);
  const status = runCliJson(['config', 'status', '--format', 'json'], configPath);

  assert.equal(clear.status, 'cleared');
  assert.equal(status.credentials.configured, false);
  assert.equal(status.credentials.accessKey, 'missing');
});

function tempConfigPath() {
  return path.join(mkdtempSync(path.join(os.tmpdir(), 'bydoxe-config-test-')), 'config');
}

function runCliJson(args, configPath, extraEnv = {}) {
  const env = {
    ...process.env,
    BYDOXE_CONFIG_PATH: configPath,
    ...extraEnv,
  };
  for (const name of [
    'BYDOXE_ACCESS_KEY',
    'BYDOXE_SECRET_KEY',
    'BYDOXE_PASSPHRASE',
  ]) {
    if (!(name in extraEnv)) {
      delete env[name];
    }
  }

  const output = execFileSync(process.execPath, [...cliArgs, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return JSON.parse(output);
}
