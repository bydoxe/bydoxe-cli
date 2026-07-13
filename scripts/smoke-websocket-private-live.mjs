import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const runEnv = 'BYDOXE_RUN_LIVE_PRIVATE_WS_TESTS';
const gateEnv = 'BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE';
const requiredCredentialEnv = [
  'BYDOXE_ACCESS_KEY',
  'BYDOXE_SECRET_KEY',
  'BYDOXE_PASSPHRASE',
];

if (process.env[runEnv] !== '1') {
  console.log(`Private WebSocket live smoke skipped. Set ${runEnv}=1 to run it.`);
  process.exit(0);
}

const preflightProblems = validatePreflight();
if (preflightProblems.length > 0) {
  console.error('Private WebSocket live smoke preflight failed:');
  for (const problem of preflightProblems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

const root = process.cwd();
const cliPath = path.join(root, 'dist', 'cli.js');
const instType = process.env.BYDOXE_PRIVATE_WS_LIVE_INST_TYPE ?? 'USDT-FUTURES';
const channel = process.env.BYDOXE_PRIVATE_WS_LIVE_CHANNEL ?? 'orders';
const instId = process.env.BYDOXE_PRIVATE_WS_LIVE_INST_ID ?? 'BTCUSDT';
const maxMessages = process.env.BYDOXE_PRIVATE_WS_LIVE_MAX_MESSAGES ?? '2';
const timeoutMs = process.env.BYDOXE_PRIVATE_WS_LIVE_TIMEOUT_MS ?? '10000';

const args = [
  'websocket',
  'private',
  'subscribe',
  '--instType',
  instType,
  '--channel',
  channel,
  '--instId',
  instId,
  '--live',
  '--max-messages',
  maxMessages,
  '--timeout-ms',
  timeoutMs,
  '--format',
  'json',
];

try {
  const output = execFileSync(process.execPath, [cliPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const result = JSON.parse(output);
  const problems = validateResult(result);

  if (problems.length > 0) {
    console.error('Private WebSocket live smoke validation failed:');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Private WebSocket live smoke passed for ${instType} ${channel} ${instId}.`);
  }
} catch (error) {
  console.error('Private WebSocket live smoke failed:');
  console.error(getErrorOutput(error));
  process.exitCode = 1;
}

function validatePreflight() {
  const problems = [];

  if (process.env[gateEnv] !== '1') {
    problems.push(`Set ${gateEnv}=1 to enable the read-only private WebSocket live gate.`);
  }

  for (const name of requiredCredentialEnv) {
    if (!process.env[name]) {
      problems.push(`Missing required credential environment variable: ${name}`);
    }
  }

  return problems;
}

function validateResult(result) {
  const problems = [];

  if (result?.live !== true) {
    problems.push('Expected live=true in the command result.');
  }
  if (result?.connection?.scope !== 'private') {
    problems.push('Expected a private WebSocket connection scope.');
  }
  if (result?.sent?.login?.op !== 'login') {
    problems.push('Expected a redacted login message in the sent payload.');
  }
  if (result?.sent?.login?.args?.apiKey !== '<redacted>') {
    problems.push('Expected the login apiKey field to be redacted.');
  }
  if (result?.sent?.login?.args?.passphrase !== '<redacted>') {
    problems.push('Expected the login passphrase field to be redacted.');
  }
  if (result?.sent?.login?.args?.sign !== '<redacted>') {
    problems.push('Expected the login sign field to be redacted.');
  }
  if (result?.sent?.message?.op !== 'subscribe') {
    problems.push('Expected a sent private subscribe message.');
  }
  if (!Array.isArray(result?.received)) {
    problems.push('Expected a received WebSocket message array.');
  }
  if (!result?.closed?.reason) {
    problems.push('Expected a close reason in the bounded live result.');
  }

  return problems;
}

function getErrorOutput(error) {
  if (!error || typeof error !== 'object') return String(error);

  const stdout = Buffer.isBuffer(error.stdout)
    ? error.stdout.toString('utf8')
    : error.stdout;
  const stderr = Buffer.isBuffer(error.stderr)
    ? error.stderr.toString('utf8')
    : error.stderr;

  return [stdout, stderr, error.message]
    .filter(Boolean)
    .join('\n')
    .trim();
}
