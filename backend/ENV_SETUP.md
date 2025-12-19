# 환경 변수 설정

## .env 파일 생성

`backend/` 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 서버 포트
PORT=3001

# AI 엔진 URL
AI_ENGINE_URL=http://localhost:5000

# OpenAI API 설정 (피드백 생성용)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

## OpenAI API 키 발급

1. https://platform.openai.com/ 접속
2. API Keys 메뉴에서 새 키 생성
3. `.env` 파일의 `OPENAI_API_KEY`에 입력

## LLM 없이 사용하기

OpenAI API 키가 없어도 동작합니다. 이 경우 하드코딩된 폴백 피드백이 사용됩니다.

## 모델 선택

- `gpt-4o-mini`: 빠르고 저렴 (권장)
- `gpt-4o`: 더 정확하지만 비용이 높음
- `gpt-3.5-turbo`: 대안

