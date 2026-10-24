import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireCsrf } from '../lib/api-guard';

test('requireCsrf allows same-origin POST', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  const req = new Request('http://localhost:3000/api/x', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', host: 'localhost:3000' },
  });
  assert.equal(requireCsrf(req), null);
});

test('requireCsrf rejects cross-origin POST', () => {
  process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
  const req = new Request('http://localhost:3000/api/x', {
    method: 'POST',
    headers: { origin: 'http://evil.example', host: 'localhost:3000' },
  });
  const res = requireCsrf(req);
  assert.ok(res);
  assert.equal(res.status, 403);
});

test('requireCsrf allows GET', () => {
  const req = new Request('http://localhost:3000/api/x', { method: 'GET' });
  assert.equal(requireCsrf(req), null);
});