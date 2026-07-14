# Release Readiness Checklist

This checklist defines the minimum review path before publishing or tagging a BYDOXE CLI release.

Use [distribution.md](distribution.md) for versioning, npm publishing, and installer-owned credential configuration policy.

## Required Local Checks

- Run `npm install` from a clean checkout when dependencies change.
- Run `npm run validate`.
- Confirm `npm run validate` reports the public REST, public WebSocket, and private read-only WebSocket live smokes as skipped unless explicit live gates are enabled.
- Run `npm pack --dry-run` and review the packaged file list.
- Confirm the package includes `dist`, `docs`, `README.md`, `DISCLAIMER.md`, and `CHANGELOG.md`.
- Confirm the package does not include local credentials, generated logs, or temporary files.
- Confirm private API credentials remain configured only by each installer or operator through local environment variables.

## Generated Artifacts

- `docs/command-catalog.json` must be up to date.
- `docs/command-reference.md` must be up to date.
- `docs/command-summary.md` must be up to date.
- `docs/command-summary.md` must show the expected command count.
- `docs/command-summary.md` must show write validation coverage.

## Safety Review

- Write REST commands must require exact `--confirm CONFIRM` before live execution.
- Write REST commands must support dry-run review before live execution.
- Credential-bearing request and WebSocket login fields must be redacted in previews and live result summaries.
- Private WebSocket spot trade must remain outside read-only live workflows.
- Private read-only WebSocket live smoke must require credentials plus explicit environment gates.
- Public and private live smoke commands must remain bounded by message count or timeout.

## Optional Live Checks

Run live checks only from a local environment that is allowed to make network requests.

Public REST smoke:

```sh
BYDOXE_RUN_LIVE_REST_TESTS=1 npm run smoke:public-rest-live
```

Public REST market samples:

```sh
BYDOXE_RUN_LIVE_REST_TESTS=1 BYDOXE_RUN_LIVE_REST_MARKET_TESTS=1 npm run smoke:public-rest-live
```

Public WebSocket smoke:

```sh
BYDOXE_RUN_LIVE_WS_TESTS=1 npm run smoke:websocket-live
```

Private read-only WebSocket smoke:

```sh
BYDOXE_RUN_LIVE_PRIVATE_WS_TESTS=1 BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE=1 npm run smoke:websocket-private-live
```

The private read-only WebSocket smoke uses `wss://open-api.bydoxe.com/v1/ws/private` by default and validates that live URL in the command result.

Do not run write commands against live accounts as part of automated release validation.

## Documentation Review

- README command examples must stay dry-run unless they are explicitly marked as optional live smoke commands.
- README, generated command reference, and generated command summary must agree on command coverage and validation scope.
- `CHANGELOG.md` must describe user-visible changes since the previous release.
- `DISCLAIMER.md` must remain included in the package.

## Release Decision

Release is ready only when:

- Required local checks pass.
- Generated artifacts are current.
- Safety review has no open blocker.
- Optional live checks are either completed in an approved environment or explicitly deferred.
- The release version matches the companion BYDOXE Agent Skills release version.
- The release commit is tagged from a clean working tree.
