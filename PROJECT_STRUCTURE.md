# 프로젝트 구조

## 전체 구조

```
Golf/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                  # Next.js App Router
│   │   ├── components/       # React 컴포넌트
│   │   ├── lib/             # 유틸리티 함수
│   │   ├── layout.tsx       # 루트 레이아웃
│   │   ├── page.tsx         # 메인 페이지
│   │   └── globals.css      # 전역 스타일
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/                  # Node.js 백엔드 API
│   ├── src/
│   │   ├── handlers/        # 요청 핸들러
│   │   │   └── judgmentHandler.ts
│   │   ├── utils/           # 유틸리티
│   │   │   └── llmFeedback.ts
│   │   └── index.ts        # Express 서버 진입점
│   ├── uploads/             # 업로드된 영상 임시 저장
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── ai-engine/                # Python AI 판정 엔진
│   ├── analyzer.py          # 골프 스윙 분석기
│   ├── app.py               # Flask 서버
│   ├── requirements.txt
│   └── README.md
│
├── shared/                   # 공통 타입 정의
│   └── types.ts             # TypeScript 타입 정의
│
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## 모듈별 상세 구조

### 1. Frontend (Next.js)

#### 컴포넌트
- `VideoUpload`: 영상 업로드 컴포넌트
- `JudgmentResultDisplay`: 판정 결과 표시
- `DaySheet`: 일일 기록 테이블
- `ProgressBar`: 진행 상황 표시

#### 라이브러리
- `api.ts`: 백엔드 API 클라이언트
- `storage.ts`: LocalStorage 관리

#### 주요 기능
- 사용자 진행 상태 관리
- 영상 업로드 및 미리보기
- 판정 결과 시각화
- Day Sheet 기록 및 조회

### 2. Backend (Node.js/Express)

#### 핸들러
- `judgmentHandler.ts`: 판정 요청 처리
  - AI 엔진 호출
  - 판정 로직 적용
  - 피드백 생성

#### 유틸리티
- `llmFeedback.ts`: LLM 기반 피드백 생성

#### 주요 기능
- 영상 파일 업로드 처리 (Multer)
- AI 엔진과 통신
- **규칙 엔진 기반 판정** (보수적 기준)
- **LLM 기반 피드백 생성** (OpenAI API)

### 3. AI Engine (Python/Flask)

#### 분석기
- `analyzer.py`: 골프 스윙 분석 클래스
  - MediaPipe Pose 초기화
  - 영상 프레임 분석
  - 레벨별 지표 계산

#### 주요 기능
- MediaPipe Pose를 사용한 포즈 추출
- 레벨별 지표 계산:
  - Lv1: 척추 각도 변동, 그립 강도
  - Lv2: 클럽 패스, 리듬 변동
  - Lv3: 체중 이동, 임팩트 각도

## 데이터 흐름

```
사용자 (Frontend)
  ↓ 영상 업로드
Backend API (Express)
  ↓ 영상 파일 전달
AI Engine (Flask)
  ↓ MediaPipe 분석
AI Engine
  ↓ 지표 반환
Backend API
  ↓ 규칙 엔진 판정 (보수적 기준)
Backend API
  ↓ LLM 피드백 생성 (OpenAI)
Backend API
  ↓ 결과 반환
Frontend
  ↓ 결과 표시
사용자
```

## 판정 시스템

### 규칙 엔진 (Rule Engine)
- **위치**: `backend/src/handlers/judgmentHandler.ts`
- **역할**: 수치 기반 객관적 판정
- **기준**: 보수적 기준 (절대 완화하지 않음)
- **결과**: PASS / FAIL + FailureType

### LLM 피드백 생성
- **위치**: `backend/src/utils/llmFeedback.ts`
- **역할**: 판정 결과를 바탕으로 피드백 문구 생성
- **API**: OpenAI (gpt-4o-mini 권장)
- **폴백**: API 키가 없으면 하드코딩된 피드백 사용

## 통신 프로토콜

### Frontend ↔ Backend
- **프로토콜**: HTTP/REST
- **포트**: 3000 (Frontend) ↔ 3001 (Backend)
- **형식**: JSON, Multipart/Form-Data

### Backend ↔ AI Engine
- **프로토콜**: HTTP/REST
- **포트**: 3001 (Backend) ↔ 5000 (AI Engine)
- **형식**: JSON, Multipart/Form-Data

## 저장소

### Frontend
- **LocalStorage**: 사용자 진행 상태, Day Sheet 기록
- **키**:
  - `golf_coach_progress`: 진행 상태
  - `golf_coach_day_sheets`: Day Sheet 기록

### Backend
- **파일 시스템**: 업로드된 영상 임시 저장 (`uploads/`)
- **메모리**: 세션 데이터 (필요시)

## 환경 변수

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend
```env
PORT=3001
AI_ENGINE_URL=http://localhost:5000
```

### AI Engine
```env
PORT=5000
```

## 의존성 관리

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios

### Backend
- Express
- TypeScript
- Multer (파일 업로드)
- Axios (AI 엔진 통신)
- Form-Data
- OpenAI API (피드백 생성)

### AI Engine
- Flask
- MediaPipe
- OpenCV
- NumPy
- SciPy

## 확장 포인트

1. **데이터베이스**: SQLite → PostgreSQL/MongoDB
2. **인증**: 사용자 계정 시스템
3. **클라우드 스토리지**: S3 등 영상 저장
4. **실시간 분석**: WebSocket 기반 실시간 피드백
5. **모바일 앱**: React Native 버전

