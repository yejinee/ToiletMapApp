import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const port = 5000;
app.use(cors()); // 모든 도메인 허용

// 라우팅 ("/" GET 요청)
app.get("/", (req: Request, res: Response) => {
  res.send("성공입니다.");
});

// 서버 실행
app.listen(port, () => {
  console.log(`🚀 서버가 정상적으로 실행되었습니다. http://localhost:${port}`);
});
