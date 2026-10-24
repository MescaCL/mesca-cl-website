import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createClient, type Client } from '@libsql/client';

const DATABASE_URL =
  process.env.TURSO_DATABASE_URL ||
  `file:${path.join(process.cwd(), 'database', 'mesca.db')}`;
const DATABASE_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client: Client | null = null;

function getClient(): Client {
  if (client) return client;
  if (DATABASE_URL.startsWith('file:')) {
    const filePath = DATABASE_URL.slice('file:'.length);
    const dbDir = path.dirname(filePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }
  client = createClient({ url: DATABASE_URL, authToken: DATABASE_AUTH_TOKEN });
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
  return DATABASE_URL;
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



