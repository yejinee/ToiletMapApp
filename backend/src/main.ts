import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { verifyDbConnection, pool } from './config/db';

const app = express();
const { port } = config;

// 미들웨어
app.use(cors()); // 모든 도메인 허용
app.use(express.json());

// 기본 라우팅
app.get('/', (req: Request, res: Response) => {
  res.send('✅ 서버 연결 성공! 🚀');
});

// DB 연결 상태 확인용 (optional)
app.get('/healthz/db', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    res.json({ ok: true, now: result.rows[0].now });
  } catch (error) {
    console.error('[DB] 연결 오류:', error);
    res.status(500).json({ ok: false, error: String(error) });
  }
});

// 서버 실행
(async () => {
  try {
    await verifyDbConnection(); // ✅ DB 연결 체크
    app.listen(port, () => {
      console.log(`🚀 서버 실행 중: http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
})();
