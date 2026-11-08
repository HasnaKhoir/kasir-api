import pg from 'pg';
const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL belum diatur');
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  max: Number(process.env.DB_POOL_MAX || 5), idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});
pool.on('error', (err) => console.error('Koneksi PostgreSQL idle bermasalah:', err.message));
