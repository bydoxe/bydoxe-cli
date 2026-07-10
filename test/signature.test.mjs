import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  signRestRequest,
  signWebSocketLogin,
} from '../dist/auth/signature.js';

function hmacSha256Base64(secretKey, message) {
  return createHmac('sha256', secretKey).update(message).digest('base64');
}

test('REST signature includes GET query string with question mark', () => {
  const timestamp = '1659076670000';
  const method = 'GET';
  const requestPath = '/api/v1/spot/account/assets';
  const queryString = 'coin=USDT';
  const secretKey = 'secret';
  const message = `${timestamp}${method}${requestPath}?${queryString}`;

  const signature = signRestRequest({
    timestamp,
    method,
    requestPath,
    queryString,
    secretKey,
  });

  assert.equal(signature, hmacSha256Base64(secretKey, message));
});

test('WebSocket login signature uses the verify path', () => {
  const timestamp = '1659076670000';
  const secretKey = 'secret';
  const message = `${timestamp}GET/user/verify`;

  const signature = signWebSocketLogin({ timestamp, secretKey });

  assert.equal(signature, hmacSha256Base64(secretKey, message));
});
