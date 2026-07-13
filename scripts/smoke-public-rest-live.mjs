import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

if (process.env.BYDOXE_RUN_LIVE_REST_TESTS !== '1') {
  console.log('Public REST live smoke skipped. Set BYDOXE_RUN_LIVE_REST_TESTS=1 to run it.');
  process.exit(0);
}

const root = process.cwd();
const cliPath = path.join(root, 'dist', 'cli.js');
const args = [
  'public',
  'time',
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
    console.error('Public REST live smoke validation failed:');
    for (const problem of problems) {
      console.error(`- ${problem}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Public REST live smoke passed for public time.');
  }
} catch (error) {
  console.error('Public REST live smoke failed:');
  console.error(getErrorOutput(error));
  process.exitCode = 1;
}

function validateResult(result) {
  const problems = [];

  if (!Number.isInteger(result?.status) || result.status < 200 || result.status >= 300) {
    problems.push('Expected a 2xx HTTP status.');
  }
  if (!result || typeof result !== 'object' || !('data' in result)) {
    problems.push('Expected a response object with a data field.');
  }
  if (result?.data === null || result?.data === undefined) {
    problems.push('Expected a non-empty response data payload.');
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
