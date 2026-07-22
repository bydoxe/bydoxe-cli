# Changelog

## 0.1.3 - 2026-07-22

- Add `bydoxe future tpsl cancel` for `POST /future/order/cancel-tpsl-order`.
- Align spot, futures, TP/SL, and copy trading write command metadata with the current BYDOXE API DTO field names.
- Strengthen nested validation for `orderList` and `orderIdList` request bodies.
- Update generated command catalog, command reference, and command summary for the expanded command surface.

## 0.1.2 - 2026-07-14

- Add `bydoxe config set`, `bydoxe config status`, and `bydoxe config clear` for local credential profile management.
- Load private API credentials from environment variables first, then from the local `~/.bydoxe/config` profile.
- Store local credential profiles with restricted `0600` file permissions.
- Add masked credential status output so agents can verify setup without reading secret values.
- Document local profile setup, environment overrides, and installer-owned credential handling.

## 0.1.1 - 2026-07-14

- Align npm package versioning for the patch release after the initial `0.1.0` publication.
- Use the live private WebSocket URL by default for optional private read-only WebSocket smoke validation.
- Add npm distribution and installer-owned credential configuration policy.
- Rewrite README introduction and examples around user onboarding, safety, credentials, and common workflows.
- Tighten README smoke extraction so runnable shell examples are parsed from fenced blocks reliably.

## 0.1.0 - 2026-07-14

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
- Document and enforce a private WebSocket live safety gate policy.
- Add second-layer opt-in public REST market data live smoke samples.
- Expose write command validation rules in the generated command catalog and reference.
- Link the generated command reference from the README as the full CLI command surface.
- Document the proposed read-only private WebSocket live boundary.
- Add orderbook and candle samples to the optional public REST market live smoke.
- Document the planned nested validation scope for batch write bodies.
- Add a generated command summary for README and agent workflow routing.
- Add a mock-tested internal private WebSocket read-only executor while keeping CLI live execution blocked.
- Add nested validation for supported batch write request bodies.
- Wire private WebSocket read-only live execution behind an explicit opt-in gate.
- Align public WebSocket live smoke validation with the current live result shape.
- Add non-empty string validation for remaining write command identifiers.
- Add optional private read-only WebSocket live smoke validation behind explicit credential gates.
- Add a release readiness checklist for validation, generated artifacts, packaging, and safety review.
