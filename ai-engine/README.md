# AI 판정 엔진

골프 스윙 영상 분석을 위한 Python AI 엔진

## 설치

```bash
pip install -r requirements.txt
```

## 실행

```bash
python app.py
```

기본 포트: 5000

## 환경 변수

- `PORT`: 서버 포트 (기본값: 5000)

## API

### POST /analyze

골프 스윙 영상 분석

**요청:**
- `video`: 비디오 파일 (multipart/form-data)
- `level`: 레벨 (1, 2, 3)

**응답:**
```json
{
  "metrics": {
    "spine_angle_variance": 3.2,
    "grip_strength": 0.85
  },
  "level": 1
}
```

## 분석 지표

### Level 1
- `spine_angle_variance`: 척추 각도 변동 (도)
- `grip_strength`: 그립 강도 (0.0 ~ 1.0)

### Level 2
- `club_path`: 클럽 패스 (도)
- `rhythm_variance`: 리듬 변동 (변동계수)

### Level 3
- `weight_shift`: 체중 이동 (%)
- `impact_angle`: 임팩트 각도 (도)

