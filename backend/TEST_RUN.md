# Backend 테스트 실행 가이드

## 사전 요구사항

1. Node.js 18+ 설치
2. npm 또는 yarn 설치

## 테스트 실행 방법

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 테스트 실행

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 실행
npm run test:watch

# 특정 테스트 파일만 실행
npm test -- src/rules/__tests__/judgmentRules.test.ts
```

## 테스트 파일 목록

1. **판정 로직 테스트**: `src/rules/__tests__/judgmentRules.test.ts`
   - Lv1, Lv2, Lv3 각 레벨별 판정 로직
   - 엣지 케이스 처리

2. **피드백 생성 테스트**: `src/utils/__tests__/llmFeedback.test.ts`
   - LLM API 통합
   - 폴백 피드백 처리

3. **API 핸들러 테스트**: `src/handlers/__tests__/judgmentHandler.test.ts`
   - 영상 업로드 처리
   - AI 엔진 호출
   - 에러 처리

4. **통합 테스트**: `__tests__/integration/judgment.test.ts`
   - 전체 플로우 검증
   - 레벨별 통합 테스트

## 예상 결과

모든 테스트가 통과해야 합니다:
- ✅ 판정 로직 테스트: 모든 경계값 및 엣지 케이스 통과
- ✅ 피드백 생성 테스트: 폴백 피드백 정상 동작
- ✅ API 핸들러 테스트: 모킹된 요청/응답 처리
- ✅ 통합 테스트: 전체 플로우 검증

## 문제 해결

### PowerShell 실행 정책 오류

PowerShell에서 npm 실행이 차단되는 경우:

```powershell
# 실행 정책 확인
Get-ExecutionPolicy

# 실행 정책 변경 (관리자 권한 필요)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

또는 CMD를 사용:
```cmd
cd backend
npm install
npm test
```

### 모듈을 찾을 수 없는 오류

```bash
# node_modules 재설치
rm -rf node_modules
npm install
```

### TypeScript 컴파일 오류

```bash
# TypeScript 빌드
npm run build
```



