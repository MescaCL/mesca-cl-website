import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SESSION_MAX_AGE, sessionCookieOptions, formatSessionDuration } from '../lib/session';

test('default session max age is four hours', () => {
  assert.equal(SESSION_MAX_AGE, 14400);
});

test('session cookie uses the same max age', () => {
  assert.equal(sessionCookieOptions().maxAge, 14400);
  assert.equal(sessionCookieOptions(300).maxAge, 300);
});

test('formats four hours without rounding to days', () => {
  assert.equal(formatSessionDuration(14400), '4 hours');
});

test('formats mixed hours and minutes accurately', () => {
  assert.equal(formatSessionDuration(5400), '1 hour 30 minutes');
});