# Distribution Policy

This document defines the release and distribution policy for the BYDOXE CLI.

## Release Versioning

The current public release of the BYDOXE CLI must use the same version as the companion BYDOXE Agent Skills release.

Current patch release target:

```text
0.1.3
```

After each release, the maintainer may choose future versions based on implementation scope, safety changes, compatibility changes, and documentation updates.

Recommended versioning rules:

- Patch releases for documentation fixes, validation fixes, and small compatibility updates.
- Minor releases for new commands, new validation coverage, new live smoke gates, or meaningful agent workflow improvements.
- Major releases for breaking command names, breaking output shapes, credential handling changes, or safety model changes.

## NPM Package Distribution

The CLI is intended to be distributed as an npm package.

The package must include:

- `dist`
- `docs`
- `README.md`
- `DISCLAIMER.md`
- `CHANGELOG.md`

The package must not include:

- API credentials
- Local shell profiles
- Generated logs
- Temporary test output
- Workspace-only planning notes

Run this before publishing:

```sh
npm run validate
npm pack --dry-run
```

If the local npm cache has permission issues, use a workspace-safe cache path:

```sh
npm --cache /private/tmp/bydoxe-npm-cache pack --dry-run
```

## Credential Configuration

BYDOXE private API credentials must be configured by each installer or operator in their own local environment or local CLI profile.

The package must never ship with credentials, placeholder secrets that look real, shared test keys, or account-specific configuration.

Recommended local profile setup:

```sh
bydoxe config set
bydoxe config status
```

The local profile is stored at `~/.bydoxe/config` with `0600` permissions. Agents should use `bydoxe config status` to verify setup and must never read or print secret values.

Environment variables are also supported and take priority over the local profile:

```sh
export BYDOXE_ACCESS_KEY="<your-access-key>"
export BYDOXE_SECRET_KEY="<your-secret-key>"
export BYDOXE_PASSPHRASE="<your-passphrase>"
```

Optional endpoint overrides:

```sh
export BYDOXE_REST_BASE_URL="https://open-api.bydoxe.com/api/v1"
export BYDOXE_PUBLIC_WS_URL="wss://open-api.bydoxe.com/v1/ws/public"
export BYDOXE_PRIVATE_WS_URL="wss://open-api.bydoxe.com/v1/ws/private"
```

Private read-only WebSocket live smoke requires explicit local opt-in:

```sh
export BYDOXE_RUN_LIVE_PRIVATE_WS_TESTS=1
export BYDOXE_ENABLE_PRIVATE_WS_READONLY_LIVE=1
```

Do not paste API secrets into AI chat sessions, issue trackers, release notes, or documentation examples.

## Publish Readiness

Publishing requires confirmed npm account access and package ownership for `@bydoxe/bydoxe-cli`.

Before publishing:

- Complete the release readiness checklist.
- Confirm package ownership and npm access.
- Confirm the version matches the companion BYDOXE Agent Skills release for the coordinated release.
- Confirm private credential setup remains installer-owned.
- Confirm live write actions are not part of automated release validation.
