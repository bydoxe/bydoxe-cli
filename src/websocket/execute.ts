import { CliError } from '../errors/cli-error.js';
import {
  redactWebSocketPreview,
  type WebSocketPreview,
} from '../commands/websocket.js';

export interface WebSocketLiveOptions {
  maxMessages: number;
  timeoutMs: number;
}

export interface WebSocketLiveResult {
  live: true;
  command: string;
  connection: WebSocketPreview['connection'];
  sent: unknown;
  received: unknown[];
  closed: {
    code?: number;
    reason: string;
  };
}

export interface WebSocketConnection {
  addEventListener(type: 'open', listener: () => void): void;
  addEventListener(type: 'message', listener: (event: MessageEventLike) => void): void;
  addEventListener(type: 'error', listener: (event: unknown) => void): void;
  addEventListener(type: 'close', listener: (event: CloseEventLike) => void): void;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface MessageEventLike {
  data: unknown;
}

export interface CloseEventLike {
  code?: number;
  reason?: string;
}

export type WebSocketFactory = (url: string) => WebSocketConnection;
export type PrivateLoginAcknowledgementPredicate = (message: unknown) => boolean;

export async function executePublicWebSocket(
  preview: WebSocketPreview,
  options: WebSocketLiveOptions,
  factory: WebSocketFactory = createNativeWebSocket,
): Promise<WebSocketLiveResult> {
  if (preview.connection.scope !== 'public') {
    throw new CliError('Live WebSocket execution is only supported for public streams.');
  }

  assertLiveOptions(options);

  const socket = factory(preview.connection.url);
  const received: unknown[] = [];
  const sent = preview.message;
  let settled = false;

  return await new Promise<WebSocketLiveResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      finish({
        code: 1000,
        reason: 'timeout reached',
      });
    }, options.timeoutMs);

    function finish(closed: WebSocketLiveResult['closed']): void {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      socket.close(closed.code, closed.reason);
      resolve({
        live: true,
        command: preview.command,
        connection: preview.connection,
        sent,
        received,
        closed,
      });
    }

    socket.addEventListener('open', () => {
      socket.send(encodeMessage(sent));
    });

    socket.addEventListener('message', (event) => {
      received.push(decodeMessage(event.data));

      if (received.length >= options.maxMessages) {
        finish({
          code: 1000,
          reason: 'max messages reached',
        });
      }
    });

    socket.addEventListener('close', (event) => {
      finish({
        code: event.code,
        reason: event.reason || 'connection closed',
      });
    });

    socket.addEventListener('error', (event) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new CliError(`WebSocket error: ${String(event)}`));
    });
  });
}

export async function executePrivateReadOnlyWebSocket(
  loginPreview: WebSocketPreview,
  readOnlyPreview: WebSocketPreview,
  options: WebSocketLiveOptions,
  factory: WebSocketFactory = createNativeWebSocket,
  isLoginAcknowledged: PrivateLoginAcknowledgementPredicate = defaultIsPrivateLoginAcknowledged,
): Promise<WebSocketLiveResult> {
  assertPrivateLoginPreview(loginPreview);
  assertPrivateReadOnlyPreview(readOnlyPreview);
  assertLiveOptions(options);

  const socket = factory(readOnlyPreview.connection.url);
  const received: unknown[] = [];
  const sent = {
    login: redactWebSocketPreview(loginPreview).message,
    message: readOnlyPreview.message,
  };
  let settled = false;
  let loginAcknowledged = false;

  return await new Promise<WebSocketLiveResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      finish({
        code: 1000,
        reason: 'timeout reached',
      });
    }, options.timeoutMs);

    function finish(closed: WebSocketLiveResult['closed']): void {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      socket.close(closed.code, closed.reason);
      resolve({
        live: true,
        command: readOnlyPreview.command,
        connection: readOnlyPreview.connection,
        sent,
        received,
        closed,
      });
    }

    socket.addEventListener('open', () => {
      socket.send(encodeMessage(loginPreview.message));
    });

    socket.addEventListener('message', (event) => {
      const message = decodeMessage(event.data);
      received.push(message);

      if (!loginAcknowledged && isLoginAcknowledged(message)) {
        loginAcknowledged = true;
        socket.send(encodeMessage(readOnlyPreview.message));
      }

      if (received.length >= options.maxMessages) {
        finish({
          code: 1000,
          reason: 'max messages reached',
        });
      }
    });

    socket.addEventListener('close', (event) => {
      finish({
        code: event.code,
        reason: event.reason || 'connection closed',
      });
    });

    socket.addEventListener('error', (event) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new CliError(`WebSocket error: ${String(event)}`));
    });
  });
}

function assertLiveOptions(options: WebSocketLiveOptions): void {
  if (options.maxMessages < 1) {
    throw new CliError('--max-messages must be greater than 0.');
  }

  if (options.timeoutMs < 1) {
    throw new CliError('--timeout-ms must be greater than 0.');
  }
}

function assertPrivateLoginPreview(preview: WebSocketPreview): void {
  if (preview.connection.scope !== 'private') {
    throw new CliError('Private WebSocket login execution requires a private connection preview.');
  }

  if (getMessageOp(preview.message) !== 'login') {
    throw new CliError('Private WebSocket read-only execution requires a login preview first.');
  }
}

function assertPrivateReadOnlyPreview(preview: WebSocketPreview): void {
  if (preview.connection.scope !== 'private') {
    throw new CliError('Private WebSocket read-only execution requires a private connection preview.');
  }

  const op = getMessageOp(preview.message);
  if (op !== 'subscribe' && op !== 'unsubscribe') {
    throw new CliError('Private WebSocket read-only execution only supports subscribe and unsubscribe messages.');
  }
}

function createNativeWebSocket(url: string): WebSocketConnection {
  const NativeWebSocket = (
    globalThis as {
      WebSocket?: new (url: string) => WebSocketConnection;
    }
  ).WebSocket;

  if (!NativeWebSocket) {
    throw new CliError(
      'This Node.js runtime does not provide WebSocket. Use a runtime with WebSocket support.',
    );
  }

  return new NativeWebSocket(url);
}

function encodeMessage(message: unknown): string {
  return typeof message === 'string' ? message : JSON.stringify(message);
}

function decodeMessage(data: unknown): unknown {
  const text = String(data);

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getMessageOp(message: unknown): string | undefined {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return undefined;
  }

  const op = (message as Record<string, unknown>).op;
  return typeof op === 'string' ? op.toLowerCase() : undefined;
}

function defaultIsPrivateLoginAcknowledged(message: unknown): boolean {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return false;
  }

  const candidate = message as Record<string, unknown>;
  const eventName = String(candidate.op ?? candidate.event ?? candidate.action ?? '').toLowerCase();
  if (!eventName.includes('login')) return false;

  const success = candidate.success;
  if (success !== undefined && success !== true && success !== 'true') return false;

  const code = candidate.code;
  return code === undefined || code === 0 || code === '0';
}
