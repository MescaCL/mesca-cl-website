# Deployment, Backup, Recovery, and Rollback

## Verified free-tier architecture

| Service | Free tier used by this project |
| --- | --- |
| Vercel Hobby | Free for personal/non-commercial projects; 100 GB fast data transfer, 10 GB fast origin transfer, 1M function invocations, 4 CPU-hours active CPU, 300s max function duration. Hobby is non-commercial/personal use only. |
| Turso Starter | Free: 100 databases, 5 GB storage, 500M row reads/month, 10M row writes/month. |
| Cloudflare R2 | Free: 10 GB-month standard storage, 1M Class A requests/month, 10M Class B requests/month, no egress charges. Free tier applies to Standard storage only. |

## Required environment variables

Set these in Vercel project settings (Production and Preview), never commit them:

```text
NEXT_PUBLIC_SITE_URL=https://your-domain.example
JWT_SECRET=<long random string>
ADMIN_EMAIL=admin@example.com
TURSO_DATABASE_URL=libsql://<db>.turso.io
TURSO_AUTH_TOKEN=<turso token>
R2_ACCOUNT_ID=<cloudflare account id>
R2_ACCESS_KEY_ID=<r2 access key>
R2_SECRET_ACCESS_KEY=<r2 secret key>
R2_BUCKET_NAME=<bucket>
R2_PUBLIC_BASE_URL=https://pub-<id>.r2.dev
CONTACT_EMAIL=<destination inbox>
```

Leave the Turso/R2 variables unset for local development; the app falls back to `./database/mesca.db` and `public/uploads`.

## Node version

This project requires Node.js 22 or newer. `.nvmrc` and `package.json` engines pin this. Vercel will use the pinned version when available.

## First production launch

1. Create a Turso database and an R2 bucket.
2. Run locally against cloud resources for a dry run:

   ```bash
   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:setup
   npm run db:migrate:turso
   npm run admin:setup
   npm run media:migrate:r2
   npm run integrity:check
   ```

3. Push the repository to GitHub (only after reviewing the diff).
4. Import the project into Vercel and set all environment variables.
5. Deploy a preview, then run `npm run build` locally and smoke-test `/`, `/projects`, `/blog`, `/contact`, `/admin/login`.
6. Promote to production.

## Backups

- Local database: `npm run db:backup` copies `database/mesca.db` into `backups/` (gitignored).
- Turso: use Turso's own backups/point-in-time restore or export with `turso db shell`.
- Media: keep a copy of `public/uploads` before running `media:migrate:r2`; R2 objects are not deleted by rollback scripts.

## Recovery and rollback

- Database data: `npm run db:rollback:local` copies a Turso database back into a local SQLite file. It does not overwrite the source.
- Media: migration is idempotent; rerun `npm run media:migrate:r2` after fixing failures. Already-migrated rows are skipped.
- Application rollback: revert the Git commit and redeploy on Vercel; environment variables remain unchanged.

## Security checklist

- `JWT_SECRET` must be set in production; the app refuses to start without it.
- Session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- State-changing routes enforce same-origin CSRF checks.
- Contact submissions are rate-limited by IP.
- `.env.local`, database files, and uploads are gitignored.