import * as dotenv from 'dotenv';
dotenv.config(); // WAJIB dipanggil sebelum mengimpor file lain yang menggunakan env

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
