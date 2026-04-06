import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  ...config.db,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function verifyDbConnection() {
  const res = await pool.query('SELECT NOW() AS now');
  console.log(`✅ DB 연결 성공 (${res.rows[0].now})`);
}
