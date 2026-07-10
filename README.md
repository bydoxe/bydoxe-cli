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
- Dry-run request preview support
- Public REST execution through Node.js fetch
- Private REST request signing with redacted dry-run previews
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
