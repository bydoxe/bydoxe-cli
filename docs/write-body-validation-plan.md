# Write Body Validation Plan

This document defines the validation boundary for high-risk write request bodies. The current CLI validates top-level required parameters, common positive numeric fields, enum-like fields, order identifier alternatives, and the primary nested batch body targets listed below.

## Current Boundary

The current write validation layer checks top-level body fields and primary batch write arrays.

Covered top-level rule types:

- Required body parameters from command metadata.
- Positive numeric fields such as `amount`, `size`, `price`, `triggerPrice`, leverage, and margin amounts.
- Enum-like fields such as `orderType`, `tradeType`, `side`, `holdSide`, `timeInForce`, `marginMode`, and `planType`.
- Identifier alternatives such as one of `orderId` or `clientOid`.

Generated references expose these rules when they are attached to a command.

Covered nested rule types:

- Non-empty `orderList[]` arrays for supported spot and futures batch place, cancel, and cancel-replace commands.
- Required fields inside supported `orderList[]` items.
- Positive numeric fields inside supported `orderList[]` items.
- Enum-like fields inside supported `orderList[]` items.
- Identifier alternatives inside supported futures cancel `orderList[]` or `orderIdList[]` items.
- Non-empty `orderIdList[]` arrays for supported futures batch cancel, trigger cancel, and TP/SL cancel commands.

## Nested Validation Scope

The nested validation layer covers array and object fields used by primary batch write commands.

Primary batch targets:

| Command | Endpoint | Nested Field | Expected Shape |
| --- | --- | --- | --- |
| `bydoxe spot trade batch-orders` | `POST /spot/trade/batch-orders` | `orderList` | Non-empty array of spot order objects |
| `bydoxe spot trade batch-cancel-replace-order` | `POST /spot/trade/batch-cancel-replace-order` | `orderList` | Non-empty array of cancel-replace objects |
| `bydoxe spot trade batch-cancel-orders` | `POST /spot/trade/batch-cancel-orders` | `orderList` | Non-empty array of spot cancel objects |
| `bydoxe future order batch-place` | `POST /future/order/batch-place-order` | `orderList` | Non-empty array of futures order objects |
| `bydoxe future order batch-cancel` | `POST /future/order/batch-cancel-orders` | `orderIdList` | Non-empty array of futures cancel identifiers |
| `bydoxe future trigger cancel` | `POST /future/order/cancel-plan-order` | `orderIdList` | Non-empty array of trigger cancel identifiers |
| `bydoxe future tpsl cancel` | `POST /future/order/cancel-tpsl-order` | `orderIdList` | Non-empty array of TP/SL cancel identifiers |

Secondary targets after the batch layer:

- Copy trading close-position bodies with repeated tracking identifiers if BYDOXE supports array input.
- Trigger or TP/SL endpoints if BYDOXE documents array input variants.

## Rule Types

Nested validation supports these rule types:

- `arrayRequired`: the field must be an array with at least one item.
- `arrayItemRequiredParams`: each array item must include required fields.
- `arrayItemPositiveNumberParams`: each array item must use positive numbers for amount, size, price, trigger price, or leverage-like fields.
- `arrayItemEnumParams`: each array item must use known enum values.
- `arrayItemRequireAnyParams`: each array item must include at least one supported identifier.
- `identifierArrayRequired`: at least one identifier array must be present and non-empty.
- `identifierArrayItems`: identifier arrays must contain only usable string or number values.

## Suggested Rule Mapping

Implemented mapping:

Spot batch place:

- `orderList` must be a non-empty array.
- Each item should include `side`, `orderType`, and `size`.
- Each item should validate positive `size` and optional positive `price`.
- Each item should validate spot batch order enums.

Spot batch cancel and replace:

- `orderList` must be a non-empty array.
- Each item should include `symbol`, `price`, `size`, and `orderId`.
- Each item should validate positive `price` and `size`.

Spot batch cancel:

- `orderList` must be a non-empty array.
- Each item should include `orderId`.
- If `symbol` or `batchMode` is present, keep it as a top-level field.

Futures batch place:

- `orderList` must be a non-empty array.
- Top-level `symbol` and `marginMode` are required.
- Each item should include `side`, `tradeSide`, `orderType`, and `size`.
- Each item should validate positive `size` and optional positive `price`.
- Each item should validate futures order enums.

Futures batch cancel:

- `orderIdList` must be a non-empty array.
- Each item should include one of `orderId` or `clientOid`.

## Error Message Shape

Nested errors should point to the exact path that failed.

Examples:

```text
orderList[0].size must be a positive number
orderList[1].orderType must be one of MARKET, LIMIT
one of orderIdList[2].orderId, orderIdList[2].clientOid is required
```

The CLI should continue to aggregate validation failures into one `CliError` message before request construction.

## Generated Reference Impact

The command catalog exposes nested validation rules. The human-readable command reference summarizes nested rules without rendering large schema blocks.

Suggested generated summary examples:

```text
orderList[] required; each item requires side, orderType, size
orderIdList[] required; each item requires one of orderId, clientOid
orderList[] positive: size, price; enum: side, orderType
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
