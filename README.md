# BYDOXE CLI

BYDOXE CLI is a command-line tool for interacting with the BYDOXE Open API.

It provides a safe execution layer for market data, account queries, spot trading, futures trading, positions, TP/SL, copy trading, and WebSocket workflows. The CLI handles API credentials, HMAC request signing, REST request construction, structured output, and dry-run previews.

## Status

This repository is in the initial scaffold phase.

Implemented in this phase:

- TypeScript project structure
- CLI entry point
- Configuration loading from environment variables
- HMAC signature helper
- REST request builder
- Dry-run request preview support
- Signature unit test using Node.js built-in test runner

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
```

The dry-run mode prints the request that would be sent without making a network call.
