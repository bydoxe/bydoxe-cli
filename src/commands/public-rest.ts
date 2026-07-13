import type { HttpMethod } from '../auth/signature.js';
import type { BuiltRequest } from '../http/request.js';
import {
  type CommandMetadata,
  withCommandMetadata,
} from './metadata.js';

export interface ParsedArgs {
  command: string[];
  flags: Record<string, string | boolean>;
}

export interface PublicRestCommand extends CommandMetadata {
  command: string[];
  method: HttpMethod;
  path: string;
  description: string;
}

export interface PublicRestCommandMatch {
  definition: PublicRestCommand;
  query: Record<string, string | number | boolean | undefined>;
}

export interface DryRunPreview {
  dryRun: true;
  command: string;
  request: BuiltRequest;
}

const GLOBAL_FLAGS = new Set(['base-url', 'dry-run', 'format', 'help']);

const PUBLIC_QUERY_METADATA = {
  auth: 'public',
  riskLevel: 'low',
  requiredParams: [],
  optionalParams: [],
  parameterMode: 'query',
} satisfies CommandMetadata;

export const PUBLIC_REST_COMMANDS: PublicRestCommand[] = withCommandMetadata(
  [
    {
      command: ['public', 'time'],
      method: 'GET',
      path: '/public/time',
      description: 'Build or execute a server time request',
    },
    {
      command: ['spot', 'market', 'symbols'],
      method: 'GET',
      path: '/spot/market/symbols',
      description: 'Build or execute a spot market symbols request',
    },
    {
      command: ['spot', 'market', 'tickers'],
      method: 'GET',
      path: '/spot/market/tickers',
      description: 'Build or execute a spot market tickers request',
    },
    {
      command: ['spot', 'market', 'orderbook'],
      method: 'GET',
      path: '/spot/market/orderbook',
      description: 'Build or execute a spot order book request',
    },
    {
      command: ['spot', 'market', 'candles'],
      method: 'GET',
      path: '/spot/market/candles',
      description: 'Build or execute a spot candles request',
    },
    {
      command: ['future', 'market', 'ticker'],
      method: 'GET',
      path: '/future/market/24h-ticker',
      description: 'Build or execute a futures 24h ticker request',
    },
    {
      command: ['future', 'market', 'mark-price'],
      method: 'GET',
      path: '/future/market/mark-price',
      description: 'Build or execute a futures mark price request',
    },
  ],
  (command) =>
    command.path === '/public/time'
      ? { ...PUBLIC_QUERY_METADATA, parameterMode: 'none' }
      : PUBLIC_QUERY_METADATA,
);

export function parseArgs(argv: string[]): ParsedArgs {
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

export function findPublicRestCommand(
  parsed: ParsedArgs,
): PublicRestCommandMatch | undefined {
  const definition = PUBLIC_REST_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  return {
    definition,
    query: getQueryFlags(parsed.flags),
  };
}

export function commandToString(command: string[]): string {
  return `bydoxe ${command.join(' ')}`;
}

function getQueryFlags(
  flags: Record<string, string | boolean>,
): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(flags).filter(([name]) => !GLOBAL_FLAGS.has(name)),
  );
}

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}
