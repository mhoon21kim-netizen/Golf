# Personal AI Golf Coach

골프 초보자를 위한 단계별 AI 코치 프로그램 (MVP)

## 프로젝트 구조

```
Golf/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Node.js 백엔드 API
├── ai-engine/         # Python AI 판정 엔진
└── shared/            # 공통 타입 정의
```

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Local Storage (SQLite 대안)

### Backend
- Node.js
- Express
- TypeScript
- OpenAI API (피드백 생성용)

### AI Engine
- Python 3.10+
- MediaPipe Pose
- NumPy
- OpenCV

## 시작하기

### 1. 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```

### 2. 백엔드 실행
```bash
cd backend
npm install
npm run dev
```

### 3. AI 엔진 실행
```bash
cd ai-engine
pip install -r requirements.txt
python app.py
```

## MVP 범위

- Lv1: 그립 & 어드레스 안정
- Lv2: 스윙 궤도 & 리듬
- Lv3: 아이언 임팩트

## 주요 기능

1. 단계별 커리큘럼 (Lv1~Lv3)
2. 영상 업로드 및 분석
3. 규칙 엔진 기반 판정 (PASS/FAIL) - 보수적 기준
4. LLM 기반 피드백 생성
5. Day Sheet 기록
6. 히스토리 관리

## 판정 시스템

### 규칙 엔진
- 모든 판정은 규칙 엔진으로 수행
- 보수적 기준 적용 (절대 완화하지 않음)
- 수치 기반 객관적 판정

### LLM 피드백
- OpenAI API를 사용한 피드백 문구 생성
- 판정 결과와 측정 지표를 바탕으로 피드백 제공
- API 키가 없어도 동작 (폴백 피드백 사용)

## 판정 기준 (보수적)

### Level 1: 그립 & 어드레스 안정
- 척추 각도 변동: **≤ 4°** (원래 5°에서 강화)
- 그립 강도: **≥ 0.75** (원래 0.7에서 강화)

### Level 2: 스윙 궤도 & 리듬
- 클럽 패스: **-1.5° ~ +1.5°** (원래 -2° ~ +2°에서 강화)
- 리듬 변동: **≤ 0.12** (원래 0.15에서 강화)

### Level 3: 아이언 임팩트
- 체중 이동: **≥ 60%** (원래 55%에서 강화)
- 임팩트 각도: **≥ -4°** (원래 -5°에서 강화)

## 환경 변수 설정

백엔드 환경 변수 설정은 `backend/ENV_SETUP.md` 참조

