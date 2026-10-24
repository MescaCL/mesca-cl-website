/* eslint-disable no-console */
/**
 * End-to-end smoke test against a running server.
 *
 * Usage:  node scripts/e2e-check.js [baseUrl]
 * Default baseUrl: http://localhost:3111
 */
const BASE = process.argv[2] || 'http://localhost:3111';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const PASSWORD = process.env.ADMIN_PASSWORD;
const ORIGIN = new URL(BASE).origin;

let passed = 0;
let failed = 0;

function check(label, condition, detail) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` -> ${detail}` : ''}`);
  }
}

async function main() {
  console.log(`Mesca CL end-to-end check against ${BASE}\n`);

  /* ---------------------------------------------------------------- */
  console.log('Public routes');
  const publicRoutes = [
    '/', '/projects', '/blog', '/journey', '/about', '/contact',
    '/admin/login', '/sitemap.xml', '/robots.txt',
  ];
  for (const route of publicRoutes) {
    const res = await fetch(`${BASE}${route}`);
    check(`GET ${route} -> 200`, res.status === 200, `got ${res.status}`);
  }

  const notFound = await fetch(`${BASE}/definitely-not-a-real-page`);
  check('GET unknown page -> 404', notFound.status === 404, `got ${notFound.status}`);

  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check('robots.txt blocks /admin', robots.includes('/admin'), robots.slice(0, 80));

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check('sitemap.xml is a urlset', sitemap.includes('<urlset'), sitemap.slice(0, 60));

  /* ---------------------------------------------------------------- */
  console.log('\nAdmin API protection');
  const unauth = await fetch(`${BASE}/api/admin/projects`);
  check('GET /api/admin/projects without session -> 401', unauth.status === 401, `got ${unauth.status}`);

  const badLogin = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ email: EMAIL, password: 'wrong-password-1' }),
  });
  check('login with wrong password -> 401', badLogin.status === 401, `got ${badLogin.status}`);

  const invalidLogin = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ email: 'not-an-email', password: 'x' }),
  });
  check('login with invalid payload -> 422', invalidLogin.status === 422, `got ${invalidLogin.status}`);

  /* ---------------------------------------------------------------- */
  const csrfRejected = await fetch(`${BASE}/api/admin/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://evil.example' },
    body: JSON.stringify({ title: 'CSRF', slug: 'csrf-test' }),
  });
  check('cross-origin state-changing request -> 403', csrfRejected.status === 403, `got ${csrfRejected.status}`);

  /* ---------------------------------------------------------------- */
  console.log('\nAuthenticated admin CRUD');
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  check('login with correct password -> 200', login.status === 200, `got ${login.status}`);

  const cookie = login.headers.get('set-cookie') || '';
  check('session cookie is set', cookie.includes('mesca_session'), cookie.slice(0, 60));
  check('session cookie is HttpOnly', cookie.includes('HttpOnly'));

  const authCookie = cookie.split(';')[0];
  const authHeaders = { 'Content-Type': 'application/json', Origin: ORIGIN, Cookie: authCookie };

  const listRes = await fetch(`${BASE}/api/admin/projects`, { headers: { Cookie: authCookie, Origin: ORIGIN } });
  const listJson = await listRes.json();
  check('GET /api/admin/projects with session -> 200', listRes.status === 200, `got ${listRes.status}`);
  check('projects list is an array', Array.isArray(listJson.data));

  const created = await fetch(`${BASE}/api/admin/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Smoke Test Project',
      slug: 'smoke-test-project',
      summary: 'Created by the e2e check.',
      description: 'First line.\nSecond line.',
      status: 'in_progress',
      category: 'AI & Automation',
      technologies: 'Next.js, TypeScript',
      is_published: true,
      featured: true,
      live_url: 'https://example.com',
    }),
  });
  const createdJson = await created.json();
  check('POST /api/admin/projects -> 201', created.status === 201, `got ${created.status} ${JSON.stringify(createdJson)}`);
  const projectId = createdJson?.data?.id;

  const updated = await fetch(`${BASE}/api/admin/projects`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      id: projectId,
      title: 'Smoke Test Project v2',
      slug: 'smoke-test-project',
      status: 'live',
      is_published: true,
      summary: 'Updated by the e2e check.',
    }),
  });
  const updatedJson = await updated.json();
  check('PUT /api/admin/projects -> 200', updated.status === 200, `got ${updated.status}`);
  check('update persisted the new title', updatedJson?.data?.title === 'Smoke Test Project v2', updatedJson?.data?.title);

  const invalidSlug = await fetch(`${BASE}/api/admin/projects`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Bad', slug: 'Not A Slug!', status: 'idea' }),
  });
  check('POST with invalid slug -> 422', invalidSlug.status === 422, `got ${invalidSlug.status}`);

  /* The project must now be visible on the public site. */
  const publicProject = await fetch(`${BASE}/projects/smoke-test-project`);
  check('published project appears on the public site', publicProject.status === 200, `got ${publicProject.status}`);

  const deleted = await fetch(`${BASE}/api/admin/projects?id=${encodeURIComponent(projectId)}`, {
    method: 'DELETE',
    headers: { Cookie: authCookie, Origin: ORIGIN },
  });
  check('DELETE /api/admin/projects -> 200', deleted.status === 200, `got ${deleted.status}`);

  const gone = await fetch(`${BASE}/projects/smoke-test-project`);
  check('deleted project returns 404 publicly', gone.status === 404, `got ${gone.status}`);

  /* ---------------------------------------------------------------- */
  console.log('\nMessages inbox');
  const messagesRes = await fetch(`${BASE}/api/admin/contacts`, { headers: { Cookie: authCookie, Origin: ORIGIN } });
  const messagesJson = await messagesRes.json();
  check('GET /api/admin/contacts -> 200', messagesRes.status === 200, `got ${messagesRes.status}`);
  check('messages list is an array', Array.isArray(messagesJson.data));

  /* ---------------------------------------------------------------- */
  console.log('\nContact form');
  const contactInvalid = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ name: '', email: 'bad', subject: '', category: 'general', message: '' }),
  });
  check('contact with invalid fields -> 422', contactInvalid.status === 422, `got ${contactInvalid.status}`);

  const contactValid = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({
      name: 'E2E Tester',
      email: 'tester@example.com',
      subject: 'Automated check',
      category: 'general',
      message: 'This message was created by the end-to-end smoke test.',
    }),
  });
  check('contact with valid fields -> 201', contactValid.status === 201, `got ${contactValid.status}`);

  const messagesAfter = await fetch(`${BASE}/api/admin/contacts`, { headers: { Cookie: authCookie, Origin: ORIGIN } });
  const messagesAfterJson = await messagesAfter.json();
  const found = (messagesAfterJson.data || []).some((m) => m.email === 'tester@example.com');
  check('submitted message appears in the admin inbox', found);

  /* ---------------------------------------------------------------- */
  console.log('\nSign out');
  const logout = await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { Cookie: authCookie, Origin: ORIGIN } });
  check('POST /api/auth/logout -> 200', logout.status === 200, `got ${logout.status}`);

  const afterLogout = await fetch(`${BASE}/api/admin/projects`, { headers: { Cookie: authCookie, Origin: ORIGIN } });
  check('revoked session cannot access protected API -> 401', afterLogout.status === 401, `got ${afterLogout.status}`);

  /* ---------------------------------------------------------------- */
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('E2E run failed:', error);
  process.exit(1);
});

