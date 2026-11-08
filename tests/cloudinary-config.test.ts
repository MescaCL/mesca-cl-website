import { test } from 'node:test';
import assert from 'node:assert/strict';

test('isCloudinaryConfigured returns true when all Cloudinary vars are set', async () => {
  process.env.CLOUDINARY_CLOUD_NAME = 'dummy-cloud-name';
  process.env.CLOUDINARY_API_KEY = 'dummy-api-key';
  process.env.CLOUDINARY_API_SECRET = 'dummy-api-secret';
  const { isCloudinaryConfigured } = await import('../lib/media-storage');
  assert.equal(isCloudinaryConfigured(), true);
});

test('isCloudinaryConfigured returns false when Cloudinary vars are missing', async () => {
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
  const { isCloudinaryConfigured } = await import('../lib/media-storage');
  assert.equal(isCloudinaryConfigured(), false);
});