import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateProfile } from '../lib/data';
import { resetDatabaseClient } from '../lib/db';

async function ensureProfileTable(): Promise<void> {
  const conn = await (await import('../lib/db')).getDatabase();
  try {
    await conn.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        brand_name TEXT,
        full_name TEXT,
        short_bio TEXT,
        full_bio TEXT,
        headline TEXT,
        supporting_statement TEXT,
        email TEXT,
        phone_number TEXT,
        whatsapp_number TEXT,
        call_button_label TEXT,
        whatsapp_button_label TEXT,
        call_button_visible INTEGER,
        whatsapp_button_visible INTEGER,
        whatsapp_preset_message TEXT,
        profile_image_url TEXT,
        profile_image_alt TEXT,
        hero_eyebrow TEXT,
        hero_primary_cta_label TEXT,
        hero_primary_cta_url TEXT,
        hero_secondary_cta_label TEXT,
        hero_secondary_cta_url TEXT,
        location TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } finally {
    conn.close();
  }
}

ensureProfileTable();

test('updateProfile writes submitted values and returns the updated row', async () => {
  const created = await updateProfile({
    full_name: 'Test User',
    headline: 'Test Headline',
    short_bio: 'Test Short Bio',
    call_button_visible: 1,
  });
  assert.ok(created, 'updateProfile should return the updated row');
  assert.equal(created!.full_name, 'Test User');
  assert.equal(created!.headline, 'Test Headline');
  assert.equal(created!.short_bio, 'Test Short Bio');
  assert.equal(created!.call_button_visible, 1);
  assert.ok(created!.updated_at, 'updated_at should be set');
});

test('updateProfile preserves empty strings instead of converting them to null', async () => {
  const created = await updateProfile({
    profile_image_alt: '',
    email: '',
  });
  assert.ok(created, 'updateProfile should return the updated row');
  assert.equal(created!.profile_image_alt, '');
  assert.equal(created!.email, '');
});

test('updateProfile overwrites previous values correctly', async () => {
  const updated = await updateProfile({
    full_name: 'Updated Name',
    short_bio: 'Updated Short Bio',
  });
  assert.ok(updated, 'updateProfile should return the updated row');
  assert.equal(updated!.full_name, 'Updated Name');
  assert.equal(updated!.short_bio, 'Updated Short Bio');
});

test('updateProfile sets profile_image_url and profile_image_alt together', async () => {
  const created = await updateProfile({
    profile_image_url: 'https://example.com/image.jpg',
    profile_image_alt: 'Test photo',
  });
  assert.ok(created, 'updateProfile should return the updated row');
  assert.equal(created!.profile_image_url, 'https://example.com/image.jpg');
  assert.equal(created!.profile_image_alt, 'Test photo');
});

test('updateProfile replaces an existing profile_image_url with a new Cloudinary URL', async () => {
  await updateProfile({
    profile_image_url: 'https://example.com/old-image.jpg',
    profile_image_alt: 'Old photo',
  });
  const replaced = await updateProfile({
    profile_image_url: 'https://example.com/new-image.jpg',
    profile_image_alt: 'New photo',
  });
  assert.ok(replaced, 'updateProfile should return the updated row');
  assert.equal(replaced!.profile_image_url, 'https://example.com/new-image.jpg');
  assert.equal(replaced!.profile_image_alt, 'New photo');
});

test('updateProfile clears profile_image_url when null is explicitly supplied', async () => {
  await updateProfile({
    profile_image_url: 'https://example.com/image.jpg',
    profile_image_alt: 'Test photo',
  });
  const cleared = await updateProfile({
    profile_image_url: null,
    profile_image_alt: null,
  });
  assert.ok(cleared, 'updateProfile should return the updated row');
  assert.equal(cleared!.profile_image_url, null);
  assert.equal(cleared!.profile_image_alt, null);
});

test('updateProfile updates the existing profile row when one already exists', async () => {
  const updated = await updateProfile({
    headline: 'Updated Headline',
  });
  assert.ok(updated, 'updateProfile should return the updated row');
  assert.equal(updated!.headline, 'Updated Headline');
});
