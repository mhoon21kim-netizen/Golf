# 핵심 컴포넌트

## 1. FailureType Enum

**위치**: `shared/types.ts`

```typescript
export enum FailureType {
  NONE = 'NONE',
  GRIP_WEAK = 'GRIP_WEAK',              // Lv1: 그립 약함
  ADDRESS_UNSTABLE = 'ADDRESS_UNSTABLE', // Lv1: 어드레스 불안정
  SLICE = 'SLICE',                      // Lv2: 슬라이스
  RHYTHM_UNSTABLE = 'RHYTHM_UNSTABLE',  // Lv2: 리듬 불안정
  FAT_SHOT = 'FAT_SHOT',                // Lv3: 팻 샷
  TOPPING = 'TOPPING',                  // Lv3: 토핑
}
```

### 사용 규칙
- 판정 결과가 FAIL일 때 하나의 FailureType만 선택
- 우선순위: 각 레벨별로 첫 번째 기준 실패가 우선

---

## 2. 판정 로직 함수

**위치**: `backend/src/rules/judgmentRules.ts`

### 함수 시그니처
```typescript
export function applyJudgmentRules(
  level: Level,
  metrics: Metrics
): JudgmentOutput
```

### 판정 기준 (보수적)

#### Level 1: 그립 & 어드레스 안정
- 척추 각도 변동: **≤ 4°** → FAIL (ADDRESS_UNSTABLE)
- 그립 강도: **≥ 0.75** → FAIL (GRIP_WEAK)
- 모든 기준 통과 → PASS

#### Level 2: 스윙 궤도 & 리듬
- 클럽 패스: **-1.5° ~ +1.5°** → FAIL (SLICE)
- 리듬 변동: **≤ 0.12** → FAIL (RHYTHM_UNSTABLE)
- 모든 기준 통과 → PASS

#### Level 3: 아이언 임팩트
- 체중 이동: **≥ 60%** → FAIL (FAT_SHOT)
- 임팩트 각도: **≥ -4°** → FAIL (TOPPING)
- 모든 기준 통과 → PASS

### 특징
- **규칙 엔진 기반**: 수치 기반 객관적 판정
- **보수적 기준**: 절대 완화하지 않음
- **하나라도 FAIL이면 FAIL**: 모든 기준 통과해야 PASS

---

## 3. Day Sheet 데이터 모델

**위치**: `shared/types.ts`

### DaySheetEntry 인터페이스
```typescript
export interface DaySheetEntry {
  date: string;              // ISO 날짜 (YYYY-MM-DD)
  level: Level;               // 레벨 (1, 2, 3)
  result: JudgmentResult;      // PASS 또는 FAIL
  failureType: FailureType;   // 실패 타입 (PASS면 NONE)
  attemptCount: number;        // 시도 횟수
}
```

### UserProgress 인터페이스
```typescript
export interface UserProgress {
  currentLevel: Level;         // 현재 레벨
  daySheets: DaySheetEntry[];  // Day Sheet 기록 배열
  totalDays: number;            // 총 연습 일수
  consecutiveDays: number;      // 연속 연습 일수
}
```

### 저장 위치
- **프론트엔드**: LocalStorage
  - 키: `golf_coach_progress`, `golf_coach_day_sheets`
- **백엔드**: 파일 시스템 또는 메모리 (현재 미구현)

### 사용 예시
```typescript
const entry: DaySheetEntry = {
  date: '2024-01-15',
  level: Level.Lv1,
  result: JudgmentResult.FAIL,
  failureType: FailureType.GRIP_WEAK,
  attemptCount: 1,
}
```

---

## 4. UI 최소 기능

### 메인 페이지 (`frontend/app/page.tsx`)
- 현재 레벨 표시
- 영상 업로드
- 판정 결과 표시
- 최근 기록 (최대 5개)

### 컴포넌트

#### VideoUpload
- 영상 선택 버튼
- 미리보기
- 분석 버튼

#### JudgmentResultDisplay
- 판정 결과 (PASS/FAIL)
- 문제 및 이유 (FAIL 시)
- 오늘 연습 내용

#### DaySheet
- 최근 5개 기록만 표시
- 날짜, 레벨, 결과만 표시

### 제거된 기능
- 진행 바 (ProgressBar)
- 상세 통계
- 히스토리 전체 조회
- 복잡한 스타일링

---

## 파일 구조 요약

```
shared/types.ts                    # FailureType, DaySheetEntry 등
backend/src/rules/judgmentRules.ts  # 판정 로직 함수
frontend/app/page.tsx               # 메인 UI (최소 기능)
frontend/app/components/            # UI 컴포넌트
frontend/app/lib/storage.ts         # Day Sheet 저장/로드
```

