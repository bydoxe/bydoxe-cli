import { CliError } from '../errors/cli-error.js';
import type { HttpMethod } from '../auth/signature.js';
import {
  assertRequiredParamsPresent,
  type CommandMetadata,
  withCommandMetadata,
} from './metadata.js';
import type { ParsedArgs } from './public-rest.js';

export interface WriteRestCommand extends CommandMetadata {
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

const WRITE_BODY_METADATA = {
  auth: 'private',
  riskLevel: 'high',
  requiredParams: [],
  optionalParams: [],
  parameterMode: 'body',
} satisfies CommandMetadata;

const WRITE_REST_METADATA_BY_PATH: Record<string, CommandMetadata> = {
  '/spot/trade/place-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['base', 'quote', 'orderType', 'tradeType', 'amount'],
    optionalParams: ['price', 'stopPrice', 'clientOid'],
  },
  '/spot/trade/cancel-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'orderId'],
  },
  '/spot/trade/cancel-replace-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'price', 'size', 'orderId'],
  },
  '/spot/trade/batch-cancel-replace-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderList'],
  },
  '/spot/trade/batch-orders': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderList'],
    optionalParams: ['symbol', 'batchMode'],
  },
  '/spot/trade/batch-cancel-orders': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderList'],
    optionalParams: ['symbol', 'batchMode'],
  },
  '/spot/trade/cancel-symbol-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol'],
  },
  '/spot/account/transfer': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['from', 'to', 'symbol', 'quantity'],
  },
  '/spot/account/withdraw': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['address', 'coinSymbol', 'network', 'quantity', 'pinCode'],
    optionalParams: ['destinationTag', 'otpCode'],
  },
  '/spot/account/cancel-withdraw': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderId'],
  },
  '/future/account/set-leverage': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['longLeverage', 'shortLeverage', 'leverage', 'marginCoin'],
  },
  '/future/account/set-margin': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'holdSide', 'amount'],
  },
  '/future/account/set-margin-mode': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'marginMode'],
  },
  '/future/order/place-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'marginMode', 'size', 'side', 'tradeSide', 'orderType'],
    optionalParams: [
      'price',
      'force',
      'clientOid',
      'presetTakeProfitPrice',
      'presetStopLossPrice',
      'presetTakeProfitExecutePrice',
      'presetStopLossExecutePrice',
    ],
  },
  '/future/order/click-backhand': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'side'],
    optionalParams: ['clientOid'],
  },
  '/future/order/batch-place-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'marginMode', 'orderList'],
  },
  '/future/order/modify-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'newClientOid'],
    optionalParams: [
      'orderId',
      'clientOid',
      'newSize',
      'newPrice',
      'newPresetTakeProfitPrice',
      'newPresetStopLossPrice',
    ],
  },
  '/future/order/cancel-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol'],
    optionalParams: ['orderId', 'clientOid'],
  },
  '/future/order/batch-cancel-orders': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderIdList'],
  },
  '/future/order/close-positions': {
    ...WRITE_BODY_METADATA,
    optionalParams: ['symbol', 'holdSide'],
  },
  '/future/order/cancel-all-orders': {
    ...WRITE_BODY_METADATA,
    optionalParams: [],
  },
  '/future/order/place-plan-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: [
      'symbol',
      'marginMode',
      'size',
      'side',
      'triggerPrice',
      'triggerPriceType',
    ],
    optionalParams: [
      'price',
      'clientOid',
      'presetTakeProfitPrice',
      'presetStopLossPrice',
      'presetTakeProfitExecutePrice',
      'presetStopLossExecutePrice',
    ],
  },
  '/future/order/modify-plan-order': {
    ...WRITE_BODY_METADATA,
    optionalParams: [
      'orderId',
      'clientOid',
      'newPrice',
      'newSize',
      'newTriggerPrice',
      'newTriggerPriceType',
      'newPresetTakeProfitPrice',
      'newPresetTakeProfitExecutePrice',
      'newPresetTakeProfitPriceType',
      'newPresetStopLossPrice',
      'newPresetStopLossExecutePrice',
      'newPresetStopLossPriceType',
    ],
  },
  '/future/order/cancel-plan-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderIdList'],
    optionalParams: ['symbol'],
  },
  '/future/order/place-tpsl-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: [
      'symbol',
      'planType',
      'holdSide',
      'orderType',
      'triggerPrice',
      'triggerPriceType',
      'size',
    ],
    optionalParams: ['executePrice', 'clientOid'],
  },
  '/future/order/modify-tpsl-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['symbol', 'orderType', 'triggerPrice', 'size'],
    optionalParams: ['orderId', 'clientOid', 'triggerPriceType', 'executePrice'],
  },
  '/future/order/cancel-tpsl-order': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['orderIdList'],
    optionalParams: ['symbol'],
  },
  '/copy/mix-trader/order-modify-tpsl': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['trackingNo', 'productType'],
    optionalParams: [
      'stopSurplusPrice',
      'stopSurplusTriggerPriceType',
      'stopSurplusOrderType',
      'stopSurplusLimitPrice',
      'stopSurplusAmountType',
      'stopSurplusQuantity',
      'stopLossPrice',
      'stopLossTriggerPriceType',
      'stopLossOrderType',
      'stopLossLimitPrice',
      'stopLossAmountType',
      'stopLossQuantity',
    ],
  },
  '/copy/mix-trader/order-close-positions': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['trackingNo', 'symbol', 'productType'],
    optionalParams: ['orderType', 'quantity', 'price'],
  },
  '/copy/mix-trader/config-trader-setting': {
    ...WRITE_BODY_METADATA,
    optionalParams: [
      'traderMode',
      'copyPairList',
      'nickName',
      'introduction',
      'profitShareRatio',
      'showFund',
      'showFollowerList',
      'showLeadingHist',
    ],
  },
  '/copy/mix-trader/remove-follower': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['followerUid'],
  },
  '/copy/mix-follower/setting-tpsl': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['productType', 'trackingNo'],
    optionalParams: [
      'stopSurplusPrice',
      'stopSurplusTriggerPriceType',
      'stopSurplusOrderType',
      'stopSurplusLimitPrice',
      'stopSurplusAmountType',
      'stopSurplusQuantity',
      'stopLossPrice',
      'stopLossTriggerPriceType',
      'stopLossOrderType',
      'stopLossLimitPrice',
      'stopLossAmountType',
      'stopLossQuantity',
    ],
  },
  '/copy/mix-follower/setting-copy-trade': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['productType', 'traderUid'],
    optionalParams: [
      'fixedAmount',
      'dailyMarginLimitMax',
      'orderType',
      'amountPerOrderUsdt',
    ],
  },
  '/copy/mix-follower/close-positions': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['productType', 'trackingNo', 'symbol'],
    optionalParams: ['orderType', 'quantity', 'price'],
  },
  '/copy/mix-follower/cancel-follow': {
    ...WRITE_BODY_METADATA,
    requiredParams: ['productType', 'traderUid'],
  },
};

export type EnumRule = {
  param: string;
  values: string[];
};

export type ArrayItemValidationRule = {
  param: string;
  requiredParams?: string[];
  positiveNumberParams?: string[];
  enumParams?: EnumRule[];
  requireAnyParams?: string[][];
};

export type WriteValidationRule = {
  nonEmptyStringParams?: string[];
  positiveNumberParams?: string[];
  enumParams?: EnumRule[];
  requireAnyParams?: string[][];
  arrayParams?: ArrayItemValidationRule[];
  requireAnyNonEmptyArrayParams?: string[][];
};

const COMMON_ORDER_ENUMS = [
  { param: 'orderType', values: ['MARKET', 'LIMIT'] },
  { param: 'timeInForce', values: ['GTC', 'IOC', 'FOK'] },
];

const SPOT_ORDER_ENUMS = [
  ...COMMON_ORDER_ENUMS,
  { param: 'tradeType', values: ['BUY', 'SELL'] },
];

const FUTURES_ORDER_ENUMS = [
  ...COMMON_ORDER_ENUMS,
  { param: 'side', values: ['BUY', 'SELL'] },
  { param: 'holdSide', values: ['LONG', 'SHORT'] },
];

export const WRITE_REST_VALIDATION_BY_PATH: Record<string, WriteValidationRule> = {
  '/spot/trade/place-order': {
    nonEmptyStringParams: ['base', 'quote', 'clientOid'],
    positiveNumberParams: ['amount', 'price'],
    enumParams: SPOT_ORDER_ENUMS,
  },
  '/spot/trade/cancel-order': {
    nonEmptyStringParams: ['symbol', 'orderId'],
  },
  '/spot/trade/cancel-replace-order': {
    nonEmptyStringParams: ['symbol', 'orderId'],
    positiveNumberParams: ['price', 'size'],
  },
  '/spot/trade/batch-cancel-replace-order': {
    arrayParams: [
      {
        param: 'orderList',
        requiredParams: ['symbol', 'price', 'size', 'orderId'],
        positiveNumberParams: ['price', 'size'],
      },
    ],
  },
  '/spot/trade/batch-orders': {
    arrayParams: [
      {
        param: 'orderList',
        requiredParams: ['side', 'orderType', 'size'],
        positiveNumberParams: ['size', 'price'],
        enumParams: [
          { param: 'side', values: ['BUY', 'SELL'] },
          { param: 'orderType', values: ['MARKET', 'LIMIT'] },
        ],
      },
    ],
  },
  '/spot/trade/batch-cancel-orders': {
    arrayParams: [
      {
        param: 'orderList',
        requiredParams: ['orderId'],
      },
    ],
  },
  '/spot/trade/cancel-symbol-order': {
    nonEmptyStringParams: ['symbol'],
  },
  '/spot/account/transfer': {
    nonEmptyStringParams: ['from', 'to', 'symbol'],
    positiveNumberParams: ['quantity'],
    enumParams: [
      { param: 'from', values: ['FUSD', 'SPOT', 'LENDING', 'STAKING'] },
      { param: 'to', values: ['FUSD', 'SPOT', 'LENDING', 'STAKING'] },
    ],
  },
  '/spot/account/withdraw': {
    nonEmptyStringParams: [
      'address',
      'coinSymbol',
      'network',
      'pinCode',
      'destinationTag',
      'otpCode',
    ],
    positiveNumberParams: ['quantity'],
  },
  '/spot/account/cancel-withdraw': {
    nonEmptyStringParams: ['orderId'],
  },
  '/future/account/set-leverage': {
    nonEmptyStringParams: ['symbol', 'marginCoin'],
    positiveNumberParams: ['longLeverage', 'shortLeverage', 'leverage'],
  },
  '/future/account/set-margin': {
    nonEmptyStringParams: ['symbol'],
    positiveNumberParams: ['amount'],
    enumParams: [{ param: 'holdSide', values: ['LONG', 'SHORT'] }],
  },
  '/future/account/set-margin-mode': {
    nonEmptyStringParams: ['symbol'],
    enumParams: [{ param: 'marginMode', values: ['CROSS', 'ISOLATED'] }],
  },
  '/future/order/place-order': {
    nonEmptyStringParams: ['symbol', 'marginMode', 'clientOid'],
    positiveNumberParams: [
      'size',
      'price',
      'presetTakeProfitPrice',
      'presetStopLossPrice',
      'presetTakeProfitExecutePrice',
      'presetStopLossExecutePrice',
    ],
    enumParams: [
      { param: 'side', values: ['LONG', 'SHORT'] },
      { param: 'tradeSide', values: ['OPEN', 'CLOSE'] },
      { param: 'orderType', values: ['LIMIT', 'MARKET'] },
      { param: 'force', values: ['POST_ONLY'] },
    ],
  },
  '/future/order/click-backhand': {
    nonEmptyStringParams: ['symbol', 'clientOid'],
    enumParams: [{ param: 'side', values: ['LONG', 'SHORT'] }],
  },
  '/future/order/batch-place-order': {
    nonEmptyStringParams: ['symbol', 'marginMode'],
    arrayParams: [
      {
        param: 'orderList',
        requiredParams: ['size', 'side', 'tradeSide', 'orderType'],
        positiveNumberParams: [
          'size',
          'price',
          'presetTakeProfitPrice',
          'presetStopLossPrice',
          'presetTakeProfitExecutePrice',
          'presetStopLossExecutePrice',
        ],
        enumParams: [
          { param: 'side', values: ['LONG', 'SHORT'] },
          { param: 'tradeSide', values: ['OPEN', 'CLOSE'] },
          { param: 'orderType', values: ['LIMIT', 'MARKET'] },
          { param: 'force', values: ['POST_ONLY'] },
        ],
      },
    ],
  },
  '/future/order/modify-order': {
    nonEmptyStringParams: ['symbol', 'newClientOid', 'orderId', 'clientOid'],
    positiveNumberParams: [
      'newSize',
      'newPrice',
      'newPresetTakeProfitPrice',
      'newPresetStopLossPrice',
    ],
    requireAnyParams: [['orderId', 'clientOid']],
  },
  '/future/order/cancel-order': {
    nonEmptyStringParams: ['symbol', 'orderId', 'clientOid'],
    requireAnyParams: [['orderId', 'clientOid']],
  },
  '/future/order/batch-cancel-orders': {
    arrayParams: [
      {
        param: 'orderIdList',
        requireAnyParams: [['orderId', 'clientOid']],
      },
    ],
  },
  '/future/order/close-positions': {
    nonEmptyStringParams: ['symbol'],
    enumParams: [{ param: 'holdSide', values: ['LONG', 'SHORT'] }],
  },
  '/future/order/cancel-all-orders': {},
  '/future/order/place-plan-order': {
    nonEmptyStringParams: ['symbol', 'marginMode', 'clientOid'],
    positiveNumberParams: [
      'size',
      'price',
      'triggerPrice',
      'presetTakeProfitPrice',
      'presetStopLossPrice',
      'presetTakeProfitExecutePrice',
      'presetStopLossExecutePrice',
    ],
    enumParams: [
      { param: 'side', values: ['LONG', 'SHORT'] },
      { param: 'triggerPriceType', values: ['LAST', 'MARK'] },
    ],
  },
  '/future/order/modify-plan-order': {
    nonEmptyStringParams: ['orderId', 'clientOid'],
    positiveNumberParams: [
      'newSize',
      'newPrice',
      'newTriggerPrice',
      'newPresetTakeProfitPrice',
      'newPresetTakeProfitExecutePrice',
      'newPresetStopLossPrice',
      'newPresetStopLossExecutePrice',
    ],
    enumParams: [
      { param: 'newTriggerPriceType', values: ['LAST', 'MARK'] },
      { param: 'newPresetTakeProfitPriceType', values: ['LIMIT', 'MARKET'] },
      { param: 'newPresetStopLossPriceType', values: ['LIMIT', 'MARKET'] },
    ],
    requireAnyParams: [['orderId', 'clientOid']],
  },
  '/future/order/cancel-plan-order': {
    nonEmptyStringParams: ['symbol'],
    arrayParams: [
      {
        param: 'orderIdList',
        requireAnyParams: [['orderId', 'clientOid']],
      },
    ],
  },
  '/future/order/place-tpsl-order': {
    nonEmptyStringParams: ['symbol', 'clientOid'],
    positiveNumberParams: ['size', 'triggerPrice', 'executePrice'],
    enumParams: [
      { param: 'planType', values: ['TAKE_PROFIT', 'STOP_LOSS'] },
      { param: 'holdSide', values: ['LONG', 'SHORT'] },
      { param: 'orderType', values: ['LIMIT', 'MARKET'] },
      { param: 'triggerPriceType', values: ['LAST', 'MARK'] },
    ],
  },
  '/future/order/modify-tpsl-order': {
    nonEmptyStringParams: ['symbol', 'orderId', 'clientOid'],
    positiveNumberParams: ['triggerPrice', 'size', 'executePrice'],
    enumParams: [
      { param: 'orderType', values: ['LIMIT', 'MARKET'] },
      { param: 'triggerPriceType', values: ['LAST', 'MARK'] },
    ],
    requireAnyParams: [['orderId', 'clientOid']],
  },
  '/future/order/cancel-tpsl-order': {
    nonEmptyStringParams: ['symbol'],
    arrayParams: [
      {
        param: 'orderIdList',
        requireAnyParams: [['orderId', 'clientOid']],
      },
    ],
  },
  '/copy/mix-trader/order-modify-tpsl': {
    nonEmptyStringParams: ['trackingNo', 'productType'],
    positiveNumberParams: [
      'stopSurplusPrice',
      'stopSurplusLimitPrice',
      'stopSurplusQuantity',
      'stopLossPrice',
      'stopLossLimitPrice',
      'stopLossQuantity',
    ],
    enumParams: [
      { param: 'stopSurplusTriggerPriceType', values: ['LAST', 'MARK'] },
      { param: 'stopSurplusOrderType', values: ['LIMIT', 'MARKET'] },
      { param: 'stopSurplusAmountType', values: ['FULL', 'PARTIAL'] },
      { param: 'stopLossTriggerPriceType', values: ['LAST', 'MARK'] },
      { param: 'stopLossOrderType', values: ['LIMIT', 'MARKET'] },
      { param: 'stopLossAmountType', values: ['FULL', 'PARTIAL'] },
    ],
  },
  '/copy/mix-trader/order-close-positions': {
    nonEmptyStringParams: ['trackingNo', 'symbol', 'productType'],
    positiveNumberParams: ['quantity', 'price'],
    enumParams: [{ param: 'orderType', values: ['LIMIT', 'MARKET'] }],
  },
  '/copy/mix-trader/config-trader-setting': {
    positiveNumberParams: ['profitShareRatio'],
  },
  '/copy/mix-trader/remove-follower': {
    nonEmptyStringParams: ['followerUid'],
  },
  '/copy/mix-follower/setting-tpsl': {
    nonEmptyStringParams: ['productType', 'trackingNo'],
    positiveNumberParams: [
      'stopSurplusPrice',
      'stopSurplusLimitPrice',
      'stopSurplusQuantity',
      'stopLossPrice',
      'stopLossLimitPrice',
      'stopLossQuantity',
    ],
    enumParams: [
      { param: 'stopSurplusTriggerPriceType', values: ['LAST', 'MARK'] },
      { param: 'stopSurplusOrderType', values: ['LIMIT', 'MARKET'] },
      { param: 'stopSurplusAmountType', values: ['FULL', 'PARTIAL'] },
      { param: 'stopLossTriggerPriceType', values: ['LAST', 'MARK'] },
      { param: 'stopLossOrderType', values: ['LIMIT', 'MARKET'] },
      { param: 'stopLossAmountType', values: ['FULL', 'PARTIAL'] },
    ],
  },
  '/copy/mix-follower/setting-copy-trade': {
    nonEmptyStringParams: ['productType', 'traderUid'],
    positiveNumberParams: [
      'fixedAmount',
      'dailyMarginLimitMax',
      'amountPerOrderUsdt',
    ],
    enumParams: [
      { param: 'orderType', values: ['FIXED_AMOUNT', 'POSITION_RATE'] },
    ],
  },
  '/copy/mix-follower/close-positions': {
    nonEmptyStringParams: ['productType', 'trackingNo', 'symbol'],
    positiveNumberParams: ['quantity', 'price'],
    enumParams: [{ param: 'orderType', values: ['LIMIT', 'MARKET'] }],
  },
  '/copy/mix-follower/cancel-follow': {
    nonEmptyStringParams: ['productType', 'traderUid'],
  },
};

export const WRITE_REST_COMMANDS: WriteRestCommand[] = withCommandMetadata([
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
  {
    command: ['future', 'tpsl', 'cancel'],
    method: 'POST',
    path: '/future/order/cancel-tpsl-order',
    description: 'Requires CONFIRM: cancel futures TP/SL orders',
    risk: 'Cancels futures take-profit or stop-loss orders.',
  },
  {
    command: ['copytrading', 'trader', 'modify-tpsl'],
    method: 'POST',
    path: '/copy/mix-trader/order-modify-tpsl',
    description: 'Requires CONFIRM: modify copy trading trader TP/SL',
    risk: 'Changes take-profit or stop-loss settings for tracked copy trading orders.',
  },
  {
    command: ['copytrading', 'trader', 'close-positions'],
    method: 'POST',
    path: '/copy/mix-trader/order-close-positions',
    description: 'Requires CONFIRM: close copy trading trader positions',
    risk: 'Closes copy trading trader positions.',
  },
  {
    command: ['copytrading', 'trader', 'config'],
    method: 'POST',
    path: '/copy/mix-trader/config-trader-setting',
    description: 'Requires CONFIRM: change copy trading trader settings',
    risk: 'Changes trader copy trading settings.',
  },
  {
    command: ['copytrading', 'trader', 'remove-follower'],
    method: 'POST',
    path: '/copy/mix-trader/remove-follower',
    description: 'Requires CONFIRM: remove a copy trading follower',
    risk: 'Removes a follower from copy trading.',
  },
  {
    command: ['copytrading', 'follower', 'setting-tpsl'],
    method: 'POST',
    path: '/copy/mix-follower/setting-tpsl',
    description: 'Requires CONFIRM: set follower TP/SL',
    risk: 'Changes follower take-profit or stop-loss settings.',
  },
  {
    command: ['copytrading', 'follower', 'setting-copy-trade'],
    method: 'POST',
    path: '/copy/mix-follower/setting-copy-trade',
    description: 'Requires CONFIRM: change follower copy trading settings',
    risk: 'Changes follower copy trading settings.',
  },
  {
    command: ['copytrading', 'follower', 'close-positions'],
    method: 'POST',
    path: '/copy/mix-follower/close-positions',
    description: 'Requires CONFIRM: close follower copy trading positions',
    risk: 'Closes follower copy trading positions.',
  },
  {
    command: ['copytrading', 'follower', 'cancel-follow'],
    method: 'POST',
    path: '/copy/mix-follower/cancel-follow',
    description: 'Requires CONFIRM: cancel following a trader',
    risk: 'Stops following a copy trading trader.',
  },
], (command) => WRITE_REST_METADATA_BY_PATH[command.path] ?? WRITE_BODY_METADATA);

export function findWriteRestCommand(
  parsed: ParsedArgs,
): WriteRestCommandMatch | undefined {
  const definition = WRITE_REST_COMMANDS.find((candidate) =>
    matches(parsed.command, candidate.command),
  );

  if (!definition) return undefined;

  const body = getBody(parsed.flags);
  assertRequiredParamsPresent(
    definition,
    getBodyParamValues(body),
    `bydoxe ${parsed.command.join(' ')}`,
  );
  assertWriteBodyMatchesRules(
    definition,
    getBodyParamValues(body),
    `bydoxe ${parsed.command.join(' ')}`,
  );

  return {
    definition,
    body,
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

function getBodyParamValues(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function assertWriteBodyMatchesRules(
  definition: WriteRestCommand,
  body: Record<string, unknown>,
  commandName: string,
): void {
  const rule = WRITE_REST_VALIDATION_BY_PATH[definition.path];
  if (!rule) return;

  const problems = [
    ...findMissingAlternativeParamProblems(rule, body),
    ...findMissingArrayAlternativeParamProblems(rule, body),
    ...findNonEmptyStringProblems(rule, body),
    ...findPositiveNumberProblems(rule, body),
    ...findEnumProblems(rule, body),
    ...findArrayItemProblems(rule, body),
  ];

  if (problems.length > 0) {
    throw new CliError(
      `Invalid parameter${problems.length === 1 ? '' : 's'} for ${commandName}: ${problems.join('; ')}.`,
    );
  }
}

function findMissingAlternativeParamProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  return (rule.requireAnyParams ?? [])
    .filter((paramGroup) => !paramGroup.some((param) => hasUsableValue(body[param])))
    .map((paramGroup) => `one of ${paramGroup.join(', ')} is required`);
}

function findNonEmptyStringProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  return (rule.nonEmptyStringParams ?? [])
    .filter((param) => hasUsableValue(body[param]) && !isNonEmptyString(body[param]))
    .map((param) => `${param} must be a non-empty string`);
}

function findMissingArrayAlternativeParamProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  const problems = [];

  for (const paramGroup of rule.requireAnyNonEmptyArrayParams ?? []) {
    if (!paramGroup.some((param) => hasNonEmptyUsableArray(body[param]))) {
      problems.push(`one of ${paramGroup.join('[], ')}[] must be a non-empty array`);
    }

    for (const param of paramGroup) {
      if (body[param] !== undefined && !isUsableArray(body[param])) {
        problems.push(`${param}[] must contain only usable string or number values`);
      }
    }
  }

  return problems;
}

function findPositiveNumberProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  return (rule.positiveNumberParams ?? [])
    .filter((param) => hasUsableValue(body[param]) && !isPositiveNumber(body[param]))
    .map((param) => `${param} must be a positive number`);
}

function findEnumProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  return (rule.enumParams ?? [])
    .filter(({ param, values }) =>
      hasUsableValue(body[param]) &&
      !values.includes(String(body[param]).toUpperCase()),
    )
    .map(({ param, values }) => `${param} must be one of ${values.join(', ')}`);
}

function findArrayItemProblems(
  rule: WriteValidationRule,
  body: Record<string, unknown>,
): string[] {
  const problems = [];

  for (const arrayRule of rule.arrayParams ?? []) {
    const value = body[arrayRule.param];
    if (!Array.isArray(value) || value.length === 0) {
      problems.push(`${arrayRule.param} must be a non-empty array`);
      continue;
    }

    value.forEach((item, index) => {
      const prefix = `${arrayRule.param}[${index}]`;

      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        problems.push(`${prefix} must be an object`);
        return;
      }

      const itemBody = item as Record<string, unknown>;
      problems.push(
        ...findMissingArrayItemRequiredParamProblems(arrayRule, itemBody, prefix),
        ...findMissingArrayItemAlternativeParamProblems(arrayRule, itemBody, prefix),
        ...findArrayItemPositiveNumberProblems(arrayRule, itemBody, prefix),
        ...findArrayItemEnumProblems(arrayRule, itemBody, prefix),
      );
    });
  }

  return problems;
}

function findMissingArrayItemRequiredParamProblems(
  rule: ArrayItemValidationRule,
  body: Record<string, unknown>,
  prefix: string,
): string[] {
  return (rule.requiredParams ?? [])
    .filter((param) => !hasUsableValue(body[param]))
    .map((param) => `${prefix}.${param} is required`);
}

function findMissingArrayItemAlternativeParamProblems(
  rule: ArrayItemValidationRule,
  body: Record<string, unknown>,
  prefix: string,
): string[] {
  return (rule.requireAnyParams ?? [])
    .filter((paramGroup) => !paramGroup.some((param) => hasUsableValue(body[param])))
    .map((paramGroup) =>
      `one of ${paramGroup.map((param) => `${prefix}.${param}`).join(', ')} is required`,
    );
}

function findArrayItemPositiveNumberProblems(
  rule: ArrayItemValidationRule,
  body: Record<string, unknown>,
  prefix: string,
): string[] {
  return (rule.positiveNumberParams ?? [])
    .filter((param) => hasUsableValue(body[param]) && !isPositiveNumber(body[param]))
    .map((param) => `${prefix}.${param} must be a positive number`);
}

function findArrayItemEnumProblems(
  rule: ArrayItemValidationRule,
  body: Record<string, unknown>,
  prefix: string,
): string[] {
  return (rule.enumParams ?? [])
    .filter(({ param, values }) =>
      hasUsableValue(body[param]) &&
      !values.includes(String(body[param]).toUpperCase()),
    )
    .map(({ param, values }) => `${prefix}.${param} must be one of ${values.join(', ')}`);
}

function hasUsableValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function isNonEmptyString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasNonEmptyUsableArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0 && value.every(isUsableIdentifier);
}

function isUsableArray(value: unknown): boolean {
  return Array.isArray(value) && value.every(isUsableIdentifier);
}

function isUsableIdentifier(value: unknown): boolean {
  return (typeof value === 'string' || typeof value === 'number') && hasUsableValue(value);
}

function isPositiveNumber(value: unknown): boolean {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) && numericValue > 0;
}

function matches(command: string[], expected: string[]): boolean {
  return (
    command.length === expected.length &&
    expected.every((part, index) => command[index] === part)
  );
}
