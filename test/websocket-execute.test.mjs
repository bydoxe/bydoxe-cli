import assert from 'node:assert/strict';
import test from 'node:test';
import { executePublicWebSocket } from '../dist/websocket/execute.js';

test('public WebSocket live execution sends preview message and closes at max messages', async () => {
  const sockets = [];
  const resultPromise = executePublicWebSocket(
    {
      dryRun: true,
      command: 'bydoxe websocket public subscribe',
      connection: {
        url: 'wss://example.test/v1/ws/public',
        scope: 'public',
      },
      message: {
        op: 'subscribe',
        args: [
          {
            instType: 'SPOT',
            channel: 'ticker',
            instId: 'BTCUSDT',
          },
        ],
      },
    },
    {
      maxMessages: 2,
      timeoutMs: 1000,
    },
    (url) => {
      const socket = new MockWebSocket(url);
      sockets.push(socket);
      return socket;
    },
  );

  const socket = sockets[0];
  assert.equal(socket.url, 'wss://example.test/v1/ws/public');

  socket.emitOpen();
  assert.deepEqual(JSON.parse(socket.sent[0]), {
    op: 'subscribe',
    args: [
      {
        instType: 'SPOT',
        channel: 'ticker',
        instId: 'BTCUSDT',
      },
    ],
  });

  socket.emitMessage('{"event":"subscribed"}');
  socket.emitMessage('{"data":{"symbol":"BTCUSDT"}}');

  const result = await resultPromise;
  assert.deepEqual(result, {
    live: true,
    command: 'bydoxe websocket public subscribe',
    connection: {
      url: 'wss://example.test/v1/ws/public',
      scope: 'public',
    },
    sent: {
      op: 'subscribe',
      args: [
        {
          instType: 'SPOT',
          channel: 'ticker',
          instId: 'BTCUSDT',
        },
      ],
    },
    received: [
      {
        event: 'subscribed',
      },
      {
        data: {
          symbol: 'BTCUSDT',
        },
      },
    ],
    closed: {
      code: 1000,
      reason: 'max messages reached',
    },
  });
  assert.deepEqual(socket.closed, {
    code: 1000,
    reason: 'max messages reached',
  });
});

test('public WebSocket ping sends plain ping text', async () => {
  const sockets = [];
  const resultPromise = executePublicWebSocket(
    {
      dryRun: true,
      command: 'bydoxe websocket public ping',
      connection: {
        url: 'wss://example.test/v1/ws/public',
        scope: 'public',
      },
      message: 'ping',
    },
    {
      maxMessages: 1,
      timeoutMs: 1000,
    },
    (url) => {
      const socket = new MockWebSocket(url);
      sockets.push(socket);
      return socket;
    },
  );

  const socket = sockets[0];
  socket.emitOpen();
  assert.equal(socket.sent[0], 'ping');
  socket.emitMessage('pong');

  const result = await resultPromise;
  assert.deepEqual(result.received, ['pong']);
});

test('private WebSocket live execution is rejected', async () => {
  await assert.rejects(
    () =>
      executePublicWebSocket(
        {
          dryRun: true,
          command: 'bydoxe websocket private subscribe',
          connection: {
            url: 'wss://example.test/v1/ws/private',
            scope: 'private',
          },
          message: {
            op: 'subscribe',
            args: [],
          },
        },
        {
          maxMessages: 1,
          timeoutMs: 1000,
        },
        () => new MockWebSocket('wss://example.test/v1/ws/private'),
      ),
    /only supported for public streams/,
  );
});

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.sent = [];
    this.listeners = new Map();
    this.closed = undefined;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  send(data) {
    this.sent.push(data);
  }

  close(code, reason) {
    this.closed = { code, reason };
  }

  emitOpen() {
    this.emit('open', undefined);
  }

  emitMessage(data) {
    this.emit('message', { data });
  }

  emit(type, event) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}
