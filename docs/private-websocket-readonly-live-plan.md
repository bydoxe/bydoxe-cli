# Private WebSocket Read-Only Live Plan

This document defines the implementation boundary for any later private WebSocket live support. The current CLI still blocks all private WebSocket live execution.

## Current Policy

Private WebSocket live execution remains disabled. The CLI may build dry-run previews for private login, private subscriptions, private unsubscriptions, and private spot trade messages, but it must not open a private WebSocket session from those commands yet.

The codebase contains an internal mock-tested read-only executor shape for future enablement. It is not wired into the CLI live path while the private live safety gate remains closed.

Default private domain:

```text
wss://open-api.bydoxe.com/v1/ws/private
```

## Allowed Experimental Scope

The first private live experiment may only cover authenticated read-only streams:

- `bydoxe websocket private login`
- `bydoxe websocket private subscribe`
- `bydoxe websocket private unsubscribe`

The experiment must perform a login handshake before sending a private subscription message. It must close the connection with bounded runtime controls.

Required runtime controls:

- `--live`
- `--max-messages <number>`
- `--timeout-ms <number>`
- Explicit environment opt-in, for example `BYDOXE_RUN_PRIVATE_WS_READONLY_LIVE=1`

## Explicitly Excluded Scope

The following must stay outside the read-only live path:

- `bydoxe websocket private spot trade`
- Any payload with `op: "trade"`
- Order placement
- Order cancellation
- Transfer, withdrawal, leverage, margin, TP/SL, trigger order, or copy trading writes

Trade-capable WebSocket execution needs a separate implementation path with exact `--confirm CONFIRM`, stricter dry-run review, and isolated tests.

## Proposed Execution Flow

1. Build a private login preview from local credentials.
2. Open `wss://open-api.bydoxe.com/v1/ws/private`.
3. Send the signed login message.
4. Wait for a login acknowledgement before sending any subscription message.
5. Send one read-only subscribe or unsubscribe message.
6. Collect messages until `--max-messages` or `--timeout-ms` is reached.
7. Close the socket and return a structured result with redacted credential-bearing fields.

The structured result should follow the existing public live result shape:

```json
{
  "live": true,
  "command": "bydoxe websocket private subscribe",
  "connection": {
    "url": "wss://open-api.bydoxe.com/v1/ws/private",
    "scope": "private"
  },
  "sent": {
    "login": {
      "op": "login",
      "args": {
        "apiKey": "***",
        "passphrase": "***",
        "timestamp": "<timestamp>",
        "sign": "***"
      }
    },
    "message": {
      "op": "subscribe",
      "args": [
        {
          "instType": "USDT-FUTURES",
          "channel": "orders",
          "instId": "BTCUSDT"
        }
      ]
    }
  },
  "received": [],
  "closed": {
    "code": 1000,
    "reason": "max messages reached"
  }
}
```

## Required Tests Before Enabling

Unit tests:

- Login message is sent before subscription.
- Subscription is not sent if login acknowledgement fails.
- Credential-bearing fields are redacted from results.
- `--max-messages` closes the session.
- `--timeout-ms` closes the session.
- Any `op: "trade"` message is rejected by the read-only executor.

Current mock-tested coverage:

- Login is sent before subscription.
- Subscription waits for login acknowledgement.
- Credential-bearing login result fields are redacted.
- Trade messages are rejected by the read-only executor.

Optional live smoke:

- Disabled by default.
- Requires credentials.
- Requires explicit environment opt-in.
- Uses a read-only private channel only.
- Uses short runtime limits.

## Agent Handling

Agent workflows must keep private WebSocket live requests in preview-only mode until the CLI implements and validates this read-only path. If a user asks for live private subscriptions, show the dry-run preview and explain that live private sessions are not enabled yet.

If a user asks for private WebSocket trading, use the separate high-risk write policy and do not treat it as part of this read-only plan.
