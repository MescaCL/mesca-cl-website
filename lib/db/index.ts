import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createClient, type Client } from '@libsql/client';

const LOCAL_DATABASE_URL = `file:${path.join(process.cwd(), 'database', 'mesca.db')}`;

let client: Client | null = null;
let clientUrl: string | null = null;
let clientToken: string | undefined;

function normalizeEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function isProductionEnvironment(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  const vercelEnv = normalizeEnv(process.env.VERCEL_ENV);
  if (vercelEnv === 'production' || vercelEnv === 'preview') return true;
  if (normalizeEnv(process.env.VERCEL) === '1') return true;
  return false;
}

export function resolveDatabaseUrl(): string {
  const configuredUrl = normalizeEnv(process.env.TURSO_DATABASE_URL);
  const production = isProductionEnvironment();

  if (configuredUrl) {
    const isRemoteTursoUrl =
      /^libsql:\/\//i.test(configuredUrl) || /^https:\/\//i.test(configuredUrl);
    const isLocalFile = /^file:/i.test(configuredUrl);

    if (production) {
      if (!isRemoteTursoUrl || isLocalFile) {
        throw new Error(
          'TURSO_DATABASE_URL must be a remote Turso URL (libsql:// or https://) in production; refusing to use a local SQLite database.'
        );
      }

      const authToken = normalizeEnv(process.env.TURSO_AUTH_TOKEN);
      if (!authToken) {
        throw new Error('TURSO_AUTH_TOKEN is required in production when TURSO_DATABASE_URL is configured.');
      }
    }

    return configuredUrl;
  }

  if (production) {
    throw new Error(
      'TURSO_DATABASE_URL is required in production. Refusing to fall back to a local SQLite database.'
    );
  }

  return LOCAL_DATABASE_URL;
}

export const getDatabaseUrl = resolveDatabaseUrl;

export function resetDatabaseClient(): void {
  if (client) {
    try {
      client.close();
    } catch {
      // Ignore close errors during reset.
    }
  }
  client = null;
  clientUrl = null;
  clientToken = undefined;
}

function getClient(): Client {
  const url = resolveDatabaseUrl();
  const authToken = normalizeEnv(process.env.TURSO_AUTH_TOKEN);

  if (client && clientUrl === url && clientToken === authToken) {
    return client;
  }

  if (client) {
    try {
      client.close();
    } catch {
      // Ignore close errors before recreating the client.
    }
  }

  client = null;
  clientUrl = null;
  clientToken = undefined;

  if (url.startsWith('file:')) {
    const filePath = url.slice('file:'.length);
    const dbDir = path.dirname(filePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }
  client = createClient({ url, authToken });
  return client;
}

export interface SqliteStatement {
  get(...params: unknown[]): Promise<unknown>;
  all(...params: unknown[]): Promise<unknown[]>;
  run(...params: unknown[]): Promise<{ changes: number; lastInsertRowid: number }>;
}

export interface SqliteDatabase {
  prepare(sql: string): SqliteStatement;
  exec(sql: string): Promise<void>;
  pragma(statement: string): Promise<unknown>;
  close(): void;
}

class LibsqlDatabase implements SqliteDatabase {
  private readonly db: Client;
  constructor() { this.db = getClient(); }
  prepare(sql: string): SqliteStatement {
    const db = this.db;
    return {
      get: async (...params: unknown[]) => {
        const result = await db.execute({ sql, args: params as any });
        return toPlainObject(result.rows[0]);
      },
      all: async (...params: unknown[]) => {
        const result = await db.execute({ sql, args: params as any });
        return result.rows.map((row) => toPlainObject(row));
      },
      run: async (...params: unknown[]) => {
        const result = await db.execute({ sql, args: params as any });
        return {
          changes: Number(result.rowsAffected ?? 0),
          lastInsertRowid: Number(result.lastInsertRowid ?? 0),
        };
      },
    };
  }
  async exec(sql: string): Promise<void> {
    await this.db.executeMultiple(sql);
  }
  async pragma(statement: string): Promise<unknown> {
    try {
      const result = await this.db.execute(`PRAGMA ${statement}`);
      return result.rows.map((row) => toPlainObject(row));
    } catch {
      return [];
    }
  }
  close(): void {}
}

function toPlainObject(row: unknown): unknown {
  if (row === null || typeof row !== 'object') return row;
  return { ...(row as Record<string, unknown>) };
}

export function getDatabase(): SqliteDatabase {
  return new LibsqlDatabase();
}

export function getDatabasePath(): string {
  return resolveDatabaseUrl();
}

export function generateId(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function readSchemaSql(): string {
  const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }
  return fs.readFileSync(SCHEMA_PATH, 'utf8');
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  try {
    await db.pragma('foreign_keys = ON');
    await db.exec(readSchemaSql());
  } finally {
    db.close();
  }
}



