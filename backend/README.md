# 백엔드 API 서버

골프 코치 백엔드 API 서버

## 설치

```bash
npm install
```

## 실행

### 개발 모드
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm run build
npm start
```

기본 포트: 3001

## 환경 변수

- `PORT`: 서버 포트 (기본값: 3001)
- `AI_ENGINE_URL`: AI 엔진 URL (기본값: http://localhost:5000)

## API

### GET /health

헬스 체크

### POST /api/judgment

골프 스윙 판정

**요청:**
- `video`: 비디오 파일 (multipart/form-data)
- `level`: 레벨 (1, 2, 3)

**응답:**
```json
{
  "result": "PASS",
  "failureType": "NONE",
  "feedback": {
    "problem": "",
    "reason": "",
    "todayPractice": "다음 단계로 진행하세요."
  },
  "metrics": {
    "spine_angle_variance": 3.2
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

