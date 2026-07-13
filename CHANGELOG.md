# Changelog

## 0.1.0 - Unreleased

- Add initial BYDOXE CLI scaffold.
- Add TypeScript project configuration.
- Add CLI entry point with help and dry-run request preview.
- Add environment-based configuration loading.
- Add HMAC SHA256 Base64 signature helper.
- Add REST request builder.
- Add signature unit test.
- Add public REST command routing for time, spot market, and futures market data.
- Add public REST execution through Node.js fetch.
- Add request URL and mocked execution tests.
- Add authenticated REST read command routing with signed requests.
- Add redacted dry-run previews for authenticated requests.
- Add authenticated REST write command routing with required `CONFIRM` execution gate.
- Add JSON body support for write command previews and execution.
- Add copy trading trader and follower REST read command routing.
- Add copy trading write command routing for TP/SL, settings, close-position, follower removal, and cancel-follow actions.
- Add WebSocket message previews for public channels, private login, private subscriptions, and private spot trade payloads.
- Add project validation checks for domains, unfinished markers, and English-only artifacts.
- Add validation that all registered CLI commands are documented in the README.
- Add README dry-run smoke validation for documented CLI examples.
- Add bounded public WebSocket live execution with `--live`, `--max-messages`, and `--timeout-ms`.
- Add optional public WebSocket live smoke validation behind `BYDOXE_RUN_LIVE_WS_TESTS=1`.
- Add command registry metadata for auth, risk level, parameter mode, and future parameter validation.
- Add expanded public REST market data commands for spot metadata, spot trades, futures depth, futures candles, futures funding, and futures open interest.
- Add private REST read and write command parameter metadata hints.
- Add required parameter validation before REST request construction.
- Add command metadata to REST and WebSocket dry-run previews.
- Add required and optional parameter hints to CLI help output.
- Add remaining futures public market REST commands.
- Add optional public REST live smoke validation behind `BYDOXE_RUN_LIVE_REST_TESTS=1`.
- Add remaining read-only REST commands for spot order info and futures trigger order queries.
- Add a generated command catalog for registry-backed command metadata synchronization.
- Add a generated human-readable command reference from the command catalog.
- Add typed validation for common write command numeric fields, enum fields, and order identifier alternatives.
