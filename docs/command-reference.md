# BYDOXE CLI Command Reference

This file is generated from `docs/command-catalog.json`. Run `npm run reference:generate` after changing command registries.

## Summary

- Package: `@bydoxe/bydoxe-cli`
- Version: `0.1.3`
- Schema version: `1`
- Command count: `107`

Validation rules are enforced before request construction. Positive and enum rules apply when those fields are present; "one of" rules require at least one listed identifier.

## Public REST Commands

| Command | Method | Endpoint | Auth | Risk | Parameters |
| --- | --- | --- | --- | --- | --- |
| `bydoxe public time` | `GET` | `/public/time` | public | low | none |
| `bydoxe spot market coins` | `GET` | `/spot/market/coins` | public | low | optional: `coin` |
| `bydoxe spot market symbols` | `GET` | `/spot/market/symbols` | public | low | optional: `symbol` |
| `bydoxe spot market tickers` | `GET` | `/spot/market/tickers` | public | low | optional: `symbol` |
| `bydoxe spot market orderbook` | `GET` | `/spot/market/orderbook` | public | low | required: `symbol`<br>optional: `limit` |
| `bydoxe spot market candles` | `GET` | `/spot/market/candles` | public | low | required: `symbol`, `granularity`<br>optional: `startTime`, `endTime`, `limit` |
| `bydoxe spot market history-candles` | `GET` | `/spot/market/history-candles` | public | low | required: `symbol`, `granularity`<br>optional: `startTime`, `endTime`, `limit` |
| `bydoxe spot market fills` | `GET` | `/spot/market/fills` | public | low | required: `symbol`<br>optional: `limit` |
| `bydoxe spot market fills-history` | `GET` | `/spot/market/fills-history` | public | low | required: `symbol`<br>optional: `limit`, `fromId`, `startTime`, `endTime` |
| `bydoxe future market ticker` | `GET` | `/future/market/24h-ticker` | public | low | optional: `symbol` |
| `bydoxe future market mark-price` | `GET` | `/future/market/mark-price` | public | low | optional: `symbol` |
| `bydoxe future market book-ticker` | `GET` | `/future/market/book-ticker` | public | low | optional: `symbol` |
| `bydoxe future market fills` | `GET` | `/future/market/fills` | public | low | required: `symbol`<br>optional: `limit` |
| `bydoxe future market fills-history` | `GET` | `/future/market/fills-history` | public | low | required: `symbol`<br>optional: `limit`, `idLessThan`, `startTime`, `endTime` |
| `bydoxe future market depth` | `GET` | `/future/market/depth` | public | low | required: `symbol`<br>optional: `limit` |
| `bydoxe future market candles` | `GET` | `/future/market/candles` | public | low | required: `symbol`, `interval`<br>optional: `limit`, `startTime`, `endTime` |
| `bydoxe future market history-fund-rate` | `GET` | `/future/market/history-fund-rate` | public | low | required: `symbol`<br>optional: `limit`, `startTime`, `endTime` |
| `bydoxe future market history-candles` | `GET` | `/future/market/history-candles` | public | low | required: `symbol`, `interval`<br>optional: `limit`, `startTime`, `endTime` |
| `bydoxe future market history-index-candles` | `GET` | `/future/market/history-index-candles` | public | low | required: `symbol`, `interval`<br>optional: `limit`, `startTime`, `endTime` |
| `bydoxe future market history-mark-candles` | `GET` | `/future/market/history-mark-candles` | public | low | required: `symbol`, `interval`<br>optional: `limit`, `startTime`, `endTime` |
| `bydoxe future market funding-info` | `GET` | `/future/market/funding-info` | public | low | none |
| `bydoxe future market open-interest` | `GET` | `/future/market/open-interest` | public | low | required: `symbol` |
| `bydoxe future market taker-buy-sell` | `GET` | `/future/market/taker-buy-sell` | public | low | required: `symbol`, `period` |
| `bydoxe future market account-long-short` | `GET` | `/future/market/account-long-short` | public | low | required: `symbol`, `period` |
| `bydoxe future market top-trader-position-long-short` | `GET` | `/future/market/top-trader-position-long-short` | public | low | required: `symbol`, `period` |
| `bydoxe future market top-trader-account-long-short` | `GET` | `/future/market/top-trader-account-long-short` | public | low | required: `symbol`, `period` |
| `bydoxe future market query-position-tier` | `GET` | `/future/market/query-position-tier` | public | low | required: `symbol` |

## Authenticated REST Commands

| Command | Method | Endpoint | Auth | Risk | Parameters |
| --- | --- | --- | --- | --- | --- |
| `bydoxe common trade-fee` | `GET` | `/common/trade-fee` | private | low | optional: `tradeType` |
| `bydoxe account funding-assets` | `GET` | `/account/funding-assets` | private | low | optional: `coin` |
| `bydoxe account all-balance` | `GET` | `/account/all-account-balance` | private | low | none |
| `bydoxe spot trade unfilled-orders` | `GET` | `/spot/trade/unfilled-orders` | private | low | optional: `symbol`, `orderId`, `clientOid`, `limit`, `startTime`, `endTime` |
| `bydoxe spot trade history-orders` | `GET` | `/spot/trade/history-orders` | private | low | optional: `symbol`, `orderId`, `clientOid`, `limit`, `startTime`, `endTime` |
| `bydoxe spot trade fills` | `GET` | `/spot/trade/fills` | private | low | optional: `symbol`, `orderId`, `limit`, `startTime`, `endTime` |
| `bydoxe spot trade order-info` | `POST` | `/spot/trade/order-info` | private | low | required: `orderId` |
| `bydoxe spot account assets` | `GET` | `/spot/account/assets` | private | low | optional: `coin`, `assetType` |
| `bydoxe spot account transfer-coin-info` | `GET` | `/spot/account/transfer-coin-info` | private | low | optional: `coin` |
| `bydoxe spot account withdrawal-records` | `GET` | `/spot/account/withdrawal-records` | private | low | optional: `coin`, `limit`, `startTime`, `endTime` |
| `bydoxe spot account deposit-records` | `GET` | `/spot/account/deposit-records` | private | low | optional: `coin`, `limit`, `startTime`, `endTime` |
| `bydoxe spot account transfer-records` | `GET` | `/spot/account/transfer-records` | private | low | optional: `coin`, `fromType`, `toType`, `limit`, `startTime`, `endTime` |
| `bydoxe spot account deposit-address` | `GET` | `/spot/account/deposit-address` | private | low | required: `coin`<br>optional: `chain` |
| `bydoxe future position single` | `GET` | `/future/position/single-position` | private | low | required: `symbol` |
| `bydoxe future position all` | `GET` | `/future/position/all-position` | private | low | optional: `symbol` |
| `bydoxe future position history` | `GET` | `/future/position/history-position` | private | low | optional: `symbol`, `limit`, `startTime`, `endTime` |
| `bydoxe future account info` | `GET` | `/future/account` | private | low | optional: `symbol` |
| `bydoxe future account max-open` | `GET` | `/future/account/max-open` | private | low | required: `symbol`<br>optional: `posSide`, `orderType`, `openPrice`, `leverage` |
| `bydoxe future account liq-price` | `GET` | `/future/account/liq-price` | private | low | required: `symbol`<br>optional: `posSide`, `orderType`, `openAmount`, `openPrice` |
| `bydoxe future account open-count` | `GET` | `/future/account/open-count` | private | low | required: `symbol`<br>optional: `posSide`, `orderType`, `openPrice`, `openAmount` |
| `bydoxe future order detail` | `GET` | `/future/order/detail` | private | low | optional: `symbol`, `orderId`, `clientOid` |
| `bydoxe future order fills` | `GET` | `/future/order/fills` | private | low | optional: `symbol`, `orderId`, `limit`, `startTime`, `endTime` |
| `bydoxe future order fill-history` | `GET` | `/future/order/fill-history` | private | low | optional: `symbol`, `orderId`, `limit`, `startTime`, `endTime` |
| `bydoxe future order orders-pending` | `GET` | `/future/order/orders-pending` | private | low | optional: `symbol`, `limit`, `startTime`, `endTime` |
| `bydoxe future order orders-history` | `GET` | `/future/order/orders-history` | private | low | optional: `symbol`, `limit`, `startTime`, `endTime` |
| `bydoxe future trigger orders-pending` | `GET` | `/future/order/orders-plan-pending` | private | low | required: `limit`<br>optional: `symbol`, `idLessThan`, `startTime`, `endTime`, `orderId` |
| `bydoxe future trigger orders-history` | `GET` | `/future/order/orders-plan-history` | private | low | required: `limit`<br>optional: `symbol`, `idLessThan`, `startTime`, `endTime`, `orderId`, `clientOid` |
| `bydoxe copytrading trader current-orders` | `GET` | `/copy/mix-trader/order-current-track` | private | low | optional: `symbol`, `trackingNo`, `pageNo`, `pageSize` |
| `bydoxe copytrading trader history-orders` | `GET` | `/copy/mix-trader/order-history-track` | private | low | optional: `symbol`, `trackingNo`, `pageNo`, `pageSize` |
| `bydoxe copytrading trader total-detail` | `GET` | `/copy/mix-trader/order-total-detail` | private | low | optional: `symbol`, `trackingNo` |
| `bydoxe copytrading trader profit-summary` | `GET` | `/copy/mix-trader/profit-history-summarys` | private | low | optional: `symbol`, `pageNo`, `pageSize`, `startTime`, `endTime` |
| `bydoxe copytrading trader profit-history` | `GET` | `/copy/mix-trader/profit-history-details` | private | low | optional: `symbol`, `trackingNo`, `pageNo`, `pageSize` |
| `bydoxe copytrading trader profit-details` | `GET` | `/copy/mix-trader/profit-details` | private | low | optional: `symbol`, `trackingNo` |
| `bydoxe copytrading trader followers` | `GET` | `/copy/mix-trader/query-followers` | private | low | optional: `pageNo`, `pageSize` |
| `bydoxe copytrading follower current-orders` | `GET` | `/copy/mix-follower/query-current-orders` | private | low | required: `productType`<br>optional: `symbol`, `traderUid`, `startTime`, `endTime`, `limit`, `idLessThan`, `idGreaterThan` |
| `bydoxe copytrading follower history-orders` | `GET` | `/copy/mix-follower/query-history-orders` | private | low | required: `productType`<br>optional: `symbol`, `traderUid`, `startTime`, `endTime`, `limit`, `idLessThan`, `idGreaterThan` |
| `bydoxe copytrading follower settings` | `GET` | `/copy/mix-follower/query-copy-trade-settings` | private | low | required: `productType`<br>optional: `traderUid` |
| `bydoxe copytrading follower traders` | `GET` | `/copy/mix-follower/query-my-traders` | private | low | required: `productType` |

## Write REST Commands

| Command | Method | Endpoint | Auth | Risk | Parameters | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| `bydoxe spot trade place-order` | `POST` | `/spot/trade/place-order` | private | high | required: `base`, `quote`, `orderType`, `tradeType`, `amount`<br>optional: `price`, `stopPrice`, `clientOid` | non-empty string: `base`, `quote`, `clientOid`<br>positive: `amount`, `price`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`tradeType` in `BUY`, `SELL` |
| `bydoxe spot trade cancel-order` | `POST` | `/spot/trade/cancel-order` | private | high | required: `symbol`, `orderId` | non-empty string: `symbol`, `orderId` |
| `bydoxe spot trade cancel-replace-order` | `POST` | `/spot/trade/cancel-replace-order` | private | high | required: `symbol`, `price`, `size`, `orderId` | non-empty string: `symbol`, `orderId`<br>positive: `price`, `size` |
| `bydoxe spot trade batch-cancel-replace-order` | `POST` | `/spot/trade/batch-cancel-replace-order` | private | high | required: `orderList` | `orderList[]` required<br>each `orderList[]` requires `symbol`, `price`, `size`, `orderId`<br>`orderList[]` positive: `price`, `size` |
| `bydoxe spot trade batch-orders` | `POST` | `/spot/trade/batch-orders` | private | high | required: `orderList`<br>optional: `symbol`, `batchMode` | `orderList[]` required<br>each `orderList[]` requires `side`, `orderType`, `size`<br>`orderList[]` positive: `size`, `price`<br>`orderList[]` `side` in `BUY`, `SELL`<br>`orderList[]` `orderType` in `MARKET`, `LIMIT` |
| `bydoxe spot trade batch-cancel-orders` | `POST` | `/spot/trade/batch-cancel-orders` | private | high | required: `orderList`<br>optional: `symbol`, `batchMode` | `orderList[]` required<br>each `orderList[]` requires `orderId` |
| `bydoxe spot trade cancel-symbol-order` | `POST` | `/spot/trade/cancel-symbol-order` | private | high | required: `symbol` | non-empty string: `symbol` |
| `bydoxe spot account transfer` | `POST` | `/spot/account/transfer` | private | high | required: `from`, `to`, `symbol`, `quantity` | non-empty string: `from`, `to`, `symbol`<br>positive: `quantity`<br>`from` in `FUSD`, `SPOT`, `LENDING`, `STAKING`<br>`to` in `FUSD`, `SPOT`, `LENDING`, `STAKING` |
| `bydoxe spot account withdraw` | `POST` | `/spot/account/withdraw` | private | high | required: `address`, `coinSymbol`, `network`, `quantity`, `pinCode`<br>optional: `destinationTag`, `otpCode` | non-empty string: `address`, `coinSymbol`, `network`, `pinCode`, `destinationTag`, `otpCode`<br>positive: `quantity` |
| `bydoxe spot account cancel-withdraw` | `POST` | `/spot/account/cancel-withdraw` | private | high | required: `orderId` | non-empty string: `orderId` |
| `bydoxe future account set-leverage` | `POST` | `/future/account/set-leverage` | private | high | required: `symbol`<br>optional: `longLeverage`, `shortLeverage`, `leverage`, `marginCoin` | non-empty string: `symbol`, `marginCoin`<br>positive: `longLeverage`, `shortLeverage`, `leverage` |
| `bydoxe future account set-margin` | `POST` | `/future/account/set-margin` | private | high | required: `symbol`, `holdSide`, `amount` | non-empty string: `symbol`<br>positive: `amount`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future account set-margin-mode` | `POST` | `/future/account/set-margin-mode` | private | high | required: `symbol`, `marginMode` | non-empty string: `symbol`<br>`marginMode` in `CROSS`, `ISOLATED` |
| `bydoxe future order place` | `POST` | `/future/order/place-order` | private | high | required: `symbol`, `marginMode`, `size`, `side`, `tradeSide`, `orderType`<br>optional: `price`, `force`, `clientOid`, `presetTakeProfitPrice`, `presetStopLossPrice`, `presetTakeProfitExecutePrice`, `presetStopLossExecutePrice` | non-empty string: `symbol`, `marginMode`, `clientOid`<br>positive: `size`, `price`, `presetTakeProfitPrice`, `presetStopLossPrice`, `presetTakeProfitExecutePrice`, `presetStopLossExecutePrice`<br>`side` in `LONG`, `SHORT`<br>`tradeSide` in `OPEN`, `CLOSE`<br>`orderType` in `LIMIT`, `MARKET`<br>`force` in `POST_ONLY` |
| `bydoxe future order click-backhand` | `POST` | `/future/order/click-backhand` | private | high | required: `symbol`, `side`<br>optional: `clientOid` | non-empty string: `symbol`, `clientOid`<br>`side` in `LONG`, `SHORT` |
| `bydoxe future order batch-place` | `POST` | `/future/order/batch-place-order` | private | high | required: `symbol`, `marginMode`, `orderList` | non-empty string: `symbol`, `marginMode`<br>`orderList[]` required<br>each `orderList[]` requires `size`, `side`, `tradeSide`, `orderType`<br>`orderList[]` positive: `size`, `price`, `presetTakeProfitPrice`, `presetStopLossPrice`, `presetTakeProfitExecutePrice`, `presetStopLossExecutePrice`<br>`orderList[]` `side` in `LONG`, `SHORT`<br>`orderList[]` `tradeSide` in `OPEN`, `CLOSE`<br>`orderList[]` `orderType` in `LIMIT`, `MARKET`<br>`orderList[]` `force` in `POST_ONLY` |
| `bydoxe future order modify` | `POST` | `/future/order/modify-order` | private | high | required: `symbol`, `newClientOid`<br>optional: `orderId`, `clientOid`, `newSize`, `newPrice`, `newPresetTakeProfitPrice`, `newPresetStopLossPrice` | non-empty string: `symbol`, `newClientOid`, `orderId`, `clientOid`<br>positive: `newSize`, `newPrice`, `newPresetTakeProfitPrice`, `newPresetStopLossPrice`<br>one of `orderId`, `clientOid` |
| `bydoxe future order cancel` | `POST` | `/future/order/cancel-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid` | non-empty string: `symbol`, `orderId`, `clientOid`<br>one of `orderId`, `clientOid` |
| `bydoxe future order batch-cancel` | `POST` | `/future/order/batch-cancel-orders` | private | high | required: `orderIdList` | `orderIdList[]` required<br>each `orderIdList[]` one of `orderId`, `clientOid` |
| `bydoxe future order close-positions` | `POST` | `/future/order/close-positions` | private | high | optional: `symbol`, `holdSide` | non-empty string: `symbol`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future order cancel-all` | `POST` | `/future/order/cancel-all-orders` | private | high | none | none |
| `bydoxe future trigger place` | `POST` | `/future/order/place-plan-order` | private | high | required: `symbol`, `marginMode`, `size`, `side`, `triggerPrice`, `triggerPriceType`<br>optional: `price`, `clientOid`, `presetTakeProfitPrice`, `presetStopLossPrice`, `presetTakeProfitExecutePrice`, `presetStopLossExecutePrice` | non-empty string: `symbol`, `marginMode`, `clientOid`<br>positive: `size`, `price`, `triggerPrice`, `presetTakeProfitPrice`, `presetStopLossPrice`, `presetTakeProfitExecutePrice`, `presetStopLossExecutePrice`<br>`side` in `LONG`, `SHORT`<br>`triggerPriceType` in `LAST`, `MARK` |
| `bydoxe future trigger modify` | `POST` | `/future/order/modify-plan-order` | private | high | optional: `orderId`, `clientOid`, `newPrice`, `newSize`, `newTriggerPrice`, `newTriggerPriceType`, `newPresetTakeProfitPrice`, `newPresetTakeProfitExecutePrice`, `newPresetTakeProfitPriceType`, `newPresetStopLossPrice`, `newPresetStopLossExecutePrice`, `newPresetStopLossPriceType` | non-empty string: `orderId`, `clientOid`<br>positive: `newSize`, `newPrice`, `newTriggerPrice`, `newPresetTakeProfitPrice`, `newPresetTakeProfitExecutePrice`, `newPresetStopLossPrice`, `newPresetStopLossExecutePrice`<br>`newTriggerPriceType` in `LAST`, `MARK`<br>`newPresetTakeProfitPriceType` in `LIMIT`, `MARKET`<br>`newPresetStopLossPriceType` in `LIMIT`, `MARKET`<br>one of `orderId`, `clientOid` |
| `bydoxe future trigger cancel` | `POST` | `/future/order/cancel-plan-order` | private | high | required: `orderIdList`<br>optional: `symbol` | non-empty string: `symbol`<br>`orderIdList[]` required<br>each `orderIdList[]` one of `orderId`, `clientOid` |
| `bydoxe future tpsl place` | `POST` | `/future/order/place-tpsl-order` | private | high | required: `symbol`, `planType`, `holdSide`, `orderType`, `triggerPrice`, `triggerPriceType`, `size`<br>optional: `executePrice`, `clientOid` | non-empty string: `symbol`, `clientOid`<br>positive: `size`, `triggerPrice`, `executePrice`<br>`planType` in `TAKE_PROFIT`, `STOP_LOSS`<br>`holdSide` in `LONG`, `SHORT`<br>`orderType` in `LIMIT`, `MARKET`<br>`triggerPriceType` in `LAST`, `MARK` |
| `bydoxe future tpsl modify` | `POST` | `/future/order/modify-tpsl-order` | private | high | required: `symbol`, `orderType`, `triggerPrice`, `size`<br>optional: `orderId`, `clientOid`, `triggerPriceType`, `executePrice` | non-empty string: `symbol`, `orderId`, `clientOid`<br>positive: `triggerPrice`, `size`, `executePrice`<br>`orderType` in `LIMIT`, `MARKET`<br>`triggerPriceType` in `LAST`, `MARK`<br>one of `orderId`, `clientOid` |
| `bydoxe future tpsl cancel` | `POST` | `/future/order/cancel-tpsl-order` | private | high | required: `orderIdList`<br>optional: `symbol` | non-empty string: `symbol`<br>`orderIdList[]` required<br>each `orderIdList[]` one of `orderId`, `clientOid` |
| `bydoxe copytrading trader modify-tpsl` | `POST` | `/copy/mix-trader/order-modify-tpsl` | private | high | required: `trackingNo`, `productType`<br>optional: `stopSurplusPrice`, `stopSurplusTriggerPriceType`, `stopSurplusOrderType`, `stopSurplusLimitPrice`, `stopSurplusAmountType`, `stopSurplusQuantity`, `stopLossPrice`, `stopLossTriggerPriceType`, `stopLossOrderType`, `stopLossLimitPrice`, `stopLossAmountType`, `stopLossQuantity` | non-empty string: `trackingNo`, `productType`<br>positive: `stopSurplusPrice`, `stopSurplusLimitPrice`, `stopSurplusQuantity`, `stopLossPrice`, `stopLossLimitPrice`, `stopLossQuantity`<br>`stopSurplusTriggerPriceType` in `LAST`, `MARK`<br>`stopSurplusOrderType` in `LIMIT`, `MARKET`<br>`stopSurplusAmountType` in `FULL`, `PARTIAL`<br>`stopLossTriggerPriceType` in `LAST`, `MARK`<br>`stopLossOrderType` in `LIMIT`, `MARKET`<br>`stopLossAmountType` in `FULL`, `PARTIAL` |
| `bydoxe copytrading trader close-positions` | `POST` | `/copy/mix-trader/order-close-positions` | private | high | required: `trackingNo`, `symbol`, `productType`<br>optional: `orderType`, `quantity`, `price` | non-empty string: `trackingNo`, `symbol`, `productType`<br>positive: `quantity`, `price`<br>`orderType` in `LIMIT`, `MARKET` |
| `bydoxe copytrading trader config` | `POST` | `/copy/mix-trader/config-trader-setting` | private | high | optional: `traderMode`, `copyPairList`, `nickName`, `introduction`, `profitShareRatio`, `showFund`, `showFollowerList`, `showLeadingHist` | positive: `profitShareRatio` |
| `bydoxe copytrading trader remove-follower` | `POST` | `/copy/mix-trader/remove-follower` | private | high | required: `followerUid` | non-empty string: `followerUid` |
| `bydoxe copytrading follower setting-tpsl` | `POST` | `/copy/mix-follower/setting-tpsl` | private | high | required: `productType`, `trackingNo`<br>optional: `stopSurplusPrice`, `stopSurplusTriggerPriceType`, `stopSurplusOrderType`, `stopSurplusLimitPrice`, `stopSurplusAmountType`, `stopSurplusQuantity`, `stopLossPrice`, `stopLossTriggerPriceType`, `stopLossOrderType`, `stopLossLimitPrice`, `stopLossAmountType`, `stopLossQuantity` | non-empty string: `productType`, `trackingNo`<br>positive: `stopSurplusPrice`, `stopSurplusLimitPrice`, `stopSurplusQuantity`, `stopLossPrice`, `stopLossLimitPrice`, `stopLossQuantity`<br>`stopSurplusTriggerPriceType` in `LAST`, `MARK`<br>`stopSurplusOrderType` in `LIMIT`, `MARKET`<br>`stopSurplusAmountType` in `FULL`, `PARTIAL`<br>`stopLossTriggerPriceType` in `LAST`, `MARK`<br>`stopLossOrderType` in `LIMIT`, `MARKET`<br>`stopLossAmountType` in `FULL`, `PARTIAL` |
| `bydoxe copytrading follower setting-copy-trade` | `POST` | `/copy/mix-follower/setting-copy-trade` | private | high | required: `productType`, `traderUid`<br>optional: `fixedAmount`, `dailyMarginLimitMax`, `orderType`, `amountPerOrderUsdt` | non-empty string: `productType`, `traderUid`<br>positive: `fixedAmount`, `dailyMarginLimitMax`, `amountPerOrderUsdt`<br>`orderType` in `FIXED_AMOUNT`, `POSITION_RATE` |
| `bydoxe copytrading follower close-positions` | `POST` | `/copy/mix-follower/close-positions` | private | high | required: `productType`, `trackingNo`, `symbol`<br>optional: `orderType`, `quantity`, `price` | non-empty string: `productType`, `trackingNo`, `symbol`<br>positive: `quantity`, `price`<br>`orderType` in `LIMIT`, `MARKET` |
| `bydoxe copytrading follower cancel-follow` | `POST` | `/copy/mix-follower/cancel-follow` | private | high | required: `productType`, `traderUid` | non-empty string: `productType`, `traderUid` |

## WebSocket Commands

| Command | Scope | Auth | Risk | Confirm | Parameters |
| --- | --- | --- | --- | --- | --- |
| `bydoxe websocket public ping` | public | public | low | No | none |
| `bydoxe websocket public subscribe` | public | public | low | No | none |
| `bydoxe websocket public unsubscribe` | public | public | low | No | none |
| `bydoxe websocket private login` | private | private | medium | No | none |
| `bydoxe websocket private subscribe` | private | private | medium | No | none |
| `bydoxe websocket private unsubscribe` | private | private | medium | No | none |
| `bydoxe websocket private spot trade` | private | private | high | `CONFIRM` | none |
