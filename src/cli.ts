#!/usr/bin/env node

import { loadConfig } from './config/load-config.js';
import { buildRequest } from './http/request.js';
import { printOutput, type OutputFormat } from './output/format.js';
import { CliError } from './errors/cli-error.js';

interface ParsedArgs {
  command: string[];
  flags: Record<string, string | boolean>;
}

async function main(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv);

  if (parsed.flags.help || parsed.command.length === 0) {
    printHelp();
    return;
  }

  const format = getFormat(parsed.flags);
  const dryRun = Boolean(parsed.flags['dry-run']);
  const config = {
    ...loadConfig(),
    restBaseUrl:
      typeof parsed.flags['base-url'] === 'string'
        ? parsed.flags['base-url']
        : loadConfig().restBaseUrl,
  };

  if (matches(parsed.command, ['public', 'time'])) {
    const request = buildRequest(config, {
      method: 'GET',
      path: '/public/time',
    });

    if (dryRun) {
      printOutput({ dryRun: true, request }, format);
      return;
    }

    throw new CliError('Network execution is not implemented in this scaffold.');
  }

  throw new CliError(`Unknown command: ${parsed.command.join(' ')}`);
}

function parseArgs(argv: string[]): ParsedArgs {
  const command: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token.startsWith('--')) {
      const name = token.slice(2);
      const next = argv[index + 1];
      if (next && !next.startsWith('--')) {
        flags[name] = next;
        index += 1;
      } else {
        flags[name] = true;
      }
      continue;
    }

    command.push(token);
  }

  return { command, flags };
}

function getFormat(flags: Record<string, string | boolean>): OutputFormat {
  if (flags.format === 'json') return 'json';
  if (flags.format === undefined || flags.format === 'human') return 'human';
  throw new CliError(`Unsupported output format: ${String(flags.format)}`);
}

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}

function printHelp(): void {
  console.log(`BYDOXE CLI

Usage:
  bydoxe <group> <command> [options]

Commands:
  public time          Build or execute a server time request

Options:
  --base-url <url>     Override the REST base URL
  --format <format>    Output format: human or json
  --dry-run            Print the request without sending it
  --help               Show this help message

Environment:
  BYDOXE_ACCESS_KEY
  BYDOXE_SECRET_KEY
  BYDOXE_PASSPHRASE
  BYDOXE_REST_BASE_URL
`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  if (error instanceof CliError) {
    console.error(error.message);
    process.exitCode = error.exitCode;
    return;
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
