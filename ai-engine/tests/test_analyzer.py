"""
AI 엔진 분석 테스트
TDD Green 단계: 테스트를 통과시키기 위한 구현
"""

import pytest
import sys
import os
from unittest.mock import Mock, patch, MagicMock
import numpy as np

# 상위 디렉토리를 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from analyzer import GolfSwingAnalyzer


class TestGolfSwingAnalyzer:
    """골프 스윙 분석기 테스트"""

    @pytest.fixture
    def analyzer(self):
        """분석기 인스턴스 생성"""
        return GolfSwingAnalyzer()

    @pytest.fixture
    def mock_video_path(self, tmp_path):
        """임시 비디오 파일 경로"""
        return str(tmp_path / "test_video.mp4")

    def test_영상_파일_로드(self, analyzer, mock_video_path):
        """영상 파일 로드 테스트"""
        # 실제 파일이 없으므로 실패해야 함
        with pytest.raises(ValueError, match="영상을 열 수 없습니다"):
            analyzer.analyze_video(mock_video_path, 1)

    @patch('cv2.VideoCapture')
    def test_MediaPipe_포즈_추출(self, mock_video_capture, analyzer):
        """MediaPipe 포즈 추출 테스트"""
        # VideoCapture 모킹
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        mock_cap.read.side_effect = [
            (True, np.zeros((480, 640, 3), dtype=np.uint8)),
            (False, None),
        ]
        mock_video_capture.return_value = mock_cap

        # 포즈 처리 모킹
        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = MagicMock()
            mock_landmarks.landmark = []
            for i in range(33):  # MediaPipe Pose는 33개 랜드마크
                landmark = MagicMock()
                landmark.x = 0.5
                landmark.y = 0.5
                landmark.z = 0.0
                mock_landmarks.landmark.append(landmark)

            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            # 프레임이 부족하면 실패해야 함
            with pytest.raises(ValueError, match="분석할 수 있는 프레임이 부족합니다"):
                analyzer.analyze_video("test.mp4", 1)

    @patch('cv2.VideoCapture')
    def test_Lv1_지표_계산_척추_각도(self, mock_video_capture, analyzer):
        """Lv1 지표 계산: 척추 각도"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        # 충분한 프레임 생성
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 1)
            
            assert 'spine_angle_variance' in metrics
            assert isinstance(metrics['spine_angle_variance'], (int, float))

    @patch('cv2.VideoCapture')
    def test_Lv1_지표_계산_그립_강도(self, mock_video_capture, analyzer):
        """Lv1 지표 계산: 그립 강도"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 1)
            
            assert 'grip_strength' in metrics
            assert isinstance(metrics['grip_strength'], (int, float))
            assert 0 <= metrics['grip_strength'] <= 1

    @patch('cv2.VideoCapture')
    def test_Lv2_지표_계산_클럽_패스(self, mock_video_capture, analyzer):
        """Lv2 지표 계산: 클럽 패스"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 2)
            
            assert 'club_path' in metrics
            assert isinstance(metrics['club_path'], (int, float))

    @patch('cv2.VideoCapture')
    def test_Lv2_지표_계산_리듬(self, mock_video_capture, analyzer):
        """Lv2 지표 계산: 리듬"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 2)
            
            assert 'rhythm_variance' in metrics
            assert isinstance(metrics['rhythm_variance'], (int, float))
            assert metrics['rhythm_variance'] >= 0

    @patch('cv2.VideoCapture')
    def test_Lv3_지표_계산_체중_이동(self, mock_video_capture, analyzer):
        """Lv3 지표 계산: 체중 이동"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 3)
            
            assert 'weight_shift' in metrics
            assert isinstance(metrics['weight_shift'], (int, float))
            assert 0 <= metrics['weight_shift'] <= 100

    @patch('cv2.VideoCapture')
    def test_Lv3_지표_계산_임팩트_각도(self, mock_video_capture, analyzer):
        """Lv3 지표 계산: 임팩트 각도"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(20):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            metrics = analyzer.analyze_video("test.mp4", 3)
            
            assert 'impact_angle' in metrics
            assert isinstance(metrics['impact_angle'], (int, float))

    @patch('cv2.VideoCapture')
    def test_포즈_미감지_시_에러_처리(self, mock_video_capture, analyzer):
        """포즈 미감지 시 에러 처리"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        frames = []
        for _ in range(5):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            # 포즈 미감지 (pose_landmarks = None)
            mock_result = MagicMock()
            mock_result.pose_landmarks = None
            mock_process.return_value = mock_result

            with pytest.raises(ValueError, match="분석할 수 있는 프레임이 부족합니다"):
                analyzer.analyze_video("test.mp4", 1)

    @patch('cv2.VideoCapture')
    def test_프레임_부족_시_에러_처리(self, mock_video_capture, analyzer):
        """프레임 부족 시 에러 처리"""
        mock_cap = MagicMock()
        mock_cap.isOpened.return_value = True
        
        # 프레임이 5개만 있음 (10개 미만)
        frames = []
        for _ in range(5):
            frames.append((True, np.zeros((480, 640, 3), dtype=np.uint8)))
        frames.append((False, None))
        mock_cap.read.side_effect = frames
        mock_video_capture.return_value = mock_cap

        with patch.object(analyzer.pose, 'process') as mock_process:
            mock_landmarks = self._create_mock_landmarks()
            mock_result = MagicMock()
            mock_result.pose_landmarks = mock_landmarks
            mock_process.return_value = mock_result

            with pytest.raises(ValueError, match="분석할 수 있는 프레임이 부족합니다"):
                analyzer.analyze_video("test.mp4", 1)

    def _create_mock_landmarks(self):
        """모킹된 랜드마크 생성"""
        mock_landmarks = MagicMock()
        mock_landmarks.landmark = []
        
        # 필요한 랜드마크 인덱스
        landmark_indices = {
            0: 'nose',
            11: 'left_shoulder',
            12: 'right_shoulder',
            13: 'left_elbow',
            14: 'right_elbow',
            15: 'left_wrist',
            16: 'right_wrist',
            23: 'left_hip',
            24: 'right_hip',
            25: 'left_knee',
            26: 'right_knee',
        }
        
        for i in range(33):
            landmark = MagicMock()
            if i in landmark_indices:
                landmark.x = 0.5
                landmark.y = 0.5
                landmark.z = 0.0
            else:
                landmark.x = 0.0
                landmark.y = 0.0
                landmark.z = 0.0
            mock_landmarks.landmark.append(landmark)
        
        return mock_landmarks



