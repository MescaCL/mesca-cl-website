const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');

const { loadEnvConfig } = require('@next/env');
loadEnvConfig(ROOT);

const DB_FILE = process.env.DATABASE_FILE || path.join(ROOT, 'database', 'mesca.db');
const DEFAULT_EMAIL = 'admin@example.com';

function dbUrl() {
  return process.env.TURSO_DATABASE_URL || `file:${DB_FILE}`;
}

function ask(question, { silent = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

    if (silent) {
      const onData = (char) => {
        if (['\n', '\r', '\u0004'].includes(char.toString('utf8'))) {
          process.stdin.removeListener('data', onData);
          return;
        }
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        process.stdout.write(question);
      };
      process.stdin.on('data', onData);
    }

    rl.question(question, (answer) => {
      rl.close();
      if (silent) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

function hashPassword(password, salt) {
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derived.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return derived.toString('hex') === hash;
}

function passwordStrengthError(password) {
  if (password.length < 12) return 'Password must be at least 12 characters long.';
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.';
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include a number.';
  return null;
}

async function main() {
  const { createClient } = require('@libsql/client');
  const url = dbUrl();
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  console.log('Mesca CL — admin account setup');
  console.log('=============================');

  const email = ((await ask(`Admin email [${DEFAULT_EMAIL}]: `)) || DEFAULT_EMAIL).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('That does not look like a valid email address.');
    process.exit(1);
  }

  let password = await ask('Admin password (input hidden): ', { silent: true });
  const problem = passwordStrengthError(password);
  if (problem) {
    console.error(problem);
    process.exit(1);
  }

  const confirm = await ask('Confirm password (input hidden): ', { silent: true });
  if (password !== confirm) {
    console.error('Passwords do not match.');
    process.exit(1);
  }

  const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [email] });

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  if (existing.rows.length > 0) {
    await client.execute({
      sql: "UPDATE users SET password_hash = ?, role = 'admin', is_active = 1, token_version = COALESCE(token_version, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE email = ?",
      args: [passwordHash, email],
    });
    console.log(`Password reset for ${email}.`);
  } else {
    await client.execute({
      sql: "INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, 'admin', 1)",
      args: [passwordHash, email],
    });
    console.log(`Admin account created for ${email}.`);
  }

  const check = await client.execute({ sql: 'SELECT password_hash FROM users WHERE email = ?', args: [email] });
  if (!check.rows[0] || !verifyPassword(password, check.rows[0].password_hash)) {
    console.error('Self-check failed — the password was not stored correctly.');
    client.close();
    process.exit(1);
  }

  client.close();
  console.log('Done. You can now sign in at /admin/login.');
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
