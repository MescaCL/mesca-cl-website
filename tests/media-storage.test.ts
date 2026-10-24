import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilename, isR2Configured } from '../lib/media-storage';

test('sanitizeFilename replaces unsafe characters', () => {
  assert.equal(sanitizeFilename('my photo (1).PNG'), 'my_photo__1_.PNG');
  assert.equal(sanitizeFilename('cover-image.v2.jpg'), 'cover-image.v2.jpg');
});

test('isR2Configured is false without all R2 variables', () => {
  delete process.env.R2_ACCOUNT_ID;
  delete process.env.R2_ACCESS_KEY_ID;
  delete process.env.R2_SECRET_ACCESS_KEY;
  delete process.env.R2_BUCKET_NAME;
  assert.equal(isR2Configured(), false);
});