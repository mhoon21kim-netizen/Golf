# AI 엔진 설치 가이드

## 문제 해결: ModuleNotFoundError

Flask나 다른 모듈을 찾을 수 없는 경우, 다음 단계를 따라주세요.

## 설치 방법

### 1. Python 버전 확인
```bash
python --version
# Python 3.10 이상이어야 합니다
```

### 2. 의존성 설치
```bash
cd ai-engine
pip install -r requirements.txt
```

### 3. 가상환경 사용 (권장)

#### Windows
```bash
# 가상환경 생성
python -m venv venv

# 가상환경 활성화
venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt
```

#### Linux/Mac
```bash
# 가상환경 생성
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt
```

### 4. 설치 확인
```bash
pip list | findstr flask
# 또는
pip show flask
```

## 문제 해결

### MediaPipe 설치 오류
```bash
# Windows
pip install --upgrade pip
pip install mediapipe

# 또는
pip install mediapipe --no-deps
pip install opencv-python numpy protobuf
```

### OpenCV 설치 오류
```bash
pip install --upgrade pip
pip install opencv-python
```

### 권한 오류
```bash
# 사용자 디렉토리에 설치
pip install --user -r requirements.txt
```

## 실행
```bash
cd ai-engine
python app.py
```



