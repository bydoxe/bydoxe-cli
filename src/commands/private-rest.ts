import { CliError } from '../errors/cli-error.js';
import type { HttpMethod } from '../auth/signature.js';
import type { BuiltRequest } from '../http/request.js';
import {
  assertRequiredParamsPresent,
  type CommandMetadata,
  withCommandMetadata,
} from './metadata.js';
import type { ParsedArgs } from './public-rest.js';

export interface PrivateRestCommand extends CommandMetadata {
  command: string[];
  method: HttpMethod;
  path: string;
  description: string;
}

export interface PrivateRestCommandMatch {
  definition: PrivateRestCommand;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
}

const GLOBAL_FLAGS = new Set(['base-url', 'body', 'dry-run', 'format', 'help']);
const REDACTED_HEADERS = new Set([
  'ACCESS-KEY',
  'ACCESS-SIGN',
  'ACCESS-PASSPHRASE',
]);

const PRIVATE_QUERY_METADATA = {
  auth: 'private',
  riskLevel: 'low',
  requiredParams: [],
  optionalParams: [],
  parameterMode: 'query',
} satisfies CommandMetadata;

const PRIVATE_BODY_METADATA = {
  auth: 'private',
  riskLevel: 'low',
  requiredParams: [],
  optionalParams: [],
  parameterMode: 'body',
} satisfies CommandMetadata;

const PRIVATE_REST_METADATA_BY_PATH: Record<string, CommandMetadata> = {
  '/common/trade-fee': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['tradeType'],
  },
  '/account/funding-assets': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin'],
  },
  '/account/all-account-balance': PRIVATE_QUERY_METADATA,
  '/spot/trade/unfilled-orders': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'clientOid', 'limit', 'startTime', 'endTime'],
  },
  '/spot/trade/history-orders': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'clientOid', 'limit', 'startTime', 'endTime'],
  },
  '/spot/trade/fills': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'limit', 'startTime', 'endTime'],
  },
  '/spot/trade/order-info': {
    ...PRIVATE_BODY_METADATA,
    requiredParams: ['orderId'],
  },
  '/spot/account/assets': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin', 'assetType'],
  },
  '/spot/account/transfer-coin-info': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin'],
  },
  '/spot/account/withdrawal-records': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin', 'limit', 'startTime', 'endTime'],
  },
  '/spot/account/deposit-records': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin', 'limit', 'startTime', 'endTime'],
  },
  '/spot/account/transfer-records': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['coin', 'fromType', 'toType', 'limit', 'startTime', 'endTime'],
  },
  '/spot/account/deposit-address': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['coin'],
    optionalParams: ['chain'],
  },
  '/future/position/single-position': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['symbol'],
  },
  '/future/position/all-position': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/future/position/history-position': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'limit', 'startTime', 'endTime'],
  },
  '/future/account': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol'],
  },
  '/future/account/max-open': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['posSide', 'orderType', 'openPrice', 'leverage'],
  },
  '/future/account/liq-price': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['posSide', 'orderType', 'openAmount', 'openPrice'],
  },
  '/future/account/open-count': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['posSide', 'orderType', 'openPrice', 'openAmount'],
  },
  '/future/order/detail': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'clientOid'],
  },
  '/future/order/fills': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'limit', 'startTime', 'endTime'],
  },
  '/future/order/fill-history': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'orderId', 'limit', 'startTime', 'endTime'],
  },
  '/future/order/orders-pending': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'limit', 'startTime', 'endTime'],
  },
  '/future/order/orders-history': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'limit', 'startTime', 'endTime'],
  },
  '/future/order/orders-plan-pending': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['limit'],
    optionalParams: ['symbol', 'idLessThan', 'startTime', 'endTime', 'orderId'],
  },
  '/future/order/orders-plan-history': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['limit'],
    optionalParams: ['symbol', 'idLessThan', 'startTime', 'endTime', 'orderId', 'clientOid'],
  },
  '/copy/mix-trader/order-current-track': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'trackingNo', 'pageNo', 'pageSize'],
  },
  '/copy/mix-trader/order-history-track': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'trackingNo', 'pageNo', 'pageSize'],
  },
  '/copy/mix-trader/order-total-detail': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'trackingNo'],
  },
  '/copy/mix-trader/profit-history-summarys': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'pageNo', 'pageSize', 'startTime', 'endTime'],
  },
  '/copy/mix-trader/profit-history-details': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'trackingNo', 'pageNo', 'pageSize'],
  },
  '/copy/mix-trader/profit-details': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['symbol', 'trackingNo'],
  },
  '/copy/mix-trader/query-followers': {
    ...PRIVATE_QUERY_METADATA,
    optionalParams: ['pageNo', 'pageSize'],
  },
  '/copy/mix-follower/query-current-orders': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['productType'],
    optionalParams: [
      'symbol',
      'traderUid',
      'startTime',
      'endTime',
      'limit',
      'idLessThan',
      'idGreaterThan',
    ],
  },
  '/copy/mix-follower/query-history-orders': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['productType'],
    optionalParams: [
      'symbol',
      'traderUid',
      'startTime',
      'endTime',
      'limit',
      'idLessThan',
      'idGreaterThan',
    ],
  },
  '/copy/mix-follower/query-copy-trade-settings': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['productType'],
    optionalParams: ['traderUid'],
  },
  '/copy/mix-follower/query-my-traders': {
    ...PRIVATE_QUERY_METADATA,
    requiredParams: ['productType'],
  },
};

export const PRIVATE_REST_COMMANDS: PrivateRestCommand[] = withCommandMetadata([
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
    command: ['spot', 'trade', 'order-info'],
    method: 'POST',
    path: '/spot/trade/order-info',
    description: 'Build or execute a spot order information request',
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
  {
    command: ['future', 'trigger', 'orders-pending'],
    method: 'GET',
    path: '/future/order/orders-plan-pending',
    description: 'Build or execute a futures pending trigger orders request',
  },
  {
    command: ['future', 'trigger', 'orders-history'],
    method: 'GET',
    path: '/future/order/orders-plan-history',
    description: 'Build or execute a futures trigger order history request',
  },
  {
    command: ['copytrading', 'trader', 'current-orders'],
    method: 'GET',
    path: '/copy/mix-trader/order-current-track',
    description: 'Build or execute a copy trading trader current orders request',
  },
  {
    command: ['copytrading', 'trader', 'history-orders'],
    method: 'GET',
    path: '/copy/mix-trader/order-history-track',
    description: 'Build or execute a copy trading trader order history request',
  },
  {
    command: ['copytrading', 'trader', 'total-detail'],
    method: 'GET',
    path: '/copy/mix-trader/order-total-detail',
    description: 'Build or execute a copy trading trader total detail request',
  },
  {
    command: ['copytrading', 'trader', 'profit-summary'],
    method: 'GET',
    path: '/copy/mix-trader/profit-history-summarys',
    description: 'Build or execute a copy trading trader profit summary request',
  },
  {
    command: ['copytrading', 'trader', 'profit-history'],
    method: 'GET',
    path: '/copy/mix-trader/profit-history-details',
    description: 'Build or execute a copy trading trader profit history request',
  },
  {
    command: ['copytrading', 'trader', 'profit-details'],
    method: 'GET',
    path: '/copy/mix-trader/profit-details',
    description: 'Build or execute a copy trading trader profit details request',
  },
  {
    command: ['copytrading', 'trader', 'followers'],
    method: 'GET',
    path: '/copy/mix-trader/query-followers',
    description: 'Build or execute a copy trading trader followers request',
  },
  {
    command: ['copytrading', 'follower', 'current-orders'],
    method: 'GET',
    path: '/copy/mix-follower/query-current-orders',
    description: 'Build or execute a copy trading follower current orders request',
  },
  {
    command: ['copytrading', 'follower', 'history-orders'],
    method: 'GET',
    path: '/copy/mix-follower/query-history-orders',
    description: 'Build or execute a copy trading follower order history request',
  },
  {
    command: ['copytrading', 'follower', 'settings'],
    method: 'GET',
    path: '/copy/mix-follower/query-copy-trade-settings',
    description: 'Build or execute a copy trading follower settings request',
  },
  {
    command: ['copytrading', 'follower', 'traders'],
    method: 'GET',
    path: '/copy/mix-follower/query-my-traders',
    description: 'Build or execute a copy trading follower traders request',
  },
], (command) => PRIVATE_REST_METADATA_BY_PATH[command.path] ?? PRIVATE_QUERY_METADATA);

export function findPrivateRestCommand(
  parsed: ParsedArgs,
): PrivateRestCommandMatch | undefined {
  const definition = PRIVATE_REST_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  if (definition.parameterMode === 'body') {
    const body = getBody(parsed.flags);
    assertRequiredParamsPresent(
      definition,
      getParamValues(body),
      `bydoxe ${parsed.command.join(' ')}`,
    );

    return {
      definition,
      body,
    };
  }

  const query = getQueryFlags(parsed.flags);
  assertRequiredParamsPresent(
    definition,
    query,
    `bydoxe ${parsed.command.join(' ')}`,
  );

  return {
    definition,
    query,
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

function getBody(flags: Record<string, string | boolean>): unknown {
  if (typeof flags.body === 'string') {
    try {
      return JSON.parse(flags.body);
    } catch (error) {
      throw new CliError(
        `Invalid JSON passed to --body: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const body = Object.fromEntries(
    Object.entries(flags).filter(([name]) => !GLOBAL_FLAGS.has(name)),
  );

  return Object.keys(body).length > 0 ? body : undefined;
}

function getParamValues(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}
