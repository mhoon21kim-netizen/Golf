"""
AI 판정 엔진
MediaPipe Pose를 사용한 골프 스윙 분석
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
import tempfile
import os
from typing import Dict, Any
from analyzer import GolfSwingAnalyzer

app = Flask(__name__)
CORS(app)

# MediaPipe 초기화
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

analyzer = GolfSwingAnalyzer()


def _get_dummy_metrics(level: int) -> Dict[str, Any]:
    """개발/테스트용 더미 지표 생성"""
    if level == 1:
        return {
            'spine_angle_variance': 3.5,  # PASS (≤4°)
            'grip_strength': 0.8,  # PASS (≥0.75)
        }
    elif level == 2:
        return {
            'club_path': 0.5,  # PASS (-1.5° ~ +1.5°)
            'rhythm_variance': 0.1,  # PASS (≤0.12)
        }
    elif level == 3:
        return {
            'weight_shift': 65,  # PASS (≥60%)
            'impact_angle': -3,  # PASS (≥-4°)
        }
    return {}


@app.route('/health', methods=['GET'])
def health():
    """헬스 체크"""
    return jsonify({'status': 'ok', 'service': 'ai-engine'})


@app.route('/analyze', methods=['POST'])
def analyze():
    """골프 스윙 영상 분석"""
    try:
        if 'video' not in request.files:
            return jsonify({'error': '비디오 파일이 필요합니다.'}), 400

        video_file = request.files['video']
        level = int(request.form.get('level', 1))
        
        # 개발 모드: 더미 데이터 반환 옵션
        use_dummy = request.form.get('use_dummy', 'false').lower() == 'true'
        
        if use_dummy:
            # 개발/테스트용 더미 데이터 반환
            dummy_metrics = _get_dummy_metrics(level)
            return jsonify({
                'metrics': dummy_metrics,
                'level': level,
            })

        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp_file:
            video_file.save(tmp_file.name)
            video_path = tmp_file.name

        try:
            # 영상 분석
            metrics = analyzer.analyze_video(video_path, level)

            # 결과 반환
            result = {
                'metrics': metrics,
                'level': level,
            }

            return jsonify(result)
        finally:
            # 임시 파일 삭제
            if os.path.exists(video_path):
                os.unlink(video_path)

    except ValueError as e:
        # 프레임 부족 등 분석 오류
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        # 기타 서버 오류
        print(f'서버 오류: {str(e)}')
        return jsonify({'error': f'서버 오류: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

