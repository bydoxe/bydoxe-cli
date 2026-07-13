# Write Body Validation Plan

This document defines the next validation boundary for high-risk write request bodies. The current CLI validates top-level required parameters, common positive numeric fields, enum-like fields, and order identifier alternatives. Nested batch bodies need a separate validation layer before stricter live execution.

## Current Boundary

The current write validation layer checks top-level body fields only.

Covered top-level rule types:

- Required body parameters from command metadata.
- Positive numeric fields such as `amount`, `size`, `price`, `triggerPrice`, leverage, and margin amounts.
- Enum-like fields such as `orderType`, `tradeType`, `side`, `holdSide`, `timeInForce`, `marginMode`, and `planType`.
- Identifier alternatives such as one of `orderId` or `clientOid`.

Generated references expose these rules when they are attached to a command.

## Nested Validation Scope

The next validation layer should cover array and object fields used by batch write commands.

Primary batch targets:

| Command | Endpoint | Nested Field | Expected Shape |
| --- | --- | --- | --- |
| `bydoxe spot trade batch-orders` | `POST /spot/trade/batch-orders` | `orders` | Non-empty array of spot order objects |
| `bydoxe spot trade batch-cancel-replace-order` | `POST /spot/trade/batch-cancel-replace-order` | `orders` | Non-empty array of cancel-replace objects |
| `bydoxe spot trade batch-cancel-orders` | `POST /spot/trade/batch-cancel-orders` | `orderIds` or `clientOids` | Non-empty identifier array |
| `bydoxe future order batch-place` | `POST /future/order/batch-place-order` | `orders` | Non-empty array of futures order objects |
| `bydoxe future order batch-cancel` | `POST /future/order/batch-cancel-orders` | `orderIds` or `clientOids` | Non-empty identifier array |

Secondary targets after the batch layer:

- Copy trading close-position bodies with repeated tracking identifiers if BYDOXE supports array input.
- Trigger or TP/SL endpoints if BYDOXE documents array input variants.

## Rule Types

Nested validation should support these rule types:

- `arrayRequired`: the field must be an array with at least one item.
- `arrayMaxItems`: the field must not exceed a documented or locally configured item limit.
- `arrayItemRequiredParams`: each array item must include required fields.
- `arrayItemPositiveNumberParams`: each array item must use positive numbers for amount, size, price, trigger price, or leverage-like fields.
- `arrayItemEnumParams`: each array item must use known enum values.
- `arrayItemRequireAnyParams`: each array item must include at least one supported identifier.
- `identifierArrayRequired`: at least one identifier array must be present and non-empty.
- `identifierArrayItems`: identifier arrays must contain only usable string or number values.

## Suggested Rule Mapping

Spot batch place:

- `orders` must be a non-empty array.
- Each item should include `symbol`, `orderType`, `tradeType`, and `amount`.
- Each item should validate positive `amount` and optional positive `price`.
- Each item should validate spot order enums.

Spot batch cancel and replace:

- `orders` must be a non-empty array.
- Each item should include `symbol`.
- Each item should include one of `orderId` or `clientOid`.
- Each item should validate optional positive `amount` and `price`.
- Each item should validate spot order enums when present.

Spot batch cancel:

- Require one of non-empty `orderIds` or non-empty `clientOids`.
- If `symbol` is present, keep it as a top-level field.

Futures batch place:

- `orders` must be a non-empty array.
- Each item should include `symbol`, `side`, `orderType`, and `size`.
- Each item should validate positive `size` and optional positive `price`.
- Each item should validate futures order enums.

Futures batch cancel:

- Require one of non-empty `orderIds` or non-empty `clientOids`.
- If `symbol` is present, keep it as a top-level field.

## Error Message Shape

Nested errors should point to the exact path that failed.

Examples:

```text
orders[0].amount must be a positive number
orders[1].orderType must be one of MARKET, LIMIT
one of orders[2].orderId, orders[2].clientOid is required
one of orderIds, clientOids must be a non-empty array
```

The CLI should continue to aggregate validation failures into one `CliError` message before request construction.

## Generated Reference Impact

The command catalog should expose nested validation rules when they are implemented. The human-readable command reference should summarize nested rules without rendering large schema blocks.

Suggested generated summary examples:

```text
orders[] required; each item requires symbol, orderType, tradeType, amount
one of orderIds[], clientOids[] required
orders[] positive: amount, price; enum: orderType, tradeType
```

## Safety Policy

Nested validation is a local safety layer, not an exchange-side guarantee. Agents and users must still review the dry-run output before live execution.

For batch writes, the dry-run review should include:

- Number of batch items.
- Symbol coverage.
- Side and order type coverage.
- Total visible quantity when all quantities are explicit.
- Identifier list size for batch cancellations.
- The exact `CONFIRM` requirement for live execution.
