"""
테스트용 골프 스윙 영상 파일 생성
OpenCV를 사용하여 간단한 더미 영상 생성
"""

import cv2
import numpy as np
import os

def create_test_video(output_path: str = "test_video.mp4", duration: int = 3, fps: int = 30):
    """
    테스트용 영상 파일 생성
    
    Args:
        output_path: 출력 파일 경로
        duration: 영상 길이 (초)
        fps: 초당 프레임 수
    """
    # 영상 설정
    width, height = 640, 480
    total_frames = duration * fps
    
    # VideoWriter 설정
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    print(f"테스트 영상 생성 중: {output_path}")
    print(f"해상도: {width}x{height}, 길이: {duration}초, FPS: {fps}")
    
    for frame_num in range(total_frames):
        # 검은 배경 생성
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # 프레임 번호 표시
        text = f"Test Video Frame {frame_num + 1}/{total_frames}"
        cv2.putText(
            frame,
            text,
            (50, height // 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )
        
        # 진행 바 표시
        progress = (frame_num + 1) / total_frames
        bar_width = int(width * progress)
        cv2.rectangle(frame, (0, height - 30), (bar_width, height), (0, 255, 0), -1)
        
        # 원형 움직임 시뮬레이션 (골프 스윙 모션)
        center_x = width // 2
        center_y = height // 2
        radius = 100
        angle = (frame_num / total_frames) * 2 * np.pi
        x = int(center_x + radius * np.cos(angle))
        y = int(center_y + radius * np.sin(angle))
        
        # 골프 클럽 시뮬레이션 (원)
        cv2.circle(frame, (x, y), 20, (0, 255, 255), -1)
        cv2.line(frame, (center_x, center_y), (x, y), (255, 255, 0), 3)
        
        # 프레임 쓰기
        out.write(frame)
        
        # 진행 상황 표시
        if (frame_num + 1) % 30 == 0:
            print(f"진행: {int(progress * 100)}%")
    
    out.release()
    print(f"✅ 영상 생성 완료: {output_path}")
    print(f"파일 크기: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
    
    return output_path

if __name__ == "__main__":
    # 테스트 영상 생성
    video_path = create_test_video(
        output_path="test_golf_swing.mp4",
        duration=3,  # 3초
        fps=30       # 30 FPS
    )
    
    print(f"\n사용 방법:")
    print(f"1. 프론트엔드에서 '{video_path}' 파일을 업로드하세요")
    print(f"2. 또는 백엔드 테스트에서 사용하세요")



