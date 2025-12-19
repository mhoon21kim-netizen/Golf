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

---

## TDD Red 단계: 실패하는 테스트 작성 목록

TDD(Test-Driven Development)의 Red 단계에서 작성해야 할 테스트 목록입니다. 모든 테스트는 먼저 실패하는 상태로 작성되어야 합니다.

### 1. 판정 로직 테스트 (규칙 엔진)

**파일**: `backend/src/rules/__tests__/judgmentRules.test.ts`

#### Lv1 테스트
- [ ] 척추 각도 변동 > 4° → FAIL (ADDRESS_UNSTABLE)
- [ ] 척추 각도 변동 = 4° → PASS
- [ ] 척추 각도 변동 < 4° → PASS
- [ ] 그립 강도 < 0.75 → FAIL (GRIP_WEAK)
- [ ] 그립 강도 = 0.75 → PASS
- [ ] 그립 강도 > 0.75 → PASS
- [ ] 두 기준 모두 통과 → PASS
- [ ] 하나라도 실패 → FAIL

#### Lv2 테스트
- [ ] 클럽 패스 < -1.5° → FAIL (SLICE)
- [ ] 클럽 패스 > +1.5° → FAIL (SLICE)
- [ ] 클럽 패스 -1.5° ~ +1.5° → PASS
- [ ] 리듬 변동 > 0.12 → FAIL (RHYTHM_UNSTABLE)
- [ ] 리듬 변동 ≤ 0.12 → PASS
- [ ] 두 기준 모두 통과 → PASS

#### Lv3 테스트
- [ ] 체중 이동 < 60% → FAIL (FAT_SHOT)
- [ ] 체중 이동 ≥ 60% → PASS
- [ ] 임팩트 각도 < -4° → FAIL (TOPPING)
- [ ] 임팩트 각도 ≥ -4° → PASS
- [ ] 두 기준 모두 통과 → PASS

#### 엣지 케이스
- [ ] 지표가 undefined/null → FAIL
- [ ] 알 수 없는 레벨 → FAIL
- [ ] 모든 지표가 경계값 → 정확한 판정

### 2. 피드백 생성 테스트

**파일**: `backend/src/utils/__tests__/llmFeedback.test.ts`

- [ ] PASS 시 피드백 형식 검증
- [ ] FAIL 시 문제/이유/연습 내용 포함 검증
- [ ] LLM API 실패 시 폴백 피드백 사용
- [ ] API 키 없을 때 폴백 피드백 사용
- [ ] 각 FailureType별 피드백 내용 검증
- [ ] 피드백에 수치 정보 포함 검증

### 3. Day Sheet 저장/로드 테스트

**파일**: `frontend/app/lib/__tests__/storage.test.ts`

- [ ] 초기 진행 상태 생성
- [ ] Day Sheet 항목 저장
- [ ] Day Sheet 항목 로드
- [ ] 총 일수 계산
- [ ] 연속 일수 계산
- [ ] PASS 시 다음 레벨로 진행
- [ ] LocalStorage 없을 때 기본값 반환

### 4. API 핸들러 테스트

**파일**: `backend/src/handlers/__tests__/judgmentHandler.test.ts`

- [ ] 영상 파일 업로드 처리
- [ ] AI 엔진 호출
- [ ] 판정 로직 적용
- [ ] 피드백 생성
- [ ] 에러 처리 (AI 엔진 실패)
- [ ] 에러 처리 (파일 없음)
- [ ] 응답 형식 검증

### 5. AI 엔진 분석 테스트

**파일**: `ai-engine/tests/test_analyzer.py`

- [ ] 영상 파일 로드
- [ ] MediaPipe 포즈 추출
- [ ] Lv1 지표 계산 (척추 각도, 그립 강도)
- [ ] Lv2 지표 계산 (클럽 패스, 리듬)
- [ ] Lv3 지표 계산 (체중 이동, 임팩트 각도)
- [ ] 포즈 미감지 시 에러 처리
- [ ] 프레임 부족 시 에러 처리

### 6. 통합 테스트

**파일**: `backend/__tests__/integration/judgment.test.ts`

- [ ] 전체 플로우: 영상 업로드 → 분석 → 판정 → 피드백
- [ ] 각 레벨별 통합 테스트
- [ ] PASS/FAIL 시나리오 검증

### 테스트 작성 원칙

1. **Red First**: 모든 테스트는 먼저 실패해야 함
2. **명확한 실패 메시지**: 실패 이유를 명확히 알 수 있어야 함
3. **경계값 테스트**: 기준값의 경계에서 정확히 동작하는지 확인
4. **엣지 케이스**: null, undefined, 빈 값 등 처리
5. **보수적 기준 검증**: 기준이 절대 완화되지 않는지 확인

### 테스트 실행 명령어

```bash
# Backend 테스트
cd backend
npm test

# Frontend 테스트
cd frontend
npm test

# AI Engine 테스트
cd ai-engine
pytest tests/
```

---

## TDD Green 단계: 테스트 통과를 위한 구현 목록

TDD(Test-Driven Development)의 Green 단계에서 테스트를 통과시키기 위해 구현해야 할 작업 목록입니다. Red 단계에서 작성한 테스트가 모두 통과하도록 최소한의 코드를 작성합니다.

### 0. 테스트 환경 설정

- [x] Backend Jest 설정 (`backend/jest.config.js`) ✅
- [x] Backend 테스트 의존성 설치 (`jest`, `ts-jest`, `@types/jest`) ✅
- [x] Frontend Vitest 설정 (`frontend/vitest.config.ts`) ✅
- [x] Frontend 테스트 의존성 설치 (`vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `jsdom`) ✅
- [x] AI Engine pytest 설정 (`ai-engine/pytest.ini`) ✅
- [x] AI Engine 테스트 의존성 설치 (`pytest`, `pytest-mock`) ✅

### 1. 판정 로직 구현 (규칙 엔진)

**목표**: `backend/src/rules/judgmentRules.ts`의 모든 테스트 통과

#### Lv1 구현
- [x] 척추 각도 변동 > 4° → FAIL (ADDRESS_UNSTABLE) 로직 구현 ✅
- [x] 척추 각도 변동 ≤ 4° → PASS 로직 구현 ✅
- [x] 그립 강도 < 0.75 → FAIL (GRIP_WEAK) 로직 구현 ✅
- [x] 그립 강도 ≥ 0.75 → PASS 로직 구현 ✅
- [x] 두 기준 모두 통과 시 PASS 반환 ✅
- [x] 하나라도 실패 시 FAIL 반환 (우선순위: ADDRESS_UNSTABLE > GRIP_WEAK) ✅

#### Lv2 구현
- [x] 클럽 패스 < -1.5° 또는 > +1.5° → FAIL (SLICE) 로직 구현 ✅
- [x] 클럽 패스 -1.5° ~ +1.5° → PASS 로직 구현 ✅
- [x] 리듬 변동 > 0.12 → FAIL (RHYTHM_UNSTABLE) 로직 구현 ✅
- [x] 리듬 변동 ≤ 0.12 → PASS 로직 구현 ✅
- [x] 두 기준 모두 통과 시 PASS 반환 ✅

#### Lv3 구현
- [x] 체중 이동 < 60% → FAIL (FAT_SHOT) 로직 구현 ✅
- [x] 체중 이동 ≥ 60% → PASS 로직 구현 ✅
- [x] 임팩트 각도 < -4° → FAIL (TOPPING) 로직 구현 ✅
- [x] 임팩트 각도 ≥ -4° → PASS 로직 구현 ✅
- [x] 두 기준 모두 통과 시 PASS 반환 ✅

#### 엣지 케이스 처리
- [x] 지표가 undefined/null일 때 기본값 처리 및 FAIL 반환 ✅
- [x] 알 수 없는 레벨일 때 FAIL 반환 ✅
- [x] 경계값에서 정확한 판정 (4°, 0.75, -1.5°~+1.5°, 0.12, 60%, -4°) ✅

**테스트 결과**: ✅ 모든 테스트 통과 (48/48)

### 2. 피드백 생성 구현

**목표**: `backend/src/utils/llmFeedback.ts`의 모든 테스트 통과

- [x] OpenAI API 클라이언트 초기화 ✅
- [x] PASS 시 피드백 템플릿 구현 ✅
- [x] FAIL 시 문제/이유/연습 내용 포함 피드백 생성 ✅
- [x] LLM API 호출 구현 (프롬프트 생성, 응답 파싱) ✅
- [x] LLM API 실패 시 폴백 피드백 반환 ✅
- [x] API 키 없을 때 폴백 피드백 반환 ✅
- [x] 각 FailureType별 폴백 피드백 템플릿 구현 ✅
  - [x] GRIP_WEAK 피드백 ✅
  - [x] ADDRESS_UNSTABLE 피드백 ✅
  - [x] SLICE 피드백 ✅
  - [x] RHYTHM_UNSTABLE 피드백 ✅
  - [x] FAT_SHOT 피드백 ✅
  - [x] TOPPING 피드백 ✅
- [x] 피드백에 수치 정보 포함 (metrics 값 반영) ✅

**테스트 결과**: ✅ 모든 테스트 통과

### 3. Day Sheet 저장/로드 구현

**목표**: `frontend/app/lib/storage.ts`의 모든 테스트 통과

- [x] `getProgress()` 함수 구현 (초기 상태 반환) ✅
- [x] `saveProgress()` 함수 구현 (LocalStorage 저장) ✅
- [x] `saveDaySheetEntry()` 함수 구현 (항목 추가 및 진행 상태 업데이트) ✅
- [x] `getDaySheets()` 함수 구현 (항목 로드) ✅
- [x] 총 일수 계산 로직 구현 (중복 날짜 제거) ✅
- [x] 연속 일수 계산 로직 구현 (날짜 연속성 검증) ✅
- [x] LocalStorage 없을 때 기본값 반환 (SSR 환경 처리) ✅

**구현 상태**: ✅ 코드 완료 (테스트 파일 작성 완료, 실행 대기)

### 4. API 핸들러 구현

**목표**: `backend/src/handlers/judgmentHandler.ts`의 모든 테스트 통과

- [x] 영상 파일 업로드 처리 (Multer 설정 확인) ✅
- [x] AI 엔진 호출 (axios를 통한 HTTP 요청) ✅
- [x] 판정 로직 적용 (`applyJudgmentRules` 호출) ✅
- [x] 피드백 생성 (`generateFeedbackWithLLM` 호출) ✅
- [x] 응답 형식 구성 (result, failureType, feedback, metrics, timestamp) ✅
- [x] 에러 처리 구현 ✅
  - [x] AI 엔진 실패 시 에러 처리 ✅
  - [x] 파일 없음 시 에러 처리 ✅
  - [x] 타임아웃 처리 (30초) ✅

**테스트 결과**: ✅ 모든 테스트 통과

### 5. AI 엔진 분석 구현

**목표**: `ai-engine/analyzer.py`의 모든 테스트 통과

- [x] MediaPipe Pose 초기화 ✅
- [x] 영상 파일 로드 (`cv2.VideoCapture`) ✅
- [x] 프레임별 포즈 추출 (`pose.process()`) ✅
- [x] 랜드마크 추출 (`_extract_landmarks()`) ✅
- [x] Lv1 지표 계산 구현 ✅
  - [x] 척추 각도 변동 계산 (`_calculate_spine_angle_variance()`) ✅
  - [x] 그립 강도 추정 (`_estimate_grip_strength()`) ✅
- [x] Lv2 지표 계산 구현 ✅
  - [x] 클럽 패스 추정 (`_estimate_club_path()`) ✅
  - [x] 리듬 변동 계산 (`_calculate_rhythm_variance()`) ✅
- [x] Lv3 지표 계산 구현 ✅
  - [x] 체중 이동 계산 (`_calculate_weight_shift()`) ✅
  - [x] 임팩트 각도 추정 (`_estimate_impact_angle()`) ✅
- [x] 에러 처리 구현 ✅
  - [x] 포즈 미감지 시 에러 발생 ✅
  - [x] 프레임 부족 시 에러 발생 (10개 미만) ✅

**구현 상태**: ✅ 코드 완료 (테스트 파일 작성 완료, 실행 대기)

### 6. 통합 테스트 통과

**목표**: `backend/__tests__/integration/judgment.test.ts`의 모든 테스트 통과

- [x] 전체 플로우 구현 확인 ✅
  - [x] 영상 업로드 → AI 엔진 분석 → 판정 → 피드백 ✅
- [x] 각 레벨별 통합 테스트 통과 ✅
  - [x] Lv1 통합 테스트 ✅
  - [x] Lv2 통합 테스트 ✅
  - [x] Lv3 통합 테스트 ✅
- [x] PASS/FAIL 시나리오 검증 ✅
  - [x] PASS 시나리오 (모든 기준 통과) ✅
  - [x] FAIL 시나리오 (하나라도 실패) ✅

**테스트 결과**: ✅ 모든 테스트 통과

### 구현 원칙

1. **최소한의 코드**: 테스트를 통과시키는 최소한의 코드만 작성
2. **보수적 기준 유지**: 판정 기준을 절대 완화하지 않음
3. **에러 처리**: 모든 엣지 케이스에 대한 에러 처리 구현
4. **타입 안정성**: TypeScript 타입 정의 준수
5. **테스트 우선**: 각 구현 후 즉시 테스트 실행하여 통과 확인

### 구현 순서 권장

1. **테스트 환경 설정** (0번)
2. **판정 로직 구현** (1번) - 가장 핵심적인 로직
3. **피드백 생성 구현** (2번) - 판정 결과 활용
4. **Day Sheet 저장/로드 구현** (3번) - 독립적인 기능
5. **API 핸들러 구현** (4번) - 1, 2번 통합
6. **AI 엔진 분석 구현** (5번) - 독립적인 기능
7. **통합 테스트 통과** (6번) - 전체 플로우 검증

### 테스트 실행 및 확인

각 구현 단계마다 테스트를 실행하여 통과 여부를 확인합니다:

```bash
# Backend 테스트 실행
cd backend
npm test

# Frontend 테스트 실행
cd frontend
npm test

# AI Engine 테스트 실행
cd ai-engine
pytest tests/ -v

# 모든 테스트 통과 확인
# 모든 체크박스가 체크되면 Green 단계 완료
```

