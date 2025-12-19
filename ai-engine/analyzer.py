"""
골프 스윙 분석기
MediaPipe Pose를 사용하여 스윙 지표 추출
"""

import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, Any, List, Tuple


class GolfSwingAnalyzer:
    """골프 스윙 분석 클래스"""

    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

    def analyze_video(self, video_path: str, level: int) -> Dict[str, Any]:
        """
        영상 분석 및 지표 추출

        Args:
            video_path: 영상 파일 경로
            level: 현재 레벨 (1, 2, 3)

        Returns:
            분석 지표 딕셔너리
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError('영상을 열 수 없습니다.')

        frames_data = []
        frame_count = 0

        # 프레임별 포즈 데이터 수집
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.pose.process(frame_rgb)

            if results.pose_landmarks:
                landmarks = self._extract_landmarks(results.pose_landmarks)
                frames_data.append(landmarks)
            else:
                frames_data.append(None)

            frame_count += 1

        cap.release()

        if len(frames_data) == 0:
            raise ValueError('포즈를 감지할 수 없습니다.')

        # 레벨별 지표 계산
        metrics = self._calculate_metrics(frames_data, level)

        return metrics

    def _extract_landmarks(
        self, pose_landmarks: Any
    ) -> Dict[str, Tuple[float, float, float]]:
        """포즈 랜드마크 추출"""
        landmarks = {}
        landmark_names = {
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

        for idx, name in landmark_names.items():
            landmark = pose_landmarks.landmark[idx]
            landmarks[name] = (landmark.x, landmark.y, landmark.z)

        return landmarks

    def _calculate_metrics(
        self, frames_data: List[Dict], level: int
    ) -> Dict[str, Any]:
        """레벨별 지표 계산"""
        metrics: Dict[str, Any] = {}

        # 유효한 프레임만 필터링
        valid_frames = [f for f in frames_data if f is not None]
        if len(valid_frames) < 10:
            raise ValueError('분석할 수 있는 프레임이 부족합니다.')

        if level == 1:
            # Lv1: 그립 & 어드레스 안정
            metrics['spine_angle_variance'] = self._calculate_spine_angle_variance(
                valid_frames
            )
            metrics['grip_strength'] = self._estimate_grip_strength(valid_frames)

        elif level == 2:
            # Lv2: 스윙 궤도 & 리듬
            metrics['club_path'] = self._estimate_club_path(valid_frames)
            metrics['rhythm_variance'] = self._calculate_rhythm_variance(valid_frames)

        elif level == 3:
            # Lv3: 아이언 임팩트
            metrics['weight_shift'] = self._calculate_weight_shift(valid_frames)
            metrics['impact_angle'] = self._estimate_impact_angle(valid_frames)

        return metrics

    def _calculate_spine_angle_variance(
        self, frames: List[Dict]
    ) -> float:
        """척추 각도 변동 계산 (Lv1)"""
        angles = []
        for frame in frames:
            left_shoulder = frame.get('left_shoulder')
            right_shoulder = frame.get('right_shoulder')
            left_hip = frame.get('left_hip')
            right_hip = frame.get('right_hip')

            if all([left_shoulder, right_shoulder, left_hip, right_hip]):
                # 어깨 중심점
                shoulder_center = (
                    (left_shoulder[0] + right_shoulder[0]) / 2,
                    (left_shoulder[1] + right_shoulder[1]) / 2,
                )
                # 엉덩이 중심점
                hip_center = (
                    (left_hip[0] + right_hip[0]) / 2,
                    (left_hip[1] + right_hip[1]) / 2,
                )

                # 척추 각도 계산
                dx = shoulder_center[0] - hip_center[0]
                dy = shoulder_center[1] - hip_center[1]
                angle = np.degrees(np.arctan2(dy, dx))
                angles.append(angle)

        if len(angles) < 2:
            return 999.0  # 실패 값

        return float(np.std(angles))

    def _estimate_grip_strength(self, frames: List[Dict]) -> float:
        """그립 강도 추정 (Lv1)"""
        # 손목과 어깨 거리 기반 추정
        distances = []
        for frame in frames:
            left_wrist = frame.get('left_wrist')
            right_wrist = frame.get('right_wrist')
            left_shoulder = frame.get('left_shoulder')
            right_shoulder = frame.get('right_shoulder')

            if all([left_wrist, right_wrist, left_shoulder, right_shoulder]):
                # 양손 거리
                hand_distance = np.sqrt(
                    (left_wrist[0] - right_wrist[0]) ** 2
                    + (left_wrist[1] - right_wrist[1]) ** 2
                )
                # 어깨 너비
                shoulder_width = np.sqrt(
                    (left_shoulder[0] - right_shoulder[0]) ** 2
                    + (left_shoulder[1] - right_shoulder[1]) ** 2
                )

                if shoulder_width > 0:
                    ratio = hand_distance / shoulder_width
                    distances.append(ratio)

        if len(distances) == 0:
            return 0.0

        # 정규화 (0.5 ~ 1.0 범위로 가정)
        avg_ratio = np.mean(distances)
        normalized = min(max((avg_ratio - 0.3) / 0.4, 0.0), 1.0)
        return float(normalized)

    def _estimate_club_path(self, frames: List[Dict]) -> float:
        """클럽 패스 추정 (Lv2) - 도"""
        # 손목 궤적 기반 추정
        wrist_paths = []
        for frame in frames:
            left_wrist = frame.get('left_wrist')
            right_wrist = frame.get('right_wrist')

            if left_wrist and right_wrist:
                wrist_center = (
                    (left_wrist[0] + right_wrist[0]) / 2,
                    (left_wrist[1] + right_wrist[1]) / 2,
                )
                wrist_paths.append(wrist_center)

        if len(wrist_paths) < 10:
            return 999.0

        # 다운스윙 구간 찾기 (손목이 가장 높은 지점 이후)
        max_y_idx = min(
            range(len(wrist_paths)), key=lambda i: wrist_paths[i][1]
        )
        downswing = wrist_paths[max_y_idx:]

        if len(downswing) < 5:
            return 999.0

        # 다운스윙 각도 계산
        start_point = downswing[0]
        end_point = downswing[-1]

        dx = end_point[0] - start_point[0]
        dy = end_point[1] - start_point[1]
        angle = np.degrees(np.arctan2(dy, dx))

        # 정규화 (-10도 ~ +10도 범위)
        return float(np.clip(angle, -10, 10))

    def _calculate_rhythm_variance(self, frames: List[Dict]) -> float:
        """리듬 변동 계산 (Lv2)"""
        # 손목 속도 기반
        speeds = []
        for i in range(1, len(frames)):
            prev = frames[i - 1]
            curr = frames[i]

            left_wrist_prev = prev.get('left_wrist')
            left_wrist_curr = curr.get('left_wrist')

            if left_wrist_prev and left_wrist_curr:
                speed = np.sqrt(
                    (left_wrist_curr[0] - left_wrist_prev[0]) ** 2
                    + (left_wrist_curr[1] - left_wrist_prev[1]) ** 2
                )
                speeds.append(speed)

        if len(speeds) < 2:
            return 1.0  # 실패 값

        # 변동계수 (CV)
        mean_speed = np.mean(speeds)
        if mean_speed == 0:
            return 1.0

        cv = np.std(speeds) / mean_speed
        return float(cv)

    def _calculate_weight_shift(self, frames: List[Dict]) -> float:
        """체중 이동 계산 (Lv3) - %"""
        # 엉덩이 중심점의 좌우 이동 기반
        hip_centers = []
        for frame in frames:
            left_hip = frame.get('left_hip')
            right_hip = frame.get('right_hip')

            if left_hip and right_hip:
                center_x = (left_hip[0] + right_hip[0]) / 2
                hip_centers.append(center_x)

        if len(hip_centers) < 10:
            return 0.0

        # 초기 위치
        initial_x = hip_centers[0]
        # 최대 이동 위치
        max_shift = max(hip_centers) - initial_x
        min_shift = initial_x - min(hip_centers)
        total_shift = max(max_shift, min_shift)

        # 정규화 (0 ~ 100%)
        # 프레임 너비 기준으로 가정 (실제로는 보정 필요)
        normalized = min(total_shift * 200, 100.0)  # 임시 스케일링
        return float(max(normalized, 0.0))

    def _estimate_impact_angle(self, frames: List[Dict]) -> float:
        """임팩트 각도 추정 (Lv3) - 도"""
        # 손목과 엉덩이 각도 기반
        angles = []
        for frame in frames:
            left_wrist = frame.get('left_wrist')
            right_wrist = frame.get('right_wrist')
            left_hip = frame.get('left_hip')
            right_hip = frame.get('right_hip')

            if all([left_wrist, right_wrist, left_hip, right_hip]):
                wrist_center = (
                    (left_wrist[0] + right_wrist[0]) / 2,
                    (left_wrist[1] + right_wrist[1]) / 2,
                )
                hip_center = (
                    (left_hip[0] + right_hip[0]) / 2,
                    (left_hip[1] + right_hip[1]) / 2,
                )

                dx = wrist_center[0] - hip_center[0]
                dy = wrist_center[1] - hip_center[1]
                angle = np.degrees(np.arctan2(dy, dx))
                angles.append(angle)

        if len(angles) == 0:
            return -10.0  # 실패 값

        # 다운스윙 구간의 최소 각도 (임팩트 시점 근사)
        return float(min(angles))

