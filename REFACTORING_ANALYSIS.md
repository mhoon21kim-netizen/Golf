# 리팩토링 단계: 정적 분석, 코드 스멜, SOLID 원칙 분석

## 1. 정적 분석 결과

### 1.1 TypeScript 타입 안정성

#### 발견된 이슈

**위치**: `backend/src/handlers/judgmentHandler.ts:57`
```typescript
catch (error: any) {
```
- **문제**: `any` 타입 사용으로 타입 안정성 저하
- **영향**: 컴파일 타임 타입 체크 불가, 런타임 에러 가능성 증가
- **심각도**: 중간

**위치**: `backend/src/utils/llmFeedback.ts:16`
```typescript
metrics: Record<string, any>
```
- **문제**: `any` 타입 사용
- **영향**: 타입 안정성 저하
- **심각도**: 낮음

**위치**: `frontend/app/page.tsx:58`
```typescript
catch (error: any) {
```
- **문제**: `any` 타입 사용
- **영향**: 타입 안정성 저하
- **심각도**: 낮음

#### 권장 수정

```typescript
// backend/src/handlers/judgmentHandler.ts
catch (error: unknown) {
  if (error instanceof Error) {
    // Error 처리
  } else if (axios.isAxiosError(error)) {
    // Axios 에러 처리
  }
}

// backend/src/utils/llmFeedback.ts
interface Metrics {
  spine_angle_variance?: number
  grip_strength?: number
  // ... 기타 지표
}
metrics: Metrics

// frontend/app/page.tsx
catch (error: unknown) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : '분석 중 오류가 발생했습니다.'
}
```

### 1.2 매직 넘버 및 하드코딩된 값

#### 발견된 이슈

**위치**: `backend/src/rules/judgmentRules.ts`
- **문제**: 판정 기준값이 하드코딩됨
  - Lv1: `4`, `0.75`
  - Lv2: `-1.5`, `1.5`, `0.12`
  - Lv3: `60`, `-4`
- **영향**: 기준 변경 시 코드 수정 필요, 테스트 어려움
- **심각도**: 높음

**위치**: `backend/src/handlers/judgmentHandler.ts:28`
```typescript
timeout: 30000, // 30초 타임아웃
```
- **문제**: 매직 넘버
- **영향**: 낮음

**위치**: `backend/src/index.ts:40`
```typescript
fileSize: 100 * 1024 * 1024, // 100MB
```
- **문제**: 매직 넘버
- **영향**: 낮음

#### 권장 수정

```typescript
// backend/src/rules/judgmentRules.ts
export const JUDGMENT_CRITERIA = {
  Lv1: {
    SPINE_ANGLE_VARIANCE_MAX: 4,
    GRIP_STRENGTH_MIN: 0.75,
  },
  Lv2: {
    CLUB_PATH_MIN: -1.5,
    CLUB_PATH_MAX: 1.5,
    RHYTHM_VARIANCE_MAX: 0.12,
  },
  Lv3: {
    WEIGHT_SHIFT_MIN: 60,
    IMPACT_ANGLE_MIN: -4,
  },
} as const
```

### 1.3 하드코딩된 문자열

#### 발견된 이슈

**위치**: `backend/src/utils/llmFeedback.ts`
- **문제**: 피드백 메시지가 하드코딩됨
- **영향**: 다국어 지원 어려움, 메시지 변경 시 코드 수정 필요
- **심각도**: 중간

#### 권장 수정

```typescript
// backend/src/utils/feedbackMessages.ts
export const FEEDBACK_MESSAGES = {
  GRIP_WEAK: {
    problem: '그립이 약합니다',
    reason: (strength: number) => `그립 강도 ${strength.toFixed(2)} (기준: ≥0.75)`,
    todayPractice: '그립을 더 단단히 잡고 연습하세요.',
  },
  // ... 기타 메시지
}
```

### 1.4 에러 처리 일관성

#### 발견된 이슈

**위치**: 여러 파일
- **문제**: 에러 처리 패턴이 일관되지 않음
- **영향**: 디버깅 어려움, 사용자 경험 저하
- **심각도**: 중간

#### 권장 수정

```typescript
// backend/src/utils/errors.ts
export class JudgmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'JudgmentError'
  }
}

// 공통 에러 처리 미들웨어
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof JudgmentError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code })
  }
  // ... 기타 에러 처리
}
```

## 2. 코드 스멜 분석

### 2.1 긴 함수 (Long Method)

#### 발견된 이슈

**위치**: `ai-engine/analyzer.py`
- `_calculate_metrics()`: 30줄 이상
- `_estimate_club_path()`: 복잡한 로직
- **영향**: 가독성 저하, 테스트 어려움
- **심각도**: 중간

#### 권장 수정

```python
# 메서드를 더 작은 단위로 분리
def _calculate_metrics(self, frames_data: List[Dict], level: int) -> Dict[str, Any]:
    valid_frames = self._get_valid_frames(frames_data)
    calculator = self._get_metric_calculator(level)
    return calculator.calculate(valid_frames)
```

### 2.2 중복 코드 (Duplicated Code)

#### 발견된 이슈

**위치**: `backend/src/rules/judgmentRules.ts`
- **문제**: 각 레벨별 판정 로직이 유사한 패턴 반복
- **영향**: 유지보수 어려움, 버그 발생 가능성 증가
- **심각도**: 높음

#### 권장 수정

```typescript
// 전략 패턴 적용
interface LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput
}

class Lv1JudgmentStrategy implements LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput {
    // Lv1 판정 로직
  }
}
```

### 2.3 복잡한 조건문 (Complex Conditionals)

#### 발견된 이슈

**위치**: `backend/src/rules/judgmentRules.ts:29-119`
- **문제**: 긴 if-else 체인
- **영향**: 가독성 저하, 확장성 저하
- **심각도**: 중간

#### 권장 수정

```typescript
// 팩토리 패턴 + 전략 패턴
const strategies: Record<Level, LevelJudgmentStrategy> = {
  [Level.Lv1]: new Lv1JudgmentStrategy(),
  [Level.Lv2]: new Lv2JudgmentStrategy(),
  [Level.Lv3]: new Lv3JudgmentStrategy(),
}

export function applyJudgmentRules(level: Level, metrics: Metrics): JudgmentOutput {
  const strategy = strategies[level]
  if (!strategy) {
    return { result: JudgmentResult.FAIL, failureType: FailureType.NONE }
  }
  return strategy.evaluate(metrics)
}
```

### 2.4 책임 분리 부족

#### 발견된 이슈

**위치**: `backend/src/index.ts`
- **문제**: 서버 설정, 미들웨어, 라우트 핸들러가 한 파일에 있음
- **영향**: 단일 책임 원칙 위반, 테스트 어려움
- **심각도**: 높음

#### 권장 수정

```typescript
// backend/src/routes/judgmentRoutes.ts
export function createJudgmentRouter() {
  const router = express.Router()
  router.post('/', upload.single('video'), judgmentController.handle)
  return router
}

// backend/src/index.ts
app.use('/api/judgment', createJudgmentRouter())
```

## 3. SOLID 원칙 분석

### 3.1 단일 책임 원칙 (SRP) 위반

#### 발견된 이슈

**위치**: `backend/src/index.ts`
- **문제**: 서버 설정, 미들웨어 설정, 라우트 핸들러가 모두 포함됨
- **영향**: 변경 시 여러 이유로 수정 필요
- **심각도**: 높음

**위치**: `frontend/app/page.tsx`
- **문제**: 상태 관리, UI 렌더링, 비즈니스 로직이 모두 포함됨
- **영향**: 컴포넌트 복잡도 증가, 재사용 어려움
- **심각도**: 중간

#### 권장 수정

```typescript
// backend/src/config/server.ts
export function createServer() {
  const app = express()
  // 미들웨어 설정
  return app
}

// backend/src/routes/index.ts
export function setupRoutes(app: Express) {
  app.use('/api/judgment', judgmentRoutes)
}

// frontend/app/components/HomePage.tsx
export function HomePage() {
  // UI만 담당
}

// frontend/app/hooks/useVideoAnalysis.ts
export function useVideoAnalysis() {
  // 비즈니스 로직만 담당
}
```

### 3.2 개방-폐쇄 원칙 (OCP) 위반

#### 발견된 이슈

**위치**: `backend/src/rules/judgmentRules.ts`
- **문제**: 새로운 레벨 추가 시 `applyJudgmentRules` 함수 수정 필요
- **영향**: 확장성 저하, 기존 코드 수정 위험
- **심각도**: 높음

#### 권장 수정

```typescript
// 전략 패턴 적용 (위의 코드 스멜 섹션 참조)
// 새로운 레벨 추가 시 새로운 전략 클래스만 추가하면 됨
```

### 3.3 리스코프 치환 원칙 (LSP)

#### 상태: ✅ 준수
- 인터페이스 구현이 적절함
- 상속 구조가 없어 직접적인 위반 없음

### 3.4 인터페이스 분리 원칙 (ISP)

#### 상태: ✅ 준수
- 인터페이스가 적절히 분리되어 있음
- 불필요한 의존성 없음

### 3.5 의존성 역전 원칙 (DIP) 위반

#### 발견된 이슈

**위치**: `backend/src/handlers/judgmentHandler.ts`
- **문제**: `axios`에 직접 의존
- **영향**: 테스트 어려움, 다른 HTTP 클라이언트로 교체 어려움
- **심각도**: 중간

#### 권장 수정

```typescript
// backend/src/interfaces/HttpClient.ts
export interface HttpClient {
  post(url: string, data: any, config?: any): Promise<any>
}

// backend/src/handlers/judgmentHandler.ts
export function judgmentHandler(
  level: Level,
  videoPath: string,
  httpClient: HttpClient = axios
): Promise<JudgmentResponse> {
  // httpClient 사용
}
```

## 4. 리팩토링 우선순위

### 높은 우선순위
1. ✅ **매직 넘버 제거** - 판정 기준값을 상수로 추출
2. ✅ **라우트 핸들러 분리** - `index.ts`에서 라우트 분리
3. ✅ **전략 패턴 적용** - 레벨별 판정 로직 리팩토링
4. ✅ **타입 안정성 개선** - `any` 타입 제거

### 중간 우선순위
5. ✅ **에러 처리 통일** - 공통 에러 처리 미들웨어
6. ✅ **컴포넌트 분리** - `page.tsx`를 더 작은 컴포넌트로 분리
7. ✅ **의존성 주입** - HTTP 클라이언트 인터페이스화

### 낮은 우선순위
8. ✅ **하드코딩된 문자열 제거** - 메시지 파일 분리
9. ✅ **긴 함수 분리** - `analyzer.py` 메서드 분리

## 5. 리팩토링 체크리스트

### Backend
- [x] 매직 넘버를 상수로 추출 (`JUDGMENT_CRITERIA`) ✅
- [x] 라우트 핸들러를 별도 파일로 분리 ✅
- [x] 전략 패턴으로 판정 로직 리팩토링 ✅
- [x] `any` 타입을 구체적인 타입으로 변경 ✅
- [x] 공통 에러 처리 미들웨어 생성 ✅
- [x] HTTP 클라이언트 인터페이스화 ✅

### Frontend
- [ ] `page.tsx`를 더 작은 컴포넌트로 분리 (선택사항)
- [ ] 커스텀 훅으로 비즈니스 로직 분리 (선택사항)
- [x] `any` 타입 제거 ✅

### AI Engine
- [ ] 긴 메서드를 더 작은 단위로 분리
- [ ] 메트릭 계산 로직을 전략 패턴으로 리팩토링

## 6. 예상 효과

### 코드 품질 향상
- 타입 안정성 향상
- 가독성 향상
- 유지보수성 향상

### 테스트 용이성 향상
- 의존성 주입으로 모킹 용이
- 작은 단위로 분리되어 테스트 작성 용이

### 확장성 향상
- 새로운 레벨 추가 시 기존 코드 수정 불필요
- 새로운 기능 추가 용이

