#!/usr/bin/env node

import { loadConfig } from './config/load-config.js';
import { buildRequest } from './http/request.js';
import { executeRequest } from './http/execute.js';
import { printOutput, type OutputFormat } from './output/format.js';
import { CliError } from './errors/cli-error.js';
import {
  commandToString,
  findPublicRestCommand,
  parseArgs,
  PUBLIC_REST_COMMANDS,
  type DryRunPreview,
} from './commands/public-rest.js';
import {
  findPrivateRestCommand,
  PRIVATE_REST_COMMANDS,
  redactPrivateRequest,
} from './commands/private-rest.js';

async function main(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv);

  if (parsed.flags.help || parsed.command.length === 0) {
    printHelp();
    return;
  }

  const format = getFormat(parsed.flags);
  const dryRun = Boolean(parsed.flags['dry-run']);
  const loadedConfig = loadConfig();
  const config = {
    ...loadedConfig,
    restBaseUrl:
      typeof parsed.flags['base-url'] === 'string'
        ? parsed.flags['base-url']
        : loadedConfig.restBaseUrl,
  };

  const publicRestCommand = findPublicRestCommand(parsed);
  if (publicRestCommand) {
    const request = buildRequest(config, {
      method: publicRestCommand.definition.method,
      path: publicRestCommand.definition.path,
      query: publicRestCommand.query,
    });

    if (dryRun) {
      const preview: DryRunPreview = {
        dryRun: true,
        command: commandToString(parsed.command),
        request,
      };
      printOutput(preview, format);
      return;
    }

    printOutput(await executeRequest(request), format);
    return;
  }

  const privateRestCommand = findPrivateRestCommand(parsed);
  if (privateRestCommand) {
    const request = buildRequest(config, {
      method: privateRestCommand.definition.method,
      path: privateRestCommand.definition.path,
      query: privateRestCommand.query,
      privateRequest: true,
    });

    if (dryRun) {
      const preview: DryRunPreview = {
        dryRun: true,
        command: commandToString(parsed.command),
        request: redactPrivateRequest(request),
      };
      printOutput(preview, format);
      return;
    }

    printOutput(await executeRequest(request), format);
    return;
  }

  throw new CliError(`Unknown command: ${parsed.command.join(' ')}`);
}

function getFormat(flags: Record<string, string | boolean>): OutputFormat {
  if (flags.format === 'json') return 'json';
  if (flags.format === undefined || flags.format === 'human') return 'human';
  throw new CliError(`Unsupported output format: ${String(flags.format)}`);
}

function printHelp(): void {
  const commandColumnWidth = 38;
  const publicCommands = PUBLIC_REST_COMMANDS.map(
    (command) =>
      `  ${command.command.join(' ').padEnd(commandColumnWidth)}${command.description}`,
  ).join('\n');
  const privateCommands = PRIVATE_REST_COMMANDS.map(
    (command) =>
      `  ${command.command.join(' ').padEnd(commandColumnWidth)}${command.description}`,
  ).join('\n');

  console.log(`BYDOXE CLI

Usage:
  bydoxe <group> <command> [options]

Commands:
Public REST:
${publicCommands}

Authenticated REST:
${privateCommands}

Options:
  --base-url <url>                  Override the REST base URL
  --format <format>                 Output format: human or json
  --dry-run                         Print the request without sending it
  --help                            Show this help message

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
