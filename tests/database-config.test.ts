import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveDatabaseUrl,
  isProductionEnvironment,
  resetDatabaseClient,
} from '../lib/db';

type MutableProcessEnv = { [key: string]: string | undefined };

const env = process.env as MutableProcessEnv;

function setProductionEnv(): void {
  env.NODE_ENV = 'production';
  delete env.VERCEL_ENV;
  delete env.VERCEL;
}

function setDevEnv(): void {
  delete env.NODE_ENV;
  delete env.VERCEL_ENV;
  delete env.VERCEL;
}

test('resolveDatabaseUrl throws in production when TURSO_DATABASE_URL is missing', () => {
  setProductionEnv();
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  resetDatabaseClient();
  assert.throws(() => resolveDatabaseUrl(), /TURSO_DATABASE_URL is required in production/);
});

test('resolveDatabaseUrl throws in production when TURSO_DATABASE_URL is a local file URL', () => {
  setProductionEnv();
  process.env.TURSO_DATABASE_URL = 'file:C:/temp/database/mesca.db';
  delete process.env.TURSO_AUTH_TOKEN;
  resetDatabaseClient();
  assert.throws(() => resolveDatabaseUrl(), /refusing to use a local SQLite database/);
});

test('resolveDatabaseUrl throws in production when TURSO_AUTH_TOKEN is missing', () => {
  setProductionEnv();
  process.env.TURSO_DATABASE_URL = 'libsql://example.turso.io';
  delete process.env.TURSO_AUTH_TOKEN;
  resetDatabaseClient();
  assert.throws(() => resolveDatabaseUrl(), /TURSO_AUTH_TOKEN is required in production/);
});

test('resolveDatabaseUrl returns Turso URL in production when both vars are set', () => {
  setProductionEnv();
  process.env.TURSO_DATABASE_URL = 'libsql://mesca.turso.io';
  process.env.TURSO_AUTH_TOKEN = 'test-token-123';
  resetDatabaseClient();
  assert.equal(resolveDatabaseUrl(), 'libsql://mesca.turso.io');
});

test('resolveDatabaseUrl falls back to local SQLite in development', () => {
  setDevEnv();
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
  resetDatabaseClient();
  const url = resolveDatabaseUrl();
  assert.ok(url.startsWith('file:'));
  assert.ok(url.includes('mesca.db'));
});

test('isProductionEnvironment returns true when NODE_ENV is production', () => {
  setProductionEnv();
  assert.equal(isProductionEnvironment(), true);
});

test('isProductionEnvironment returns false in development', () => {
  setDevEnv();
  assert.equal(isProductionEnvironment(), false);
});