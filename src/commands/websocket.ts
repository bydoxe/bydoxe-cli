import { signWebSocketLogin } from '../auth/signature.js';
import type { BydoxeConfig } from '../config/load-config.js';
import { CliError } from '../errors/cli-error.js';
import {
  type CommandPreviewMetadata,
  type CommandMetadata,
  toPreviewMetadata,
  withCommandMetadata,
} from './metadata.js';
import type { ParsedArgs } from './public-rest.js';
import { REQUIRED_CONFIRMATION } from './write-rest.js';

export type WebSocketScope = 'public' | 'private';

export interface WebSocketCommand extends CommandMetadata {
  command: string[];
  scope: WebSocketScope;
  description: string;
  requiresConfirm?: boolean;
  risk?: string;
}

export interface WebSocketPreview {
  dryRun: true;
  command: string;
  connection: {
    url: string;
    scope: WebSocketScope;
  };
  metadata: CommandPreviewMetadata;
  message: unknown;
  requiresConfirm?: boolean;
  confirmToken?: typeof REQUIRED_CONFIRMATION;
  risk?: string;
}

export interface WebSocketCommandMatch {
  definition: WebSocketCommand;
  preview: WebSocketPreview;
}

export const PRIVATE_WEBSOCKET_LIVE_GATES = [
  'authenticated login handshake verification',
  'bounded read-only private stream smoke tests',
  'separate trade-send implementation with exact CONFIRM',
  'explicit opt-in environment gate for live private sessions',
];
export const PRIVATE_WEBSOCKET_READ_ONLY_LIVE_ENV =
  'BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE';

const GLOBAL_FLAGS = new Set([
  'body',
  'confirm',
  'dry-run',
  'format',
  'help',
  'live',
  'max-messages',
  'timeout-ms',
  'ws-url',
]);

const ARG_FLAGS = new Set(['instType', 'instId', 'channel']);

export const WEBSOCKET_COMMANDS: WebSocketCommand[] = withCommandMetadata([
  {
    command: ['websocket', 'public', 'ping'],
    scope: 'public',
    description: 'Build a public WebSocket ping message preview',
  },
  {
    command: ['websocket', 'public', 'subscribe'],
    scope: 'public',
    description: 'Build a public WebSocket subscribe message preview',
  },
  {
    command: ['websocket', 'public', 'unsubscribe'],
    scope: 'public',
    description: 'Build a public WebSocket unsubscribe message preview',
  },
  {
    command: ['websocket', 'private', 'login'],
    scope: 'private',
    description: 'Build a signed private WebSocket login message preview',
  },
  {
    command: ['websocket', 'private', 'subscribe'],
    scope: 'private',
    description: 'Build a private WebSocket subscribe message preview',
  },
  {
    command: ['websocket', 'private', 'unsubscribe'],
    scope: 'private',
    description: 'Build a private WebSocket unsubscribe message preview',
  },
  {
    command: ['websocket', 'private', 'spot', 'trade'],
    scope: 'private',
    description: 'Requires CONFIRM: build a private WebSocket spot trade message preview',
    requiresConfirm: true,
    risk: 'Builds a spot trade payload that can place or cancel orders when sent to BYDOXE.',
  },
], (command) => ({
  auth: command.scope,
  riskLevel: command.requiresConfirm ? 'high' : command.scope === 'private' ? 'medium' : 'low',
  requiredParams: [],
  optionalParams: [],
  parameterMode: 'message',
} satisfies CommandMetadata));

export function findWebSocketCommand(
  parsed: ParsedArgs,
  config: BydoxeConfig,
  now: () => number = Date.now,
): WebSocketCommandMatch | undefined {
  const definition = WEBSOCKET_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  const url = getWebSocketUrl(parsed, config, definition.scope);
  const message = buildWebSocketMessage(parsed, definition, config, now);

  return {
    definition,
    preview: {
      dryRun: true,
      command: `bydoxe ${parsed.command.join(' ')}`,
      connection: {
        url,
        scope: definition.scope,
      },
      metadata: toPreviewMetadata(definition),
      message,
      requiresConfirm: definition.requiresConfirm,
      confirmToken: definition.requiresConfirm ? REQUIRED_CONFIRMATION : undefined,
      risk: definition.risk,
    },
  };
}

export function assertWebSocketConfirmed(
  flags: Record<string, string | boolean>,
): void {
  if (flags.confirm !== REQUIRED_CONFIRMATION) {
    throw new CliError(
      `WebSocket trade commands require --confirm ${REQUIRED_CONFIRMATION}. Run with --dry-run first and review the message preview.`,
    );
  }
}

export function assertPrivateWebSocketLiveBlocked(command: string[]): never {
  throw new CliError(
    `Private WebSocket live execution is intentionally disabled for bydoxe ${command.join(' ')}. Required gates before implementation: ${PRIVATE_WEBSOCKET_LIVE_GATES.join('; ')}.`,
  );
}

export function assertPrivateWebSocketReadOnlyLiveAllowed(
  command: string[],
  flags: Record<string, string | boolean>,
  env: NodeJS.ProcessEnv = process.env,
): void {
  const action = command[2];
  if (action !== 'subscribe' && action !== 'unsubscribe') {
    throw new CliError(
      'Private WebSocket read-only live execution only supports private subscribe and unsubscribe commands.',
    );
  }

  if (env[PRIVATE_WEBSOCKET_READ_ONLY_LIVE_ENV] !== '1') {
    throw new CliError(
      `Private WebSocket read-only live execution requires ${PRIVATE_WEBSOCKET_READ_ONLY_LIVE_ENV}=1. Run with --dry-run first and use short --max-messages and --timeout-ms limits.`,
    );
  }

  if (flags['max-messages'] === undefined || flags['timeout-ms'] === undefined) {
    throw new CliError(
      'Private WebSocket read-only live execution requires explicit --max-messages and --timeout-ms limits.',
    );
  }
}

export function redactWebSocketPreview(
  preview: WebSocketPreview,
): WebSocketPreview {
  if (preview.connection.scope !== 'private') return preview;

  return {
    ...preview,
    message: redactPrivateWebSocketMessage(preview.message),
  };
}

function buildWebSocketMessage(
  parsed: ParsedArgs,
  definition: WebSocketCommand,
  config: BydoxeConfig,
  now: () => number,
): unknown {
  const [, scope, action, subAction] = parsed.command;

  if (scope === 'public' && action === 'ping') return 'ping';

  if (action === 'subscribe' || action === 'unsubscribe') {
    return {
      op: action,
      args: [getChannelArg(parsed.flags)],
    };
  }

  if (scope === 'private' && action === 'login') {
    if (!config.accessKey || !config.secretKey || !config.passphrase) {
      throw new Error('Private WebSocket login requires BYDOXE API credentials.');
    }

    const timestamp = String(now());
    return {
      op: 'login',
      args: {
        apiKey: config.accessKey,
        passphrase: config.passphrase,
        timestamp,
        sign: signWebSocketLogin({
          timestamp,
          secretKey: config.secretKey,
        }),
      },
    };
  }

  if (scope === 'private' && action === 'spot' && subAction === 'trade') {
    if (typeof parsed.flags.body === 'string') {
      return parseJsonBody(parsed.flags.body);
    }

    return {
      op: 'trade',
      args: [
        {
          instType: parsed.flags.instType ?? 'SPOT',
          instId: parsed.flags.instId,
          channel: parsed.flags.channel ?? 'place-order',
          params: getTradeParams(parsed.flags),
        },
      ],
    };
  }

  throw new CliError(
    `Unsupported WebSocket command: ${definition.command.join(' ')}`,
  );
}

function getChannelArg(flags: Record<string, string | boolean>): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(flags).filter(([name]) => !GLOBAL_FLAGS.has(name)),
  );
}

function getTradeParams(
  flags: Record<string, string | boolean>,
): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(flags).filter(
      ([name]) => !GLOBAL_FLAGS.has(name) && !ARG_FLAGS.has(name),
    ),
  );
}

function getWebSocketUrl(
  parsed: ParsedArgs,
  config: BydoxeConfig,
  scope: WebSocketScope,
): string {
  if (typeof parsed.flags['ws-url'] === 'string') return parsed.flags['ws-url'];
  return scope === 'public'
    ? config.publicWebSocketUrl
    : config.privateWebSocketUrl;
}

function parseJsonBody(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw new CliError(
      `Invalid JSON passed to --body: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function redactPrivateWebSocketMessage(message: unknown): unknown {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return message;
  }

  const candidate = message as Record<string, unknown>;
  if (candidate.op !== 'login' || !candidate.args || typeof candidate.args !== 'object') {
    return message;
  }

  const args = candidate.args as Record<string, unknown>;
  return {
    ...candidate,
    args: {
      ...args,
      apiKey: '<redacted>',
      passphrase: '<redacted>',
      sign: '<redacted>',
    },
  };
}

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}
