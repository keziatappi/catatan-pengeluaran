import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost/placeholder';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ Warning: DATABASE_URL tidak terdefinisi. Menggunakan placeholder untuk build compilation.');
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
