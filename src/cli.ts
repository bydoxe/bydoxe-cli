#!/usr/bin/env node

import { loadConfig } from './config/load-config.js';
import {
  assertCompleteProfile,
  clearCredentialProfile,
  getCredentialStatus,
  promptCredentialProfile,
  saveCredentialProfile,
} from './config/profile.js';
import { buildRequest } from './http/request.js';
import { executeRequest } from './http/execute.js';
import { printOutput, type OutputFormat } from './output/format.js';
import { CliError } from './errors/cli-error.js';
import {
  commandToString,
  findPublicRestCommand,
  parseArgs,
  PUBLIC_REST_COMMANDS,
  toPreviewMetadata,
  type DryRunPreview,
} from './commands/public-rest.js';
import {
  findPrivateRestCommand,
  PRIVATE_REST_COMMANDS,
  redactPrivateRequest,
} from './commands/private-rest.js';
import {
  assertWriteConfirmed,
  findWriteRestCommand,
  WRITE_REST_COMMANDS,
} from './commands/write-rest.js';
import {
  assertPrivateWebSocketLiveBlocked,
  assertPrivateWebSocketReadOnlyLiveAllowed,
  assertWebSocketConfirmed,
  findWebSocketCommand,
  redactWebSocketPreview,
  WEBSOCKET_COMMANDS,
} from './commands/websocket.js';
import {
  executePrivateReadOnlyWebSocket,
  executePublicWebSocket,
} from './websocket/execute.js';

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

  if (parsed.command[0] === 'config') {
    await handleConfigCommand(parsed, format);
    return;
  }

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
        metadata: toPreviewMetadata(publicRestCommand.definition),
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
      body: privateRestCommand.body,
      privateRequest: true,
    });

    if (dryRun) {
      const preview: DryRunPreview = {
        dryRun: true,
        command: commandToString(parsed.command),
        metadata: toPreviewMetadata(privateRestCommand.definition),
        request: redactPrivateRequest(request),
      };
      printOutput(preview, format);
      return;
    }

    printOutput(await executeRequest(request), format);
    return;
  }

  const writeRestCommand = findWriteRestCommand(parsed);
  if (writeRestCommand) {
    const request = buildRequest(config, {
      method: writeRestCommand.definition.method,
      path: writeRestCommand.definition.path,
      body: writeRestCommand.body,
      privateRequest: true,
    });

    if (dryRun) {
      printOutput(
        {
          dryRun: true,
          command: commandToString(parsed.command),
          metadata: toPreviewMetadata(writeRestCommand.definition),
          requiresConfirm: true,
          confirmToken: 'CONFIRM',
          risk: writeRestCommand.definition.risk,
          request: redactPrivateRequest(request),
        },
        format,
      );
      return;
    }

    assertWriteConfirmed(parsed.flags);
    printOutput(await executeRequest(request), format);
    return;
  }

  const webSocketCommand = findWebSocketCommand(parsed, config);
  if (webSocketCommand) {
    const preview = redactWebSocketPreview(webSocketCommand.preview);

    if (dryRun) {
      printOutput(preview, format);
      return;
    }

    if (!parsed.flags.live) {
      throw new CliError(
        'Live WebSocket sessions require --live. Run with --dry-run first to review the connection and message preview.',
      );
    }

    if (webSocketCommand.definition.scope !== 'public') {
      assertPrivateWebSocketReadOnlyLiveAllowed(
        webSocketCommand.definition.command,
        parsed.flags,
      );
      const loginCommand = findWebSocketCommand(
        {
          command: ['websocket', 'private', 'login'],
          flags: parsed.flags,
        },
        config,
      );

      if (!loginCommand) {
        assertPrivateWebSocketLiveBlocked(webSocketCommand.definition.command);
      }

      printOutput(
        await executePrivateReadOnlyWebSocket(
          loginCommand.preview,
          webSocketCommand.preview,
          getWebSocketLiveOptions(parsed.flags),
        ),
        format,
      );
      return;
    }

    if (webSocketCommand.definition.requiresConfirm) {
      assertWebSocketConfirmed(parsed.flags);
    }

    printOutput(
      await executePublicWebSocket(preview, getWebSocketLiveOptions(parsed.flags)),
      format,
    );
    return;
  }

  throw new CliError(`Unknown command: ${parsed.command.join(' ')}`);
}

async function handleConfigCommand(
  parsed: { command: string[]; flags: Record<string, string | boolean> },
  format: OutputFormat,
): Promise<void> {
  const action = parsed.command[1];

  if (action === 'set') {
    const profile = hasCredentialFlags(parsed.flags)
      ? assertCompleteProfile({
          accessKey: readStringFlag(parsed.flags, 'access-key'),
          secretKey: readStringFlag(parsed.flags, 'secret-key'),
          passphrase: readStringFlag(parsed.flags, 'passphrase'),
        })
      : await promptCredentialProfile({
          accessKey: process.env.BYDOXE_ACCESS_KEY,
          secretKey: process.env.BYDOXE_SECRET_KEY,
          passphrase: process.env.BYDOXE_PASSPHRASE,
        });
    const configPath = saveCredentialProfile(profile);
    printOutput(
      {
        command: 'bydoxe config set',
        status: 'saved',
        configPath,
        fileMode: '0600',
        credentials: getCredentialStatus(profile),
      },
      format,
    );
    return;
  }

  if (action === 'status') {
    const loadedConfig = loadConfig();
    printOutput(
      {
        command: 'bydoxe config status',
        credentials: getCredentialStatus({
          accessKey: loadedConfig.accessKey,
          secretKey: loadedConfig.secretKey,
          passphrase: loadedConfig.passphrase,
        }),
        sourcePriority: ['environment variables', 'local config file'],
      },
      format,
    );
    return;
  }

  if (action === 'clear') {
    const configPath = clearCredentialProfile();
    printOutput(
      {
        command: 'bydoxe config clear',
        status: 'cleared',
        configPath,
      },
      format,
    );
    return;
  }

  throw new CliError(
    'Unknown config command. Use bydoxe config set, bydoxe config status, or bydoxe config clear.',
  );
}

function getFormat(flags: Record<string, string | boolean>): OutputFormat {
  if (flags.format === 'json') return 'json';
  if (flags.format === undefined || flags.format === 'human') return 'human';
  throw new CliError(`Unsupported output format: ${String(flags.format)}`);
}

function getWebSocketLiveOptions(
  flags: Record<string, string | boolean>,
): { maxMessages: number; timeoutMs: number } {
  return {
    maxMessages: getPositiveIntegerFlag(flags, 'max-messages', 5),
    timeoutMs: getPositiveIntegerFlag(flags, 'timeout-ms', 15000),
  };
}

function getPositiveIntegerFlag(
  flags: Record<string, string | boolean>,
  name: string,
  defaultValue: number,
): number {
  const value = flags[name];
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new CliError(`--${name} must be a positive integer.`);
  }

  return parsed;
}

function readStringFlag(
  flags: Record<string, string | boolean>,
  name: string,
): string | undefined {
  const value = flags[name];
  return typeof value === 'string' ? value : undefined;
}

function hasCredentialFlags(flags: Record<string, string | boolean>): boolean {
  return ['access-key', 'secret-key', 'passphrase'].some((name) => flags[name] !== undefined);
}

function printHelp(): void {
  const commandColumnWidth = 38;
  const publicCommands = formatHelpCommands(PUBLIC_REST_COMMANDS, commandColumnWidth);
  const privateCommands = formatHelpCommands(PRIVATE_REST_COMMANDS, commandColumnWidth);
  const writeCommands = formatHelpCommands(WRITE_REST_COMMANDS, commandColumnWidth);
  const webSocketCommands = formatHelpCommands(WEBSOCKET_COMMANDS, commandColumnWidth);

  console.log(`BYDOXE CLI

Usage:
  bydoxe <group> <command> [options]

Commands:
Config:
  config set                            Store local BYDOXE credentials
  config status                         Show local credential setup status without revealing secrets
  config clear                          Remove the local credential profile

Public REST:
${publicCommands}

Authenticated REST:
${privateCommands}

Write REST:
${writeCommands}

WebSocket:
${webSocketCommands}

Options:
  --base-url <url>                  Override the REST base URL
  --body <json>                     JSON request body for write commands
  --confirm CONFIRM                 Required to execute write commands
  --access-key <value>              Access key for non-interactive config set
  --secret-key <value>              Secret key for non-interactive config set
  --passphrase <value>              Passphrase for non-interactive config set
  --format <format>                 Output format: human or json
  --dry-run                         Print the request without sending it
  --live                            Execute a supported WebSocket live session
  --max-messages <number>           Maximum WebSocket messages before closing
  --timeout-ms <number>             WebSocket live timeout in milliseconds
  --ws-url <url>                    Override the selected WebSocket URL
  --help                            Show this help message

Environment:
  BYDOXE_CONFIG_PATH
  BYDOXE_ACCESS_KEY
  BYDOXE_SECRET_KEY
  BYDOXE_PASSPHRASE
  BYDOXE_REST_BASE_URL
  BYDOXE_PUBLIC_WS_URL
  BYDOXE_PRIVATE_WS_URL
  BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE
`);
}

function formatHelpCommands(
  commands: Array<{
    command: string[];
    description: string;
    requiredParams: string[];
    optionalParams: string[];
  }>,
  commandColumnWidth: number,
): string {
  return commands
    .map(
      (command) =>
        `  ${command.command.join(' ').padEnd(commandColumnWidth)}${command.description}${formatParameterHint(command)}`,
    )
    .join('\n');
}

function formatParameterHint(command: {
  requiredParams: string[];
  optionalParams: string[];
}): string {
  const hints = [];

  if (command.requiredParams.length > 0) {
    hints.push(`required: ${command.requiredParams.join(', ')}`);
  }
  if (command.optionalParams.length > 0) {
    hints.push(`optional: ${command.optionalParams.join(', ')}`);
  }

  return hints.length > 0 ? ` (${hints.join('; ')})` : '';
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
