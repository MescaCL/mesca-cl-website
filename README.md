# Mesca CL

Personal brand website for **Chineke Olisadubem Louis** — a builder working across software engineering, applied AI and entrepreneurship.

The site is a public, database-backed portfolio with a private admin dashboard. Public content (profile, projects, posts, journey timeline, "now building" list, social links) is stored in SQLite and edited from `/admin`; visitors never touch the admin area.

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | Server components for the public site, route handlers for the APIs |
| Language | TypeScript (strict) | Type safety across data access, APIs and UI |
| Styling | Tailwind CSS | Design tokens via CSS variables, light + dark themes |
| Database | SQLite via Node's built-in `node:sqlite` | Zero native compilation — no `node-gyp` / Visual Studio needed |
| Auth | JWT in an HttpOnly cookie + scrypt password hashing | Stateless sessions, no extra dependency, timing-safe comparison |
| Validation | Zod | One schema shared by the API and the contact form |

> **Why `node:sqlite` instead of `better-sqlite3`?**
> `better-sqlite3` ships a native addon that must be compiled on install. That fails on any
> machine without the Visual Studio C++ build tools. Node 22 ships SQLite in core, so this
> project installs cleanly everywhere with a plain `npm install`.

---

## Requirements

- **Node.js 22 or newer** (the `node:sqlite` module is required)
- npm 10+

Check your version:

```bash
node --version
```

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment
cp .env.example .env.local
#    then set JWT_SECRET to a long random string:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Create the database and seed the default content
npm run db:setup
npm run db:seed

# 4. Create the admin account (password is typed interactively)
npm run admin:setup

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000> for the site and <http://localhost:3000/admin/login> for the dashboard.

## Security notes

- **CSRF**: state-changing admin and contact endpoints require a same-origin `Origin`/`Referer`. Cross-origin requests are rejected with `403`.
- **Sessions**: JWTs carry a `token_version`. Logout, password reset (`npm run admin:setup`) and account deactivation increment it, immediately revoking older tokens.
- **Rate limiting**: login attempts are tracked in the SQLite `login_rate_limits` table (5 attempts / 15 minutes per IP). This is shared across processes using the same database, but not across separate database files or serverless instances. For multi-instance/serverless deployments, replace this with a shared store such as Redis/Upstash or platform-level rate limiting.
- **Secrets**: `JWT_SECRET` has no insecure production fallback; the app refuses to start in production without it. `.env.local` and the database are gitignored. Rotate any previously exposed admin password with `npm run admin:setup` before deployment.
- **Cookies**: the session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production (`COOKIE_SECURE` defaults to true).
- **Storage**: SQLite and data-URL profile images are stored on the local filesystem. For ephemeral/serverless hosts, mount a persistent volume or migrate to a managed database and object storage.

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint via `next lint` |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run db:setup` | Create the database file and all tables (idempotent) |
| `npm run db:seed` | Insert default profile, categories, social links, sections, settings (idempotent) |
| `npm run admin:setup` | Create or reset the admin account with an interactively entered password |
