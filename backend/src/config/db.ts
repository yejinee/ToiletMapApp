import 'dotenv/config';
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'toilet',
  password: process.env.DB_PASSWORD || 'toiletpw',
  database: process.env.DB_NAME || 'toiletmap',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function verifyDbConnection() {
  const res = await pool.query('SELECT NOW() AS now');
  console.log(`✅ DB 연결 성공 (${res.rows[0].now})`);
}
