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
cd backend
npm install         # 의존성 설치
npm run dev         # 개발 모드 실행 (ts-node)
# or
npm run build       # 빌드 (dist/)
npm start           # 빌드된 dist/main.js 실행
```

### 2. 프론트엔드 실행 (React Native + Expo)
```bash
cd frontend
npm install         # 의존성 설치
npm start           # Expo 실행
```