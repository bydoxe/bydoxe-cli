# BYDOXE CLI

BYDOXE CLI is a command-line tool for interacting with the BYDOXE Open API.

It provides a safe execution layer for market data, account queries, spot trading, futures trading, positions, TP/SL, copy trading, and WebSocket workflows. The CLI handles API credentials, HMAC request signing, REST request construction, structured output, and dry-run previews.

## Status

This repository is in the CLI MVP phase.

Implemented:

- TypeScript project structure
- CLI entry point
- Configuration loading from environment variables
- HMAC signature helper
- REST request builder
- Public REST command routing
- Authenticated REST read command routing
- Authenticated REST write command routing
- Dry-run request preview support
- Public REST execution through Node.js fetch
- Private REST request signing with redacted dry-run previews
- `--confirm CONFIRM` gate for write command execution
- Unit tests using Node.js built-in test runner

## Default Domains

| Type | URL |
| --- | --- |
| REST | `https://open-api.bydoxe.com/api/v1` |
| Public WebSocket | `wss://open-api.bydoxe.com/v1/ws/public` |
| Private WebSocket | `wss://open-api.bydoxe.com/v1/ws/private` |

## Install

Package installation is not published yet. During development, run the CLI from source after installing dependencies.

```sh
npm install
npm run build
node dist/cli.js --help
```

## Development

```sh
npm run typecheck
npm test
npm run build
```

## Credentials

Private BYDOXE API requests require credentials. The initial scaffold reads credentials from environment variables:

```sh
export BYDOXE_ACCESS_KEY="<your-access-key>"
export BYDOXE_SECRET_KEY="<your-secret-key>"
export BYDOXE_PASSPHRASE="<your-passphrase>"
```

Do not paste API secrets into AI chat sessions. Configure them locally in your shell or a secure environment manager.

## Example

```sh
bydoxe public time --dry-run
bydoxe spot market tickers --symbol BTCUSDT --dry-run --format json
bydoxe spot market orderbook --symbol BTCUSDT --limit 20 --dry-run
bydoxe spot market candles --symbol BTCUSDT --granularity 1m --limit 100 --dry-run
bydoxe future market ticker --symbol BTCUSDT --dry-run
bydoxe future market mark-price --symbol BTCUSDT --dry-run
bydoxe account funding-assets --coin USDT --dry-run --format json
bydoxe future position all --dry-run --format json
bydoxe copytrading trader followers --pageNo 1 --pageSize 20 --dry-run --format json
bydoxe copytrading follower settings --traderId trader-1 --dry-run --format json
bydoxe spot trade place-order --body '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}' --dry-run --format json
bydoxe copytrading follower cancel-follow --body '{"traderId":"trader-1"}' --dry-run --format json
```

The dry-run mode prints the request that would be sent without making a network call.

## Public REST Commands

| Command | Endpoint |
| --- | --- |
| `bydoxe public time` | `GET /public/time` |
| `bydoxe spot market symbols` | `GET /spot/market/symbols` |
| `bydoxe spot market tickers` | `GET /spot/market/tickers` |
| `bydoxe spot market orderbook` | `GET /spot/market/orderbook` |
| `bydoxe spot market candles` | `GET /spot/market/candles` |
| `bydoxe future market ticker` | `GET /future/market/24h-ticker` |
| `bydoxe future market mark-price` | `GET /future/market/mark-price` |

Command flags that are not global options are forwarded as query parameters. For example, `--symbol BTCUSDT --limit 100` becomes `?symbol=BTCUSDT&limit=100`.

## Authenticated Read Commands

Authenticated read commands require local credentials and never require chat-based API secrets.

| Command | Endpoint |
| --- | --- |
| `bydoxe common trade-fee` | `GET /common/trade-fee` |
| `bydoxe account funding-assets` | `GET /account/funding-assets` |
| `bydoxe account all-balance` | `GET /account/all-account-balance` |
| `bydoxe spot trade unfilled-orders` | `GET /spot/trade/unfilled-orders` |
| `bydoxe spot trade history-orders` | `GET /spot/trade/history-orders` |
| `bydoxe spot trade fills` | `GET /spot/trade/fills` |
| `bydoxe spot account assets` | `GET /spot/account/assets` |
| `bydoxe spot account transfer-coin-info` | `GET /spot/account/transfer-coin-info` |
| `bydoxe spot account withdrawal-records` | `GET /spot/account/withdrawal-records` |
| `bydoxe spot account deposit-records` | `GET /spot/account/deposit-records` |
| `bydoxe spot account transfer-records` | `GET /spot/account/transfer-records` |
| `bydoxe spot account deposit-address` | `GET /spot/account/deposit-address` |
| `bydoxe future position single` | `GET /future/position/single-position` |
| `bydoxe future position all` | `GET /future/position/all-position` |
| `bydoxe future position history` | `GET /future/position/history-position` |
| `bydoxe future account info` | `GET /future/account` |
| `bydoxe future account max-open` | `GET /future/account/max-open` |
| `bydoxe future account liq-price` | `GET /future/account/liq-price` |
| `bydoxe future account open-count` | `GET /future/account/open-count` |
| `bydoxe future order detail` | `GET /future/order/detail` |
| `bydoxe future order fills` | `GET /future/order/fills` |
| `bydoxe future order fill-history` | `GET /future/order/fill-history` |
| `bydoxe future order orders-pending` | `GET /future/order/orders-pending` |
| `bydoxe future order orders-history` | `GET /future/order/orders-history` |
| `bydoxe copytrading trader current-orders` | `GET /copy/mix-trader/order-current-track` |
| `bydoxe copytrading trader history-orders` | `GET /copy/mix-trader/order-history-track` |
| `bydoxe copytrading trader total-detail` | `GET /copy/mix-trader/order-total-detail` |
| `bydoxe copytrading trader profit-summary` | `GET /copy/mix-trader/profit-history-summarys` |
| `bydoxe copytrading trader profit-history` | `GET /copy/mix-trader/profit-history-details` |
| `bydoxe copytrading trader profit-details` | `GET /copy/mix-trader/profit-details` |
| `bydoxe copytrading trader followers` | `GET /copy/mix-trader/query-followers` |
| `bydoxe copytrading follower current-orders` | `GET /copy/mix-follower/query-current-orders` |
| `bydoxe copytrading follower history-orders` | `GET /copy/mix-follower/query-history-orders` |
| `bydoxe copytrading follower settings` | `GET /copy/mix-follower/query-copy-trade-settings` |
| `bydoxe copytrading follower traders` | `GET /copy/mix-follower/query-my-traders` |

## Write Commands

Write commands require local credentials and exact `--confirm CONFIRM` for live execution. Always review `--dry-run` output first.

| Command | Endpoint |
| --- | --- |
| `bydoxe spot trade place-order` | `POST /spot/trade/place-order` |
| `bydoxe spot trade cancel-order` | `POST /spot/trade/cancel-order` |
| `bydoxe spot trade cancel-replace-order` | `POST /spot/trade/cancel-replace-order` |
| `bydoxe spot trade batch-cancel-replace-order` | `POST /spot/trade/batch-cancel-replace-order` |
| `bydoxe spot trade batch-orders` | `POST /spot/trade/batch-orders` |
| `bydoxe spot trade batch-cancel-orders` | `POST /spot/trade/batch-cancel-orders` |
| `bydoxe spot trade cancel-symbol-order` | `POST /spot/trade/cancel-symbol-order` |
| `bydoxe spot account transfer` | `POST /spot/account/transfer` |
| `bydoxe spot account withdraw` | `POST /spot/account/withdraw` |
| `bydoxe spot account cancel-withdraw` | `POST /spot/account/cancel-withdraw` |
| `bydoxe future account set-leverage` | `POST /future/account/set-leverage` |
| `bydoxe future account set-margin` | `POST /future/account/set-margin` |
| `bydoxe future account set-margin-mode` | `POST /future/account/set-margin-mode` |
| `bydoxe future order place` | `POST /future/order/place-order` |
| `bydoxe future order click-backhand` | `POST /future/order/click-backhand` |
| `bydoxe future order batch-place` | `POST /future/order/batch-place-order` |
| `bydoxe future order modify` | `POST /future/order/modify-order` |
| `bydoxe future order cancel` | `POST /future/order/cancel-order` |
| `bydoxe future order batch-cancel` | `POST /future/order/batch-cancel-orders` |
| `bydoxe future order close-positions` | `POST /future/order/close-positions` |
| `bydoxe future order cancel-all` | `POST /future/order/cancel-all-orders` |
| `bydoxe future trigger place` | `POST /future/order/place-plan-order` |
| `bydoxe future trigger modify` | `POST /future/order/modify-plan-order` |
| `bydoxe future trigger cancel` | `POST /future/order/cancel-plan-order` |
| `bydoxe future tpsl place` | `POST /future/order/place-tpsl-order` |
| `bydoxe future tpsl modify` | `POST /future/order/modify-tpsl-order` |
| `bydoxe copytrading trader modify-tpsl` | `POST /copy/mix-trader/order-modify-tpsl` |
| `bydoxe copytrading trader close-positions` | `POST /copy/mix-trader/order-close-positions` |
| `bydoxe copytrading trader config` | `POST /copy/mix-trader/config-trader-setting` |
| `bydoxe copytrading trader remove-follower` | `POST /copy/mix-trader/remove-follower` |
| `bydoxe copytrading follower setting-tpsl` | `POST /copy/mix-follower/setting-tpsl` |
| `bydoxe copytrading follower setting-copy-trade` | `POST /copy/mix-follower/setting-copy-trade` |
| `bydoxe copytrading follower close-positions` | `POST /copy/mix-follower/close-positions` |
| `bydoxe copytrading follower cancel-follow` | `POST /copy/mix-follower/cancel-follow` |

Write request bodies can be built from flags or passed as JSON:

```sh
bydoxe future account set-leverage --symbol BTCUSDT --longLeverage 5 --shortLeverage 5 --dry-run --format json
bydoxe future account set-leverage --body '{"symbol":"BTCUSDT","longLeverage":5,"shortLeverage":5}' --dry-run --format json
bydoxe copytrading trader config --body '{"symbol":"BTCUSDT","copyTradeMode":"fixed"}' --dry-run --format json
bydoxe copytrading follower cancel-follow --body '{"traderId":"trader-1"}' --dry-run --format json
```
