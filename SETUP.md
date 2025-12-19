# 설치 및 실행 가이드

## 사전 요구사항

- Node.js 18+ 
- Python 3.10+
- npm 또는 yarn
- pip

## 전체 설치 및 실행

### 1. 프론트엔드 설정

```bash
cd frontend
npm install
```

환경 변수 설정 (선택사항):
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. 백엔드 설정

```bash
cd backend
npm install
```

환경 변수 설정 (선택사항):
```bash
# backend/.env
PORT=3001
AI_ENGINE_URL=http://localhost:5000
```

### 3. AI 엔진 설정

```bash
cd ai-engine
pip install -r requirements.txt
```

환경 변수 설정 (선택사항):
```bash
# ai-engine/.env
PORT=5000
```

## 실행 순서

### 1. AI 엔진 시작 (포트 5000)

```bash
cd ai-engine
python app.py
```

### 2. 백엔드 시작 (포트 3001)

```bash
cd backend
npm run dev
```

### 3. 프론트엔드 시작 (포트 3000)

```bash
cd frontend
npm run dev
```

### 4. 브라우저에서 접속

```
http://localhost:3000
```

## 개발 모드

각 서비스를 별도 터미널에서 실행하거나, 프로세스 매니저 사용:

### Windows (PowerShell)

```powershell
# AI 엔진
Start-Process python -ArgumentList "ai-engine/app.py"

# 백엔드
Start-Process npm -ArgumentList "run dev" -WorkingDirectory "backend"

# 프론트엔드
Start-Process npm -ArgumentList "run dev" -WorkingDirectory "frontend"
```

### Linux/Mac

```bash
# AI 엔진
cd ai-engine && python app.py &

# 백엔드
cd backend && npm run dev &

# 프론트엔드
cd frontend && npm run dev &
```

## 문제 해결

### 포트 충돌
- 각 서비스의 포트가 사용 중인 경우 `.env` 파일에서 포트 변경

### MediaPipe 설치 오류
```bash
# Windows
pip install --upgrade pip
pip install mediapipe

# 또는
pip install mediapipe --no-deps
pip install opencv-python numpy protobuf
```

### CORS 오류
- 백엔드와 AI 엔진의 CORS 설정 확인
- 프론트엔드 URL이 허용 목록에 있는지 확인

### 영상 업로드 실패
- 파일 크기 제한 확인 (백엔드: 100MB)
- 업로드 디렉토리 권한 확인 (`backend/uploads/`)

## 프로덕션 빌드

### 프론트엔드
```bash
cd frontend
npm run build
npm start
```

### 백엔드
```bash
cd backend
npm run build
npm start
```

### AI 엔진
```bash
cd ai-engine
# gunicorn 사용 권장
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

