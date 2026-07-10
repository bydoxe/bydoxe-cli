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
- Dry-run request preview support
- Public REST execution through Node.js fetch
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
