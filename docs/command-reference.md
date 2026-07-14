# BYDOXE CLI Command Reference

This file is generated from `docs/command-catalog.json`. Run `npm run reference:generate` after changing command registries.

## Summary

- Package: `@bydoxe/bydoxe-cli`
- Version: `0.1.1`
- Schema version: `1`
- Command count: `106`

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
| `bydoxe copytrading follower current-orders` | `GET` | `/copy/mix-follower/query-current-orders` | private | low | optional: `symbol`, `traderId`, `trackingNo`, `pageNo`, `pageSize` |
| `bydoxe copytrading follower history-orders` | `GET` | `/copy/mix-follower/query-history-orders` | private | low | optional: `symbol`, `traderId`, `trackingNo`, `pageNo`, `pageSize` |
| `bydoxe copytrading follower settings` | `GET` | `/copy/mix-follower/query-copy-trade-settings` | private | low | required: `traderId`<br>optional: `symbol` |
| `bydoxe copytrading follower traders` | `GET` | `/copy/mix-follower/query-my-traders` | private | low | optional: `pageNo`, `pageSize` |

## Write REST Commands

| Command | Method | Endpoint | Auth | Risk | Parameters | Validation |
| --- | --- | --- | --- | --- | --- | --- |
| `bydoxe spot trade place-order` | `POST` | `/spot/trade/place-order` | private | high | required: `symbol`, `orderType`, `tradeType`, `amount`<br>optional: `price`, `clientOid` | positive: `amount`, `price`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`tradeType` in `BUY`, `SELL` |
| `bydoxe spot trade cancel-order` | `POST` | `/spot/trade/cancel-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid` | one of `orderId`, `clientOid` |
| `bydoxe spot trade cancel-replace-order` | `POST` | `/spot/trade/cancel-replace-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid`, `orderType`, `tradeType`, `price`, `amount` | positive: `amount`, `price`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`tradeType` in `BUY`, `SELL`<br>one of `orderId`, `clientOid` |
| `bydoxe spot trade batch-cancel-replace-order` | `POST` | `/spot/trade/batch-cancel-replace-order` | private | high | optional: `symbol`, `orders` | `orders[]` required<br>each `orders[]` requires `symbol`<br>`orders[]` positive: `amount`, `price`<br>`orders[]` `orderType` in `MARKET`, `LIMIT`<br>`orders[]` `timeInForce` in `GTC`, `IOC`, `FOK`<br>`orders[]` `tradeType` in `BUY`, `SELL`<br>each `orders[]` one of `orderId`, `clientOid` |
| `bydoxe spot trade batch-orders` | `POST` | `/spot/trade/batch-orders` | private | high | optional: `orders` | `orders[]` required<br>each `orders[]` requires `symbol`, `orderType`, `tradeType`, `amount`<br>`orders[]` positive: `amount`, `price`<br>`orders[]` `orderType` in `MARKET`, `LIMIT`<br>`orders[]` `timeInForce` in `GTC`, `IOC`, `FOK`<br>`orders[]` `tradeType` in `BUY`, `SELL` |
| `bydoxe spot trade batch-cancel-orders` | `POST` | `/spot/trade/batch-cancel-orders` | private | high | optional: `symbol`, `orderIds`, `clientOids` | one of `orderIds[]`, `clientOids[]` |
| `bydoxe spot trade cancel-symbol-order` | `POST` | `/spot/trade/cancel-symbol-order` | private | high | required: `symbol` | non-empty string: `symbol` |
| `bydoxe spot account transfer` | `POST` | `/spot/account/transfer` | private | high | required: `coin`, `amount`, `fromType`, `toType` | non-empty string: `coin`, `fromType`, `toType`<br>positive: `amount` |
| `bydoxe spot account withdraw` | `POST` | `/spot/account/withdraw` | private | high | required: `coin`, `chain`, `address`, `amount`<br>optional: `tag`, `clientOid` | non-empty string: `coin`, `chain`, `address`, `tag`, `clientOid`<br>positive: `amount` |
| `bydoxe spot account cancel-withdraw` | `POST` | `/spot/account/cancel-withdraw` | private | high | optional: `withdrawId`, `orderId`, `clientOid` | non-empty string: `withdrawId`, `orderId`, `clientOid`<br>one of `withdrawId`, `orderId`, `clientOid` |
| `bydoxe future account set-leverage` | `POST` | `/future/account/set-leverage` | private | high | required: `symbol`<br>optional: `longLeverage`, `shortLeverage`, `leverage`, `marginCoin` | non-empty string: `symbol`, `marginCoin`<br>positive: `longLeverage`, `shortLeverage`, `leverage` |
| `bydoxe future account set-margin` | `POST` | `/future/account/set-margin` | private | high | required: `symbol`, `holdSide`, `amount` | non-empty string: `symbol`<br>positive: `amount`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future account set-margin-mode` | `POST` | `/future/account/set-margin-mode` | private | high | required: `symbol`, `marginMode` | non-empty string: `symbol`<br>`marginMode` in `CROSS`, `ISOLATED` |
| `bydoxe future order place` | `POST` | `/future/order/place-order` | private | high | required: `symbol`, `side`, `orderType`, `size`<br>optional: `price`, `holdSide`, `clientOid`, `timeInForce` | non-empty string: `symbol`, `clientOid`<br>positive: `size`, `price`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`side` in `BUY`, `SELL`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future order click-backhand` | `POST` | `/future/order/click-backhand` | private | high | required: `symbol`<br>optional: `side`, `size`, `holdSide` | non-empty string: `symbol`<br>positive: `size`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`side` in `BUY`, `SELL`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future order batch-place` | `POST` | `/future/order/batch-place-order` | private | high | optional: `orders` | `orders[]` required<br>each `orders[]` requires `symbol`, `side`, `orderType`, `size`<br>`orders[]` positive: `size`, `price`<br>`orders[]` `orderType` in `MARKET`, `LIMIT`<br>`orders[]` `timeInForce` in `GTC`, `IOC`, `FOK`<br>`orders[]` `side` in `BUY`, `SELL`<br>`orders[]` `holdSide` in `LONG`, `SHORT` |
| `bydoxe future order modify` | `POST` | `/future/order/modify-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid`, `price`, `size` | non-empty string: `symbol`, `orderId`, `clientOid`<br>positive: `size`, `price`<br>one of `orderId`, `clientOid` |
| `bydoxe future order cancel` | `POST` | `/future/order/cancel-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid` | non-empty string: `symbol`, `orderId`, `clientOid`<br>one of `orderId`, `clientOid` |
| `bydoxe future order batch-cancel` | `POST` | `/future/order/batch-cancel-orders` | private | high | optional: `symbol`, `orderIds`, `clientOids` | one of `orderIds[]`, `clientOids[]` |
| `bydoxe future order close-positions` | `POST` | `/future/order/close-positions` | private | high | required: `symbol`<br>optional: `holdSide` | non-empty string: `symbol`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future order cancel-all` | `POST` | `/future/order/cancel-all-orders` | private | high | optional: `symbol` | non-empty string: `symbol` |
| `bydoxe future trigger place` | `POST` | `/future/order/place-plan-order` | private | high | required: `symbol`, `side`, `triggerPrice`, `orderType`, `size`<br>optional: `price`, `holdSide`, `clientOid` | non-empty string: `symbol`, `clientOid`<br>positive: `size`, `price`, `triggerPrice`<br>`orderType` in `MARKET`, `LIMIT`<br>`timeInForce` in `GTC`, `IOC`, `FOK`<br>`side` in `BUY`, `SELL`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future trigger modify` | `POST` | `/future/order/modify-plan-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid`, `triggerPrice`, `price`, `size` | non-empty string: `symbol`, `orderId`, `clientOid`<br>positive: `size`, `price`, `triggerPrice`<br>one of `orderId`, `clientOid` |
| `bydoxe future trigger cancel` | `POST` | `/future/order/cancel-plan-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid` | non-empty string: `symbol`, `orderId`, `clientOid`<br>one of `orderId`, `clientOid` |
| `bydoxe future tpsl place` | `POST` | `/future/order/place-tpsl-order` | private | high | required: `symbol`, `planType`, `triggerPrice`<br>optional: `holdSide`, `size`, `clientOid` | non-empty string: `symbol`, `clientOid`<br>positive: `size`, `triggerPrice`<br>`planType` in `TAKE_PROFIT`, `STOP_LOSS`<br>`holdSide` in `LONG`, `SHORT` |
| `bydoxe future tpsl modify` | `POST` | `/future/order/modify-tpsl-order` | private | high | required: `symbol`<br>optional: `orderId`, `clientOid`, `triggerPrice` | non-empty string: `symbol`, `orderId`, `clientOid`<br>positive: `triggerPrice`<br>one of `orderId`, `clientOid` |
| `bydoxe copytrading trader modify-tpsl` | `POST` | `/copy/mix-trader/order-modify-tpsl` | private | high | required: `symbol`, `trackingNo`<br>optional: `stopSurplusPrice`, `stopLossPrice` | non-empty string: `symbol`, `trackingNo`<br>positive: `stopSurplusPrice`, `stopLossPrice` |
| `bydoxe copytrading trader close-positions` | `POST` | `/copy/mix-trader/order-close-positions` | private | high | required: `symbol`, `trackingNo` | non-empty string: `symbol`, `trackingNo` |
| `bydoxe copytrading trader config` | `POST` | `/copy/mix-trader/config-trader-setting` | private | high | required: `symbol`<br>optional: `copyTradeMode` | non-empty string: `symbol`, `copyTradeMode` |
| `bydoxe copytrading trader remove-follower` | `POST` | `/copy/mix-trader/remove-follower` | private | high | required: `followerId`<br>optional: `symbol` | non-empty string: `followerId`, `symbol` |
| `bydoxe copytrading follower setting-tpsl` | `POST` | `/copy/mix-follower/setting-tpsl` | private | high | required: `symbol`, `trackingNo`<br>optional: `stopSurplusPrice`, `stopLossPrice` | non-empty string: `symbol`, `trackingNo`<br>positive: `stopSurplusPrice`, `stopLossPrice` |
| `bydoxe copytrading follower setting-copy-trade` | `POST` | `/copy/mix-follower/setting-copy-trade` | private | high | required: `traderId`, `symbol`<br>optional: `copyAmount`, `copyMode` | non-empty string: `traderId`, `symbol`, `copyMode`<br>positive: `copyAmount` |
| `bydoxe copytrading follower close-positions` | `POST` | `/copy/mix-follower/close-positions` | private | high | required: `symbol`, `trackingNo` | non-empty string: `symbol`, `trackingNo` |
| `bydoxe copytrading follower cancel-follow` | `POST` | `/copy/mix-follower/cancel-follow` | private | high | required: `traderId` | non-empty string: `traderId` |

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
