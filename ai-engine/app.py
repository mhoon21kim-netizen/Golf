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

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

