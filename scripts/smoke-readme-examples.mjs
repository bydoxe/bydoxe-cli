import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const readmePath = path.join(root, 'README.md');
const cliPath = path.join(root, 'dist', 'cli.js');
const readmeText = await readFile(readmePath, 'utf8');
const commands = extractReadmeCommands(readmeText);
const problems = [];

for (const command of commands) {
  if (!command.includes(' --dry-run')) {
    problems.push(`README command must use --dry-run: ${command}`);
    continue;
  }

  const args = tokenize(command).slice(1);

  try {
    const output = execFileSync(process.execPath, [cliPath, ...args], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        BYDOXE_ACCESS_KEY: 'readme-smoke-access',
        BYDOXE_SECRET_KEY: 'readme-smoke-secret',
        BYDOXE_PASSPHRASE: 'readme-smoke-passphrase',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const preview = JSON.parse(output);

    if (preview.dryRun !== true) {
      problems.push(`README command did not produce a dry-run preview: ${command}`);
    }
  } catch (error) {
    problems.push(
      `README command failed: ${command}\n${getErrorOutput(error)}`,
    );
  }
}

if (problems.length > 0) {
  console.error('README smoke validation failed:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log(`README smoke validation passed for ${commands.length} commands.`);
}

function extractReadmeCommands(markdown) {
  const commands = [];
  const codeBlockPattern = /```(?:sh|bash)?\n([\s\S]*?)```/g;

  for (const blockMatch of markdown.matchAll(codeBlockPattern)) {
    const lines = blockMatch[1]
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('bydoxe '));
    commands.push(...lines);
  }

  return [...new Set(commands)];
}

function tokenize(command) {
  const tokens = [];
  let current = '';
  let quote = undefined;

  for (let index = 0; index < command.length; index += 1) {
    const char = command[index];

    if (quote) {
      if (char === quote) {
        quote = undefined;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '\'' || char === '"') {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (quote) {
    throw new Error(`Unclosed quote in README command: ${command}`);
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}

function getErrorOutput(error) {
  if (!error || typeof error !== 'object') return String(error);

  const maybeError = error;
  const stdout = Buffer.isBuffer(maybeError.stdout)
    ? maybeError.stdout.toString('utf8')
    : maybeError.stdout;
  const stderr = Buffer.isBuffer(maybeError.stderr)
    ? maybeError.stderr.toString('utf8')
    : maybeError.stderr;

  return [stdout, stderr, maybeError.message]
    .filter(Boolean)
    .join('\n')
    .trim();
}
