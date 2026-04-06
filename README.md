# Toilet Map App

React Native (Expo) + Node.js (Express + TypeScript) 기반 화장실 지도 MVP 프로젝트

---

## 프로젝트 구조

```
ToiletMapApp/
├── backend/                        # Node.js + TypeScript + Express API 서버
│   ├── src/
│   │   ├── main.ts                 # 서버 진입점, 라우터 등록, 서버 실행
│   │   └── config/
│   │       └── db.ts               # PostgreSQL 연결 풀 설정 및 연결 검증
│   ├── dist/                       # TypeScript 빌드 결과물 (자동생성)
│   ├── .env                        # DB 접속 정보 환경변수
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React Native + Expo 앱
│   ├── app/
│   │   ├── _layout.tsx             # 앱 전체 레이아웃 (폰트 로드, 테마 등)
│   │   ├── index.tsx               # 앱 진입 화면 (restroom_finder로 리다이렉트)
│   │   └── (tabs)/
│   │       ├── _layout.tsx         # 탭 네비게이션 레이아웃
│   │       ├── restroom_finder.tsx # 메인 화면 - 카카오맵 + 화장실 목록
│   │       ├── restroom_finder.styles.ts  # 메인 화면 스타일
│   │       └── restroom_details.tsx       # 화장실 상세 정보 화면
│   ├── components/
│   │   ├── KakaoMapView.tsx        # 카카오맵 네이티브 뷰 컴포넌트 (Android/iOS)
│   │   ├── KakaoMapView.web.tsx    # 카카오맵 웹 뷰 컴포넌트 (Web)
│   │   ├── ToiletListSheet.tsx     # 화장실 목록 바텀시트
│   │   ├── RatingModal.tsx         # 별점 평가 모달
│   │   ├── ThemedText.tsx          # 다크/라이트 테마 텍스트
│   │   └── ThemedView.tsx          # 다크/라이트 테마 뷰
│   ├── constants/
│   │   └── Colors.ts               # 앱 색상 상수 (다크/라이트 모드)
│   ├── hooks/
│   │   ├── useColorScheme.ts       # 다크/라이트 모드 감지 훅
│   │   └── useThemeColor.ts        # 테마 색상 반환 훅
│   ├── assets/                     # 폰트, 이미지 등 정적 자원
│   ├── .env                        # 카카오맵 API 키 등 환경변수
│   └── package.json
│
├── docs/                           # 기획/설계 문서
│   ├── API정의.md                   # REST API 엔드포인트 명세
│   ├── MVP1_기능정리.md              # MVP 기능 목록
│   ├── db스키마.md                  # DB 테이블 설계
│   └── ddl.sql                     # DB 생성 DDL
│
├── requestHttp/                    # API 테스트용 HTTP 요청 파일
│   ├── dbTest.http                 # DB 연결 확인 요청
│   └── kakao.http                  # 카카오 API 테스트 요청
│
├── docker-compose.yml              # PostgreSQL 컨테이너 설정
└── README.md
```

---

## 실행 방법

### 사전 준비
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 (PostgreSQL 컨테이너용)
- [Node.js](https://nodejs.org/) 설치 (v18 이상 권장)
- [Expo Go](https://expo.dev/go) 앱 설치 (모바일 실기기 테스트 시)

---

### 백엔드 실행 (Express + TypeScript)

#### 최초 실행
```bash
# 1. PostgreSQL 컨테이너 실행 (최초 1회)
docker compose up -d

# 2. 백엔드 디렉터리 이동 후 의존성 설치
cd backend
npm install

# 3. .env 파일 확인 (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME 등)
cat .env

# 4. TypeScript 빌드
npm run build     # dist/ 폴더 생성됨

# 5. 서버 실행
npm start         # http://localhost:5000
```

#### 이후 실행 (개발 중)
```bash
docker compose up -d   # DB가 꺼져있을 경우만

cd backend
npm run dev            # ts-node로 핫리로드 실행
```

#### API 확인
| 엔드포인트 | 설명 |
|---|---|
| `GET /` | 서버 연결 확인 |
| `GET /healthz/db` | DB 연결 상태 확인 |

---

### 프론트엔드 실행 (React Native + Expo)

```bash
cd frontend
npm install         # 의존성 설치

npm start           # Expo 개발 서버 실행
# 또는
npx expo start -c   # 캐시 초기화 후 실행
```

실행 후 터미널에 QR 코드가 출력됩니다.
- **실기기**: Expo Go 앱으로 QR 코드 스캔
- **Android 에뮬레이터**: `a` 키 입력
- **웹 브라우저**: `w` 키 입력

#### 플랫폼별 빌드/실행
```bash
npm run android     # Android 빌드 및 실행
npm run ios         # iOS 빌드 및 실행 (Mac 환경 필요)
npm run web         # 웹 브라우저 실행
```

---

### 트러블슈팅

#### node_modules 초기화 (Windows PowerShell)
```powershell
rmdir node_modules -Recurse -Force
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

#### 패키지 버전 충돌 확인
```bash
npm ls react-native-reanimated react-native-worklets
```
