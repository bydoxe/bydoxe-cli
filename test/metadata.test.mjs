import assert from 'node:assert/strict';
import test from 'node:test';
import { PRIVATE_REST_COMMANDS } from '../dist/commands/private-rest.js';
import { PUBLIC_REST_COMMANDS } from '../dist/commands/public-rest.js';
import { WEBSOCKET_COMMANDS } from '../dist/commands/websocket.js';
import { WRITE_REST_COMMANDS } from '../dist/commands/write-rest.js';

const allCommands = [
  ...PUBLIC_REST_COMMANDS,
  ...PRIVATE_REST_COMMANDS,
  ...WRITE_REST_COMMANDS,
  ...WEBSOCKET_COMMANDS,
];

test('all command registry entries expose metadata', () => {
  assert.ok(allCommands.length > 0);

  for (const command of allCommands) {
    assert.match(command.auth, /^(public|private)$/);
    assert.match(command.riskLevel, /^(low|medium|high)$/);
    assert.match(command.parameterMode, /^(none|query|body|message)$/);
    assert.ok(Array.isArray(command.requiredParams));
    assert.ok(Array.isArray(command.optionalParams));
  }
});

test('write and trade-capable websocket commands are high risk', () => {
  for (const command of WRITE_REST_COMMANDS) {
    assert.equal(command.auth, 'private');
    assert.equal(command.riskLevel, 'high');
    assert.equal(command.parameterMode, 'body');
  }

  const privateSpotTrade = WEBSOCKET_COMMANDS.find(
    (command) => command.command.join(' ') === 'websocket private spot trade',
  );

  assert.ok(privateSpotTrade);
  assert.equal(privateSpotTrade.auth, 'private');
  assert.equal(privateSpotTrade.riskLevel, 'high');
  assert.equal(privateSpotTrade.parameterMode, 'message');
});

test('public read commands stay low risk', () => {
  for (const command of PUBLIC_REST_COMMANDS) {
    assert.equal(command.auth, 'public');
    assert.equal(command.riskLevel, 'low');
  }
});

test('private read commands expose parameter hints for common lookups', () => {
  const fundingAssets = PRIVATE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'account funding-assets',
  );
  const singlePosition = PRIVATE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'future position single',
  );
  const followerSettings = PRIVATE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'copytrading follower settings',
  );

  assert.ok(fundingAssets);
  assert.deepEqual(fundingAssets.optionalParams, ['coin']);
  assert.ok(singlePosition);
  assert.deepEqual(singlePosition.requiredParams, ['symbol']);
  assert.ok(followerSettings);
  assert.deepEqual(followerSettings.requiredParams, ['traderId']);
});

test('write commands expose body parameter hints for risky actions', () => {
  const spotPlaceOrder = WRITE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'spot trade place-order',
  );
  const futuresSetLeverage = WRITE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'future account set-leverage',
  );
  const cancelFollow = WRITE_REST_COMMANDS.find(
    (command) => command.command.join(' ') === 'copytrading follower cancel-follow',
  );

  assert.ok(spotPlaceOrder);
  assert.deepEqual(spotPlaceOrder.requiredParams, [
    'symbol',
    'orderType',
    'tradeType',
    'amount',
  ]);
  assert.ok(futuresSetLeverage);
  assert.deepEqual(futuresSetLeverage.requiredParams, ['symbol']);
  assert.ok(cancelFollow);
  assert.deepEqual(cancelFollow.requiredParams, ['traderId']);
});
