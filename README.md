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
- WebSocket message preview routing
- Public WebSocket live execution
- Command registry metadata for auth, risk, and parameter mode
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
npm run validate
npm run typecheck
npm test
npm run catalog:generate
npm run catalog:check
npm run reference:generate
npm run reference:check
npm run summary:generate
npm run summary:check
npm run smoke:readme
npm run smoke:public-rest-live
npm run smoke:websocket-live
npm run smoke:websocket-private-live
npm run build
```

`npm run validate` runs type checking, unit tests, command catalog, generated reference, generated summary freshness checks, README dry-run smoke examples, optional public REST and WebSocket live smoke gates, README command coverage checks, command metadata checks, domain checks, unfinished-marker checks, and English-only content checks for project artifacts. The public REST live smoke is skipped unless `BYDOXE_RUN_LIVE_REST_TESTS=1` is set. The public WebSocket live smoke is skipped unless `BYDOXE_RUN_LIVE_WS_TESTS=1` is set. The private read-only WebSocket live smoke is skipped unless `BYDOXE_RUN_LIVE_PRIVATE_WS_TESTS=1` is set.

`docs/command-catalog.json` is generated from the CLI command registries. It is the machine-readable source for command metadata, required parameters, optional parameters, auth scope, risk level, transport, and endpoint mapping.

`docs/command-reference.md` is generated from the command catalog. It is the human-readable command reference for endpoint mapping, parameter hints, and write validation rules.

`docs/command-summary.md` is generated from the command catalog. It is the quick status summary for command counts, group coverage, risk profile, and safety scope.

Use [docs/release-readiness.md](docs/release-readiness.md) before publishing or tagging a release.

## Command Reference

Use [docs/command-reference.md](docs/command-reference.md) for the full generated CLI command surface. It includes REST endpoints, WebSocket scopes, auth requirements, risk levels, required parameters, optional parameters, and write validation rules.

Use [docs/command-summary.md](docs/command-summary.md) for a generated command coverage and safety summary.

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
bydoxe spot market coins --coin BTC --dry-run --format json
bydoxe spot market tickers --symbol BTCUSDT --dry-run --format json
bydoxe spot market orderbook --symbol BTCUSDT --limit 20 --dry-run
bydoxe spot market candles --symbol BTCUSDT --granularity 1m --limit 100 --dry-run
bydoxe spot market fills --symbol BTCUSDT --limit 50 --dry-run --format json
bydoxe future market ticker --symbol BTCUSDT --dry-run
bydoxe future market mark-price --symbol BTCUSDT --dry-run
bydoxe future market depth --symbol BTCUSDT --limit 500 --dry-run --format json
bydoxe future market taker-buy-sell --symbol BTCUSDT --period 1h --dry-run --format json
bydoxe account funding-assets --coin USDT --dry-run --format json
bydoxe spot trade order-info --orderId 123456789 --dry-run --format json
bydoxe future position all --dry-run --format json
bydoxe future trigger orders-history --limit 100 --symbol BTCUSDT --dry-run --format json
bydoxe copytrading trader followers --pageNo 1 --pageSize 20 --dry-run --format json
bydoxe copytrading follower settings --traderId trader-1 --dry-run --format json
bydoxe spot trade place-order --body '{"symbol":"BTCUSDT","orderType":"MARKET","tradeType":"BUY","amount":"0.001"}' --dry-run --format json
bydoxe copytrading follower cancel-follow --body '{"traderId":"trader-1"}' --dry-run --format json
bydoxe websocket public subscribe --instType SPOT --channel ticker --instId BTCUSDT --dry-run --format json
bydoxe websocket private login --dry-run --format json
```

The dry-run mode prints the request that would be sent without making a network call.

Commands with required parameter metadata fail before building a request when required values are missing.

Write commands validate common non-empty string identifiers, positive numeric fields, enum-like fields, order identifier alternatives, and supported nested batch body fields before building a request.

Nested batch body validation covers supported spot and futures batch order arrays and batch cancel identifier arrays. See [docs/write-body-validation-plan.md](docs/write-body-validation-plan.md) for the current scope.

Dry-run output includes command metadata for auth scope, risk level, parameter mode, required parameters, and optional parameters.

`bydoxe --help` lists required and optional parameter hints from the same command registry metadata.

The optional public REST live smoke runs a bounded `public time` request only when explicitly enabled:

```sh
BYDOXE_RUN_LIVE_REST_TESTS=1 npm run smoke:public-rest-live
```

Public REST market samples are a second opt-in layer:

```sh
BYDOXE_RUN_LIVE_REST_TESTS=1 BYDOXE_RUN_LIVE_REST_MARKET_TESTS=1 npm run smoke:public-rest-live
```

Market samples include spot tickers, spot orderbook, spot candles, futures ticker, and futures candles. Set `BYDOXE_REST_LIVE_SYMBOL` to override the default market sample symbol. Set `BYDOXE_REST_LIVE_CANDLE_INTERVAL` to override the default candle interval.

## Public REST Commands

| Command | Endpoint |
| --- | --- |
| `bydoxe public time` | `GET /public/time` |
| `bydoxe spot market coins` | `GET /spot/market/coins` |
| `bydoxe spot market symbols` | `GET /spot/market/symbols` |
| `bydoxe spot market tickers` | `GET /spot/market/tickers` |
| `bydoxe spot market orderbook` | `GET /spot/market/orderbook` |
| `bydoxe spot market candles` | `GET /spot/market/candles` |
| `bydoxe spot market history-candles` | `GET /spot/market/history-candles` |
| `bydoxe spot market fills` | `GET /spot/market/fills` |
| `bydoxe spot market fills-history` | `GET /spot/market/fills-history` |
| `bydoxe future market ticker` | `GET /future/market/24h-ticker` |
| `bydoxe future market mark-price` | `GET /future/market/mark-price` |
| `bydoxe future market book-ticker` | `GET /future/market/book-ticker` |
| `bydoxe future market fills` | `GET /future/market/fills` |
| `bydoxe future market fills-history` | `GET /future/market/fills-history` |
| `bydoxe future market depth` | `GET /future/market/depth` |
| `bydoxe future market candles` | `GET /future/market/candles` |
| `bydoxe future market history-fund-rate` | `GET /future/market/history-fund-rate` |
| `bydoxe future market history-candles` | `GET /future/market/history-candles` |
| `bydoxe future market history-index-candles` | `GET /future/market/history-index-candles` |
| `bydoxe future market history-mark-candles` | `GET /future/market/history-mark-candles` |
| `bydoxe future market funding-info` | `GET /future/market/funding-info` |
| `bydoxe future market open-interest` | `GET /future/market/open-interest` |
| `bydoxe future market taker-buy-sell` | `GET /future/market/taker-buy-sell` |
| `bydoxe future market account-long-short` | `GET /future/market/account-long-short` |
| `bydoxe future market top-trader-position-long-short` | `GET /future/market/top-trader-position-long-short` |
| `bydoxe future market top-trader-account-long-short` | `GET /future/market/top-trader-account-long-short` |
| `bydoxe future market query-position-tier` | `GET /future/market/query-position-tier` |

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
| `bydoxe spot trade order-info` | `POST /spot/trade/order-info` |
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
| `bydoxe future trigger orders-pending` | `GET /future/order/orders-plan-pending` |
| `bydoxe future trigger orders-history` | `GET /future/order/orders-plan-history` |
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

Authenticated read request parameters can be built from flags. Read-only POST commands, such as `spot trade order-info`, also accept `--body` JSON.

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

## WebSocket Commands

WebSocket commands build connection and message previews with `--dry-run`. Public WebSocket commands also support bounded live sessions with `--live`. Private WebSocket live sessions are intentionally disabled behind a safety gate.

| Command | Purpose |
| --- | --- |
| `bydoxe websocket public ping` | Preview a public WebSocket ping message |
| `bydoxe websocket public subscribe` | Preview a public channel subscription |
| `bydoxe websocket public unsubscribe` | Preview a public channel unsubscription |
| `bydoxe websocket private login` | Preview a signed private login payload |
| `bydoxe websocket private subscribe` | Preview a private channel subscription |
| `bydoxe websocket private unsubscribe` | Preview a private channel unsubscription |
| `bydoxe websocket private spot trade` | Preview a private spot trade payload |

Examples:

```sh
bydoxe websocket public ping --dry-run --format json
bydoxe websocket public subscribe --instType SPOT --channel ticker --instId BTCUSDT --dry-run --format json
bydoxe websocket private login --dry-run --format json
bydoxe websocket private subscribe --instType USDT-FUTURES --channel orders --instId BTCUSDT --dry-run --format json
bydoxe websocket private spot trade --instId BTCUSDT --side buy --orderType limit --size 0.01 --price 60000 --dry-run --format json
```

Public live examples:

```text
bydoxe websocket public ping --live --timeout-ms 5000 --format json
bydoxe websocket public subscribe --instType SPOT --channel ticker --instId BTCUSDT --live --max-messages 5 --timeout-ms 15000 --format json
```

Optional live smoke:

```sh
BYDOXE_RUN_LIVE_WS_TESTS=1 npm run smoke:websocket-live
```

Optional private read-only live smoke:

```sh
BYDOXE_RUN_LIVE_PRIVATE_WS_TESTS=1 BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE=1 npm run smoke:websocket-private-live
```

The private smoke uses the live private WebSocket URL `wss://open-api.bydoxe.com/v1/ws/private` by default. Set `BYDOXE_PRIVATE_WS_LIVE_URL`, `BYDOXE_PRIVATE_WS_LIVE_INST_TYPE`, `BYDOXE_PRIVATE_WS_LIVE_CHANNEL`, `BYDOXE_PRIVATE_WS_LIVE_INST_ID`, `BYDOXE_PRIVATE_WS_LIVE_MAX_MESSAGES`, or `BYDOXE_PRIVATE_WS_LIVE_TIMEOUT_MS` to override the default private read-only WebSocket sample.

Private WebSocket login previews redact credential-bearing fields in dry-run output. Private spot trade messages require exact `--confirm CONFIRM` before any future live execution path.

Private read-only WebSocket live execution is limited to private subscribe and unsubscribe commands and requires all of these gates:

- Authenticated login handshake verification.
- Explicit `BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE=1` opt-in.
- Explicit `--max-messages` and `--timeout-ms` bounds.
- Local credentials configured through environment variables.

Example:

```sh
BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE=1 bydoxe websocket private subscribe --instType USDT-FUTURES --channel orders --instId BTCUSDT --live --max-messages 2 --timeout-ms 10000 --format json
```

See [docs/private-websocket-readonly-live-plan.md](docs/private-websocket-readonly-live-plan.md) for the read-only private WebSocket live boundary. Private spot trade live execution is not part of that boundary.
