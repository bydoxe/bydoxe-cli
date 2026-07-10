import type { HttpMethod } from '../auth/signature.js';
import type { BuiltRequest } from '../http/request.js';
import type { ParsedArgs } from './public-rest.js';

export interface PrivateRestCommand {
  command: string[];
  method: HttpMethod;
  path: string;
  description: string;
}

export interface PrivateRestCommandMatch {
  definition: PrivateRestCommand;
  query: Record<string, string | number | boolean | undefined>;
}

const GLOBAL_FLAGS = new Set(['base-url', 'dry-run', 'format', 'help']);
const REDACTED_HEADERS = new Set([
  'ACCESS-KEY',
  'ACCESS-SIGN',
  'ACCESS-PASSPHRASE',
]);

export const PRIVATE_REST_COMMANDS: PrivateRestCommand[] = [
  {
    command: ['common', 'trade-fee'],
    method: 'GET',
    path: '/common/trade-fee',
    description: 'Build or execute an authenticated trade fee request',
  },
  {
    command: ['account', 'funding-assets'],
    method: 'GET',
    path: '/account/funding-assets',
    description: 'Build or execute a funding assets request',
  },
  {
    command: ['account', 'all-balance'],
    method: 'GET',
    path: '/account/all-account-balance',
    description: 'Build or execute an all-account balance request',
  },
  {
    command: ['spot', 'trade', 'unfilled-orders'],
    method: 'GET',
    path: '/spot/trade/unfilled-orders',
    description: 'Build or execute a spot unfilled orders request',
  },
  {
    command: ['spot', 'trade', 'history-orders'],
    method: 'GET',
    path: '/spot/trade/history-orders',
    description: 'Build or execute a spot order history request',
  },
  {
    command: ['spot', 'trade', 'fills'],
    method: 'GET',
    path: '/spot/trade/fills',
    description: 'Build or execute a spot order fills request',
  },
  {
    command: ['spot', 'account', 'assets'],
    method: 'GET',
    path: '/spot/account/assets',
    description: 'Build or execute a spot account assets request',
  },
  {
    command: ['spot', 'account', 'transfer-coin-info'],
    method: 'GET',
    path: '/spot/account/transfer-coin-info',
    description: 'Build or execute a spot transfer coin info request',
  },
  {
    command: ['spot', 'account', 'withdrawal-records'],
    method: 'GET',
    path: '/spot/account/withdrawal-records',
    description: 'Build or execute a spot withdrawal records request',
  },
  {
    command: ['spot', 'account', 'deposit-records'],
    method: 'GET',
    path: '/spot/account/deposit-records',
    description: 'Build or execute a spot deposit records request',
  },
  {
    command: ['spot', 'account', 'transfer-records'],
    method: 'GET',
    path: '/spot/account/transfer-records',
    description: 'Build or execute a spot transfer records request',
  },
  {
    command: ['spot', 'account', 'deposit-address'],
    method: 'GET',
    path: '/spot/account/deposit-address',
    description: 'Build or execute a spot deposit address request',
  },
  {
    command: ['future', 'position', 'single'],
    method: 'GET',
    path: '/future/position/single-position',
    description: 'Build or execute a futures single-position request',
  },
  {
    command: ['future', 'position', 'all'],
    method: 'GET',
    path: '/future/position/all-position',
    description: 'Build or execute a futures all-position request',
  },
  {
    command: ['future', 'position', 'history'],
    method: 'GET',
    path: '/future/position/history-position',
    description: 'Build or execute a futures position history request',
  },
  {
    command: ['future', 'account', 'info'],
    method: 'GET',
    path: '/future/account',
    description: 'Build or execute a futures account request',
  },
  {
    command: ['future', 'account', 'max-open'],
    method: 'GET',
    path: '/future/account/max-open',
    description: 'Build or execute a futures max open request',
  },
  {
    command: ['future', 'account', 'liq-price'],
    method: 'GET',
    path: '/future/account/liq-price',
    description: 'Build or execute a futures liquidation price estimate request',
  },
  {
    command: ['future', 'account', 'open-count'],
    method: 'GET',
    path: '/future/account/open-count',
    description: 'Build or execute a futures open count estimate request',
  },
  {
    command: ['future', 'order', 'detail'],
    method: 'GET',
    path: '/future/order/detail',
    description: 'Build or execute a futures order detail request',
  },
  {
    command: ['future', 'order', 'fills'],
    method: 'GET',
    path: '/future/order/fills',
    description: 'Build or execute a futures order fills request',
  },
  {
    command: ['future', 'order', 'fill-history'],
    method: 'GET',
    path: '/future/order/fill-history',
    description: 'Build or execute a futures fill history request',
  },
  {
    command: ['future', 'order', 'orders-pending'],
    method: 'GET',
    path: '/future/order/orders-pending',
    description: 'Build or execute a futures pending orders request',
  },
  {
    command: ['future', 'order', 'orders-history'],
    method: 'GET',
    path: '/future/order/orders-history',
    description: 'Build or execute a futures order history request',
  },
];

export function findPrivateRestCommand(
  parsed: ParsedArgs,
): PrivateRestCommandMatch | undefined {
  const definition = PRIVATE_REST_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  return {
    definition,
    query: getQueryFlags(parsed.flags),
  };
}

export function redactPrivateRequest(request: BuiltRequest): BuiltRequest {
  return {
    ...request,
    headers: Object.fromEntries(
      Object.entries(request.headers).map(([name, value]) => [
        name,
        REDACTED_HEADERS.has(name) ? '<redacted>' : value,
      ]),
    ),
  };
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
