import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateToken, verifyToken } from '../lib/auth';

test('JWT expiry matches the four-hour session lifetime', () => {
  const token = generateToken({
    userId: 'user-1',
    email: 'admin@example.com',
    role: 'admin',
    tokenVersion: 0,
  });

const decoded = verifyToken(token) as { exp: number; iat: number } | null;
  assert.ok(decoded);
  assert.equal(decoded.exp - decoded.iat, 14400);
});