import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

if (process.env.BYDOXE_RUN_LIVE_WS_TESTS !== '1') {
  console.log('Public WebSocket live smoke skipped. Set BYDOXE_RUN_LIVE_WS_TESTS=1 to run it.');
  process.exit(0);
}

const root = process.cwd();
const cliPath = path.join(root, 'dist', 'cli.js');
const instType = process.env.BYDOXE_WS_LIVE_INST_TYPE ?? 'SPOT';
const channel = process.env.BYDOXE_WS_LIVE_CHANNEL ?? 'ticker';
const instId = process.env.BYDOXE_WS_LIVE_INST_ID ?? 'BTCUSDT';
const timeoutMs = process.env.BYDOXE_WS_LIVE_TIMEOUT_MS ?? '15000';

const args = [
  'websocket',
  'public',
  'subscribe',
  '--instType',
  instType,
  '--channel',
  channel,
  '--instId',
  instId,
  '--live',
  '--max-messages',
  '1',
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
    console.error('Public WebSocket live smoke validation failed:');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Public WebSocket live smoke passed for ${instType} ${channel} ${instId}.`);
  }
} catch (error) {
  console.error('Public WebSocket live smoke failed:');
  console.error(getErrorOutput(error));
  process.exitCode = 1;
}

function validateResult(result) {
  const problems = [];

  if (result?.live !== true) {
    problems.push('Expected live=true in the command result.');
  }
  if (result?.connection?.scope !== 'public') {
    problems.push('Expected a public WebSocket connection scope.');
  }
  if (result?.message?.event !== 'subscribe') {
    problems.push('Expected a subscribe preview message.');
  }
  if (!Array.isArray(result?.received) || result.received.length < 1) {
    problems.push('Expected at least one received WebSocket message.');
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
