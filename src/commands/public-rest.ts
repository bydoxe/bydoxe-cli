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

const PUBLIC_REST_METADATA_BY_PATH: Record<string, CommandMetadata> = {
  '/public/time': {
    ...PUBLIC_QUERY_METADATA,
    parameterMode: 'none',
  },
  '/spot/market/coins': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['coin'],
  },
  '/spot/market/symbols': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/spot/market/tickers': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/spot/market/orderbook': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['limit'],
  },
  '/spot/market/candles': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol', 'granularity'],
    optionalParams: ['startTime', 'endTime', 'limit'],
  },
  '/spot/market/history-candles': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol', 'granularity'],
    optionalParams: ['startTime', 'endTime', 'limit'],
  },
  '/spot/market/fills': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['limit'],
  },
  '/spot/market/fills-history': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['limit', 'fromId', 'startTime', 'endTime'],
  },
  '/future/market/24h-ticker': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/future/market/mark-price': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/future/market/book-ticker': {
    ...PUBLIC_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/future/market/depth': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['limit'],
  },
  '/future/market/candles': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol', 'interval'],
    optionalParams: ['limit', 'startTime', 'endTime'],
  },
  '/future/market/funding-info': PUBLIC_QUERY_METADATA,
  '/future/market/open-interest': {
    ...PUBLIC_QUERY_METADATA,
    requiredParams: ['symbol'],
  },
};

export const PUBLIC_REST_COMMANDS: PublicRestCommand[] = withCommandMetadata(
  [
    {
      command: ['public', 'time'],
      method: 'GET',
      path: '/public/time',
      description: 'Build or execute a server time request',
    },
    {
      command: ['spot', 'market', 'coins'],
      method: 'GET',
      path: '/spot/market/coins',
      description: 'Build or execute a spot coin metadata request',
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
      command: ['spot', 'market', 'history-candles'],
      method: 'GET',
      path: '/spot/market/history-candles',
      description: 'Build or execute a spot historical candles request',
    },
    {
      command: ['spot', 'market', 'fills'],
      method: 'GET',
      path: '/spot/market/fills',
      description: 'Build or execute a spot recent trades request',
    },
    {
      command: ['spot', 'market', 'fills-history'],
      method: 'GET',
      path: '/spot/market/fills-history',
      description: 'Build or execute a spot historical trades request',
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
    {
      command: ['future', 'market', 'book-ticker'],
      method: 'GET',
      path: '/future/market/book-ticker',
      description: 'Build or execute a futures best bid and ask request',
    },
    {
      command: ['future', 'market', 'depth'],
      method: 'GET',
      path: '/future/market/depth',
      description: 'Build or execute a futures order book depth request',
    },
    {
      command: ['future', 'market', 'candles'],
      method: 'GET',
      path: '/future/market/candles',
      description: 'Build or execute a futures candles request',
    },
    {
      command: ['future', 'market', 'funding-info'],
      method: 'GET',
      path: '/future/market/funding-info',
      description: 'Build or execute a futures funding configuration request',
    },
    {
      command: ['future', 'market', 'open-interest'],
      method: 'GET',
      path: '/future/market/open-interest',
      description: 'Build or execute a futures open interest request',
    },
  ],
  (command) => PUBLIC_REST_METADATA_BY_PATH[command.path] ?? PUBLIC_QUERY_METADATA,
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
