# 🚽 Toilet Map App

React Native (Expo) + Node.js (Express + TypeScript) 기반 화장실 지도 MVP 프로젝트

---

## 📂 프로젝트 구조
```
    toilet-map-app/
    ├── backend/ # Node.js + TypeScript + Express API 서버
    ├── frontend/ # React Native + Expo 앱
    ├── .gitignore
    └── README.md
```



## ⚙️ 실행 방법

### 1. 백엔드 실행 (Express + TS)
```bash
# 첫 실행 시
# ① DB 컨테이너 띄우기 (최초 1회만)
docker compose up -d

# ② 백엔드 의존성 설치 (node_modules 생성)
cd backend
npm install

# ③ (선택) .env 확인 (DB_HOST, DB_USER 등)
cat .env   # 값이 compose와 맞는지 확인

# ④ 빌드
npm run build      # -> dist 폴더 생성됨

# ⑤ 서버 실행 (빌드 결과 실행)
npm start


# 이후 실행 시
# DB 이미 떠있다면 생략
docker compose up -d

cd backend
npm run dev     # => ts-node src/main.ts 직접 실행 (핫리로드)
```



### 2. 프론트엔드 실행 (React Native + Expo)
```bash
cd frontend
npm install         # 의존성 설치
npm start           # Expo 실행
npx expo start -c
```