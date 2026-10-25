# Mesca CL — Project Progress

## Completed Work

### 1. Profile Photo Upload — Root Cause Fixed
**File:** `app/api/admin/profile/route.ts`

**Root cause:** Profile image uploads were converted to base64 data URLs and stored directly in the `profile_image_url` database column, instead of using the existing `storeUploadedFile()` function that uploads to persistent storage (Cloudflare R2 in production, `public/uploads` in development). The homepage hero component reads `profile_image_url` as an `` `src` ``, so base64 data URLs were unreliable and not persistent.

**Fix:** The POST handler now:
- Validates the image file (type must be `image/*`, max 2 MB)
- Sanitizes the filename
- Calls `storeUploadedFile()` to persist the file (R2 when configured, local fallback in dev)
- Saves the returned public URL (`stored.url`) to `profile_image_url`
- On database update failure, rolls back the stored file via `deleteStoredFile()` to avoid orphaned files
- Returns the public URL to the frontend

**File:** `components/admin/profile-settings.tsx`
- Updated the hint text from "Stored as a data URL for now" to "Stored in persistent media storage."

### 2. Verification — All Checks Pass
| Check | Result |
|-------|--------|
| TypeScript (`tsc --noEmit`) | Pass |
| ESLint (`next lint`) | Pass (pre-existing warnings only) |
| Tests (`tsx --test`) | 17/17 pass |
| Production build (`next build`) | Success |
| Integrity check (`node scripts/integrity-check.js`) | Pass |

## Verified Architecture

### Database
- Production: Turso (`@libsql/client`) via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
- Local development: SQLite file at `database/mesca.db`
- Both admin and public pages use the same `getDatabase()` → same database

### Caching
- All public pages and API routes use `export const dynamic = 'force-dynamic'`
- No static generation, ISR, or Next.js data caching — data is always fetched fresh
- Admin-to-production publishing is direct: API writes → database → public page reads

### Media Storage (`lib/media-storage.ts`)
- `storeUploadedFile()` supports Cloudflare R2 (when `R2_*` env vars are set) with local `public/uploads` fallback
- `deleteStoredFile()` supports cleanup for both R2 and local storage
- Media library API (`app/api/admin/media/route.ts`) already uses `storeUploadedFile()` correctly
- Profile upload now uses `storeUploadedFile()` (this fix)

### Environment Variables (`.env.local`)
Configured: `NEXT_PUBLIC_SITE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `SESSION_COOKIE_NAME`, `SESSION_MAX_AGE`, `CONTACT_EMAIL`, `PHONE_NUMBER`, `WHATSAPP_NUMBER`, `WHATSAPP_PRESET_MESSAGE`, `TURSO_AUTH_TOKEN`, `TURSO_DATABASE_URL`

Not configured: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, `COOKIE_SECURE`

## Remaining Work (Not Yet Completed)

### 1. Cloudflare R2 Configuration
R2 is NOT configured in `.env.local` or Vercel project settings. Without R2 credentials:
- Production uploads fall through — `isR2Configured()` returns `false`, so `storeUploadedFile()` uses local `public/uploads` which is NOT durable on Vercel's serverless filesystem
- Uploaded files will be lost on redeployment or serverless function recycle

**Required action:** Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and optionally `R2_PUBLIC_BASE_URL` in Vercel project settings. Do NOT commit these to git.

### 2. Profile Photo on Production Website
The profile photo fix has been verified locally but NOT yet deployed to production. After deployment:
- Test uploading a profile photo through /admin/settings
- Verify it appears on the homepage hero section
- Verify the old base64 data URL (if any exists in production) is replaced

### 3. Existing Base64 Profile Images
If the production database contains a `profile_image_url` stored as a base64 data URL (from before this fix), it will still render as a data URL in the hero component. It will need to be re-uploaded through the admin dashboard to be stored properly.

### 4. Cover Images for Posts and Projects
The database schema supports `cover_image_url` and `gallery_urls` for posts and projects, but the admin UI (`app/admin/(dashboard)/posts/page.tsx` and `app/admin/(dashboard)/projects/page.tsx`) does not expose fields to set them. These can only be set directly in the database.

### 5. Third-Party Video Embeds
No YouTube/TikTok embed support is implemented. The `Gallery` component supports direct video files (mp4/webm/ogg) but not third-party embeds.

### 6. PROJECT_PROGRESS.md Maintenance
This document should be updated as remaining work is completed.

## Deployment Status

- Local build: ✅ Success
- Local checks: ✅ All pass
- Deployed to production: ❌ Not yet deployed
- Production verification: ❌ Not yet verified