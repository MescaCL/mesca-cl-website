import { getProfile, updateProfile } from '@/lib/data';
import {
  getProjects, createProject, updateProject, deleteProject,
  getPosts, createPost, updatePost, deletePost,
  getMilestones, getNowItems,
} from '@/lib/data/content';
import { generateId } from '@/lib/db/index';

async function safe(fn: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await fn();
    console.log(`✅ ${label}`);
  } catch (e) {
    console.error(`❌ ${label}: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }
}

async function testProfilePhotoUploadAndReplacement(): Promise<void> {
  const profile = await getProfile();
  if (!profile) throw new Error('No profile found');

  const uploaded = await updateProfile({
    profile_image_url: 'https://example.com/uploads/test-profile-photo.jpg',
    profile_image_alt: 'Test profile photo',
  });
  if (!uploaded || uploaded.profile_image_url !== 'https://example.com/uploads/test-profile-photo.jpg') {
    throw new Error('Upload: profile_image_url not saved correctly');
  }
  if (uploaded.profile_image_alt !== 'Test profile photo') {
    throw new Error('Upload: profile_image_alt not saved correctly');
  }

  const replaced = await updateProfile({
    profile_image_url: 'https://res.cloudinary.com/demo/image/upload/test-profile-photo-v2.jpg',
    profile_image_alt: 'Updated profile photo',
  });
  if (!replaced || replaced.profile_image_url !== 'https://res.cloudinary.com/demo/image/upload/test-profile-photo-v2.jpg') {
    throw new Error('Replace: profile_image_url not updated correctly');
  }
  if (replaced.profile_image_alt !== 'Updated profile photo') {
    throw new Error('Replace: profile_image_alt not updated correctly');
  }

  console.log(`   Photo URL: ${replaced.profile_image_url}`);
  console.log(`   Photo Alt: ${replaced.profile_image_alt}`);
}

async function testProfilePhotoRemoval(): Promise<void> {
  const removed = await updateProfile({
    profile_image_url: null,
    profile_image_alt: '',
  });
  if (!removed) throw new Error('Remove: updateProfile returned null');
  if (removed.profile_image_url !== null) {
    throw new Error('Remove: profile_image_url not cleared (expected null, got ' + removed.profile_image_url + ')');
  }
  if (removed.profile_image_alt !== '') {
    throw new Error('Remove: profile_image_alt not cleared (expected empty string, got ' + removed.profile_image_alt + ')');
  }

  const after = await getProfile();
  if (!after) throw new Error('Remove: could not read profile after removal');
  if (after.profile_image_url !== null) {
    throw new Error('Remove: profile_image_url not persisted to database');
  }

  console.log(`   After removal - URL: ${after.profile_image_url}, Alt: '${after.profile_image_alt}'`);
}

async function testHomepageTextEditing(): Promise<void> {
  const original = await getProfile();
  if (!original) throw new Error('No profile found for homepage text test');

  const updated = await updateProfile({
    brand_name: 'Mesca CL Test Brand',
    headline: 'Test headline for homepage verification',
    supporting_statement: 'Test supporting statement for homepage',
    short_bio: 'Test short bio',
    hero_eyebrow: 'Test eyebrow',
    hero_primary_cta_label: 'Test CTA Label',
    hero_primary_cta_url: '/test-page',
    hero_secondary_cta_label: 'Test Secondary CTA',
    hero_secondary_cta_url: '/test-page-2',
  });
  if (!updated) throw new Error('Homepage text: updateProfile returned null');

  if (updated.brand_name !== 'Mesca CL Test Brand') throw new Error(`brand_name not saved: ${updated.brand_name}`);
  if (updated.headline !== 'Test headline for homepage verification') throw new Error(`headline not saved: ${updated.headline}`);
  if (updated.supporting_statement !== 'Test supporting statement for homepage') throw new Error(`supporting_statement not saved: ${updated.supporting_statement}`);
  if (updated.hero_eyebrow !== 'Test eyebrow') throw new Error(`hero_eyebrow not saved: ${updated.hero_eyebrow}`);

  const persisted = await getProfile();
  if (!persisted) throw new Error('Homepage text: could not read profile after update');
  if (persisted.headline !== 'Test headline for homepage verification') {
    throw new Error('Homepage text: headline not persisted to database');
  }

  await updateProfile({
    brand_name: original.brand_name,
    headline: original.headline,
    supporting_statement: original.supporting_statement,
    short_bio: original.short_bio,
    hero_eyebrow: original.hero_eyebrow,
    hero_primary_cta_label: original.hero_primary_cta_label,
    hero_primary_cta_url: original.hero_primary_cta_url,
    hero_secondary_cta_label: original.hero_secondary_cta_label,
    hero_secondary_cta_url: original.hero_secondary_cta_url,
  });

  console.log(`   Brand: ${persisted.brand_name}`);
  console.log(`   Headline: ${persisted.headline}`);
  console.log(`   Hero eyebrow: ${persisted.hero_eyebrow}`);
}

async function testProjectCrud(): Promise<void> {
  const projectData = {
    title: 'Test Project for CMS Verification',
    slug: 'test-project-cms-verification',
    summary: 'A test project for verifying CMS functionality',
    description: 'Full description of test project',
    category: 'web-development',
    technologies: 'Next.js, TypeScript, Turso',
    status: 'live',
    cover_image_url: 'https://example.com/cover.jpg',
    live_url: 'https://example.com/project',
    repository_url: 'https://github.com/mesca-cl/test-project',
    featured: 0,
    is_published: 1,
    seo_title: 'Test Project - Mesca CL',
    seo_description: 'A test project for CMS verification',
  };

  const created = await createProject(projectData);
  if (!created || !created.id) throw new Error('Project: create returned no id');
  if (created.title !== 'Test Project for CMS Verification') {
    throw new Error(`Project: title not saved correctly: ${created.title}`);
  }
  console.log(`   Created project ID: ${created.id}`);

  const updated = await updateProject(created.id, {
    title: 'Updated Test Project',
    status: 'archived',
    is_published: 0,
  });
  if (!updated) throw new Error('Project: update returned null');
  if (updated.title !== 'Updated Test Project') throw new Error(`Project: title not updated: ${updated.title}`);
  if (updated.is_published !== 0) throw new Error(`Project: is_published not converted to number: ${updated.is_published}`);

  const allProjects = await getProjects({});
  const found = allProjects.find((p) => p.id === created.id);
  if (!found) throw new Error('Project: updated project not found in list');
  if (found.title !== 'Updated Test Project') throw new Error('Project: title not persisted');

  const deleted = await deleteProject(created.id);
  if (!deleted) throw new Error('Project: delete returned false');

  const afterDelete = await getProjects({});
  const stillExists = afterDelete.find((p) => p.id === created.id);
  if (stillExists) throw new Error('Project: still exists after deletion');

  console.log(`   Project CRUD: Create→Update→Delete all verified`);
}

async function testPostCrud(): Promise<void> {
  const postData = {
    title: 'Test Article for CMS Verification',
    slug: 'test-article-cms-verification',
    excerpt: 'A test article for verifying CMS functionality',
    content: '## Introduction\n\nThis is a test article content.\n\n- Item 1\n- Item 2\n\n> A blockquote for testing',
    post_type: 'article',
    status: 'published',
    category: 'technology',
    tags: 'test, cms, verification',
    reading_time: 3,
    featured: 0,
    cover_image_url: 'https://example.com/article-cover.jpg',
    seo_title: 'Test Article - Mesca CL',
    seo_description: 'A test article for CMS verification',
  };

  const created = await createPost(postData);
  if (!created || !created.id) throw new Error('Post: create returned no id');
  if (created.title !== 'Test Article for CMS Verification') {
    throw new Error(`Post: title not saved correctly: ${created.title}`);
  }
  console.log(`   Created post ID: ${created.id}`);

  const unpublished = await updatePost(created.id, { status: 'draft' });
  if (!unpublished) throw new Error('Post: unpublish returned null');
  if (unpublished.status !== 'draft') throw new Error(`Post: status not updated to draft: ${unpublished.status}`);

  const published = await updatePost(created.id, { status: 'published' });
  if (!published) throw new Error('Post: publish returned null');
  if (published.status !== 'published') throw new Error(`Post: status not updated to published: ${published.status}`);

  const allPosts = await getPosts({});
  const found = allPosts.find((p) => p.id === created.id);
  if (!found) throw new Error('Post: updated post not found in list');
  if (found.status !== 'published') throw new Error('Post: status not persisted');

  const deleted = await deletePost(created.id);
  if (!deleted) throw new Error('Post: delete returned false');

  const afterDelete = await getPosts({});
  const stillExists = afterDelete.find((p) => p.id === created.id);
  if (stillExists) throw new Error('Post: still exists after deletion');

  console.log(`   Post CRUD: Create→Update→Publish→Delete all verified`);
}

async function testMediaManagement(): Promise<void> {
  const { getDatabase } = await import('@/lib/db/index');
  const db = await getDatabase();
  try {
    const id = generateId();
    await db.prepare(
      `INSERT INTO media_files (id, filename, original_name, file_path, file_url, file_type, file_size, alt_text, caption, description, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id, 'test-image.jpg', 'test-image.jpg', 'uploads/test-image.jpg',
      'https://example.com/uploads/test-image.jpg', 'image/jpeg', 1024,
      'Test image alt', 'Test caption', 'Test description', null
    );

    const row = await db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as any;
    if (!row) throw new Error('Media: inserted record not found');
    if (row.file_url !== 'https://example.com/uploads/test-image.jpg') {
      throw new Error(`Media: file_url not saved: ${row.file_url}`);
    }
    if (row.alt_text !== 'Test image alt') {
      throw new Error(`Media: alt_text not saved: ${row.alt_text}`);
    }

    await db.prepare(
      `UPDATE media_files SET alt_text = ?, file_url = ? WHERE id = ?`
    ).run('Updated alt text', 'https://example.com/uploads/test-image-v2.jpg', id);

    const updatedRow = await db.prepare('SELECT * FROM media_files WHERE id = ?').get(id) as any;
    if (updatedRow.alt_text !== 'Updated alt text') {
      throw new Error(`Media: alt_text not updated: ${updatedRow.alt_text}`);
    }
    if (updatedRow.file_url !== 'https://example.com/uploads/test-image-v2.jpg') {
      throw new Error(`Media: file_url not updated: ${updatedRow.file_url}`);
    }

    const result = await db.prepare('DELETE FROM media_files WHERE id = ?').run(id);
    if (result.changes !== 1) throw new Error(`Media: delete affected ${result.changes} rows`);

    const afterDelete = await db.prepare('SELECT * FROM media_files WHERE id = ?').get(id);
    if (afterDelete) throw new Error('Media: record still exists after deletion');

    console.log(`   Media CRUD: Create→Update→Delete all verified`);
  } finally {
    db.close();
  }
}

export async function runCmsVerification(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('END-TO-END CMS VERIFICATION TESTS');
  console.log('═══════════════════════════════════════════════════════════════════');

  await safe(testProfilePhotoUploadAndReplacement, 'Profile photo upload and replacement');
  await safe(testProfilePhotoRemoval, 'Profile photo removal and fallback');
  await safe(testHomepageTextEditing, 'Homepage text editing and persistence');
  await safe(testProjectCrud, 'Project CRUD (create, update, delete)');
  await safe(testPostCrud, 'Post CRUD (create, publish, unpublish, delete)');

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('ALL CMS VERIFICATION TESTS PASSED');
  console.log('═══════════════════════════════════════════════════════════════════');
}

console.log('═══════════════════════════════════════════════════════════════════');
console.log('END-TO-END CMS VERIFICATION TESTS');
console.log('═══════════════════════════════════════════════════════════════════');

void (async () => {
  await runCmsVerification();
})();