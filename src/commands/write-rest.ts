import { CliError } from '../errors/cli-error.js';
import type { HttpMethod } from '../auth/signature.js';
import type { ParsedArgs } from './public-rest.js';

export interface WriteRestCommand {
  command: string[];
  method: HttpMethod;
  path: string;
  description: string;
  risk: string;
}

export interface WriteRestCommandMatch {
  definition: WriteRestCommand;
  body: unknown;
}

const GLOBAL_FLAGS = new Set([
  'base-url',
  'body',
  'confirm',
  'dry-run',
  'format',
  'help',
]);

export const REQUIRED_CONFIRMATION = 'CONFIRM';

export const WRITE_REST_COMMANDS: WriteRestCommand[] = [
  {
    command: ['spot', 'trade', 'place-order'],
    method: 'POST',
    path: '/spot/trade/place-order',
    description: 'Requires CONFIRM: place a spot order',
    risk: 'Places a spot order.',
  },
  {
    command: ['spot', 'trade', 'cancel-order'],
    method: 'POST',
    path: '/spot/trade/cancel-order',
    description: 'Requires CONFIRM: cancel a spot order',
    risk: 'Cancels a spot order.',
  },
  {
    command: ['spot', 'trade', 'cancel-replace-order'],
    method: 'POST',
    path: '/spot/trade/cancel-replace-order',
    description: 'Requires CONFIRM: cancel and replace a spot order',
    risk: 'Cancels an existing spot order and places a replacement.',
  },
  {
    command: ['spot', 'trade', 'batch-cancel-replace-order'],
    method: 'POST',
    path: '/spot/trade/batch-cancel-replace-order',
    description: 'Requires CONFIRM: batch cancel and replace spot orders',
    risk: 'Cancels and replaces multiple spot orders.',
  },
  {
    command: ['spot', 'trade', 'batch-orders'],
    method: 'POST',
    path: '/spot/trade/batch-orders',
    description: 'Requires CONFIRM: place batch spot orders',
    risk: 'Places multiple spot orders.',
  },
  {
    command: ['spot', 'trade', 'batch-cancel-orders'],
    method: 'POST',
    path: '/spot/trade/batch-cancel-orders',
    description: 'Requires CONFIRM: cancel batch spot orders',
    risk: 'Cancels multiple spot orders.',
  },
  {
    command: ['spot', 'trade', 'cancel-symbol-order'],
    method: 'POST',
    path: '/spot/trade/cancel-symbol-order',
    description: 'Requires CONFIRM: cancel all spot orders for a symbol',
    risk: 'Cancels open spot orders for a symbol.',
  },
  {
    command: ['spot', 'account', 'transfer'],
    method: 'POST',
    path: '/spot/account/transfer',
    description: 'Requires CONFIRM: transfer funds between accounts',
    risk: 'Moves funds between accounts.',
  },
  {
    command: ['spot', 'account', 'withdraw'],
    method: 'POST',
    path: '/spot/account/withdraw',
    description: 'Requires CONFIRM: withdraw assets',
    risk: 'Withdraws assets from the exchange.',
  },
  {
    command: ['spot', 'account', 'cancel-withdraw'],
    method: 'POST',
    path: '/spot/account/cancel-withdraw',
    description: 'Requires CONFIRM: cancel a withdrawal',
    risk: 'Cancels a withdrawal request.',
  },
  {
    command: ['future', 'account', 'set-leverage'],
    method: 'POST',
    path: '/future/account/set-leverage',
    description: 'Requires CONFIRM: change futures leverage',
    risk: 'Changes leverage for a futures symbol.',
  },
  {
    command: ['future', 'account', 'set-margin'],
    method: 'POST',
    path: '/future/account/set-margin',
    description: 'Requires CONFIRM: adjust futures margin',
    risk: 'Adjusts futures position margin.',
  },
  {
    command: ['future', 'account', 'set-margin-mode'],
    method: 'POST',
    path: '/future/account/set-margin-mode',
    description: 'Requires CONFIRM: change futures margin mode',
    risk: 'Changes futures margin mode.',
  },
  {
    command: ['future', 'order', 'place'],
    method: 'POST',
    path: '/future/order/place-order',
    description: 'Requires CONFIRM: place a futures order',
    risk: 'Places a futures order.',
  },
  {
    command: ['future', 'order', 'click-backhand'],
    method: 'POST',
    path: '/future/order/click-backhand',
    description: 'Requires CONFIRM: place a futures reversal order',
    risk: 'Places a futures reversal order.',
  },
  {
    command: ['future', 'order', 'batch-place'],
    method: 'POST',
    path: '/future/order/batch-place-order',
    description: 'Requires CONFIRM: place batch futures orders',
    risk: 'Places multiple futures orders.',
  },
  {
    command: ['future', 'order', 'modify'],
    method: 'POST',
    path: '/future/order/modify-order',
    description: 'Requires CONFIRM: modify a futures order',
    risk: 'Modifies a futures order.',
  },
  {
    command: ['future', 'order', 'cancel'],
    method: 'POST',
    path: '/future/order/cancel-order',
    description: 'Requires CONFIRM: cancel a futures order',
    risk: 'Cancels a futures order.',
  },
  {
    command: ['future', 'order', 'batch-cancel'],
    method: 'POST',
    path: '/future/order/batch-cancel-orders',
    description: 'Requires CONFIRM: cancel batch futures orders',
    risk: 'Cancels multiple futures orders.',
  },
  {
    command: ['future', 'order', 'close-positions'],
    method: 'POST',
    path: '/future/order/close-positions',
    description: 'Requires CONFIRM: close futures positions',
    risk: 'Closes futures positions.',
  },
  {
    command: ['future', 'order', 'cancel-all'],
    method: 'POST',
    path: '/future/order/cancel-all-orders',
    description: 'Requires CONFIRM: cancel all futures orders',
    risk: 'Cancels all futures orders.',
  },
  {
    command: ['future', 'trigger', 'place'],
    method: 'POST',
    path: '/future/order/place-plan-order',
    description: 'Requires CONFIRM: place a futures trigger order',
    risk: 'Places a futures trigger order.',
  },
  {
    command: ['future', 'trigger', 'modify'],
    method: 'POST',
    path: '/future/order/modify-plan-order',
    description: 'Requires CONFIRM: modify a futures trigger order',
    risk: 'Modifies a futures trigger order.',
  },
  {
    command: ['future', 'trigger', 'cancel'],
    method: 'POST',
    path: '/future/order/cancel-plan-order',
    description: 'Requires CONFIRM: cancel futures trigger orders',
    risk: 'Cancels futures trigger orders.',
  },
  {
    command: ['future', 'tpsl', 'place'],
    method: 'POST',
    path: '/future/order/place-tpsl-order',
    description: 'Requires CONFIRM: place a futures TP/SL order',
    risk: 'Places a futures take-profit or stop-loss order.',
  },
  {
    command: ['future', 'tpsl', 'modify'],
    method: 'POST',
    path: '/future/order/modify-tpsl-order',
    description: 'Requires CONFIRM: modify a futures TP/SL order',
    risk: 'Modifies a futures take-profit or stop-loss order.',
  },
];

export function findWriteRestCommand(
  parsed: ParsedArgs,
): WriteRestCommandMatch | undefined {
  const definition = WRITE_REST_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  return {
    definition,
    body: getBody(parsed.flags),
  };
}

export function assertWriteConfirmed(flags: Record<string, string | boolean>): void {
  if (flags.confirm !== REQUIRED_CONFIRMATION) {
    throw new CliError(
      `Write commands require --confirm ${REQUIRED_CONFIRMATION}. Run with --dry-run first and review the request preview.`,
    );
  }
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

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}
