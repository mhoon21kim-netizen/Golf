/**
 * 판정 기준 상수
 * 보수적 기준 - 절대 완화하지 않음
 */

export const JUDGMENT_CRITERIA = {
  Lv1: {
    SPINE_ANGLE_VARIANCE_MAX: 4,
    GRIP_STRENGTH_MIN: 0.75,
  },
  Lv2: {
    CLUB_PATH_MIN: -1.5,
    CLUB_PATH_MAX: 1.5,
    RHYTHM_VARIANCE_MAX: 0.12,
  },
  Lv3: {
    WEIGHT_SHIFT_MIN: 60,
    IMPACT_ANGLE_MIN: -4,
  },
} as const

// 타임아웃 설정
export const AI_ENGINE_TIMEOUT_MS = 30000 // 30초

// 파일 크기 제한
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 // 100MB

