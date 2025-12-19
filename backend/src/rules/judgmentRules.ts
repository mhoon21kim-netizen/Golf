/**
 * 규칙 엔진 기반 판정 로직
 * 보수적 기준 적용 - 절대 완화하지 않음
 */

import { Level, JudgmentResult, FailureType } from '../../../shared/types'

export interface JudgmentOutput {
  result: JudgmentResult
  failureType: FailureType
}

export interface Metrics {
  spine_angle_variance?: number
  grip_strength?: number
  club_path?: number
  rhythm_variance?: number
  weight_shift?: number
  impact_angle?: number
  [key: string]: any
}

/**
 * 규칙 엔진 기반 판정
 * @param level 현재 레벨
 * @param metrics 측정 지표
 * @returns 판정 결과 및 실패 타입
 */
export function applyJudgmentRules(
  level: Level,
  metrics: Metrics
): JudgmentOutput {
  // Lv1: 그립 & 어드레스 안정 (보수적 기준)
  if (level === Level.Lv1) {
    // 기준 1: 척추 각도 변동 ≤ 4°
    const spineAngleVariance = metrics.spine_angle_variance ?? 999
    if (spineAngleVariance > 4) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.ADDRESS_UNSTABLE,
      }
    }
    
    // 기준 2: 그립 강도 ≥ 0.75
    const gripStrength = metrics.grip_strength ?? 0
    if (gripStrength < 0.75) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
      }
    }
    
    // 모든 기준 통과 시에만 PASS
    return {
      result: JudgmentResult.PASS,
      failureType: FailureType.NONE,
    }
  }

  // Lv2: 스윙 궤도 & 리듬 (보수적 기준)
  if (level === Level.Lv2) {
    // 기준 1: 클럽 패스 -1.5° ~ +1.5°
    const clubPath = metrics.club_path ?? 999
    if (clubPath < -1.5 || clubPath > 1.5) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.SLICE,
      }
    }
    
    // 기준 2: 리듬 변동 ≤ 0.12
    const rhythmVariance = metrics.rhythm_variance ?? 1.0
    if (rhythmVariance > 0.12) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.RHYTHM_UNSTABLE,
      }
    }
    
    // 모든 기준 통과 시에만 PASS
    return {
      result: JudgmentResult.PASS,
      failureType: FailureType.NONE,
    }
  }

  // Lv3: 아이언 임팩트 (보수적 기준)
  if (level === Level.Lv3) {
    // 기준 1: 체중 이동 ≥ 60%
    const weightShift = metrics.weight_shift ?? 0
    if (weightShift < 60) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.FAT_SHOT,
      }
    }
    
    // 기준 2: 임팩트 각도 ≥ -4°
    const impactAngle = metrics.impact_angle ?? -10
    if (impactAngle < -4) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.TOPPING,
      }
    }
    
    // 모든 기준 통과 시에만 PASS
    return {
      result: JudgmentResult.PASS,
      failureType: FailureType.NONE,
    }
  }

  // 알 수 없는 레벨 또는 기본값: FAIL (보수적 접근)
  return {
    result: JudgmentResult.FAIL,
    failureType: FailureType.NONE,
  }
}

