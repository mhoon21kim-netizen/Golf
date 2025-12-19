import { JudgmentResult, FailureType } from '../../../../shared/types'
import { JudgmentOutput, Metrics } from '../judgmentRules'
import { LevelJudgmentStrategy } from './LevelJudgmentStrategy'
import { JUDGMENT_CRITERIA } from '../judgmentCriteria'

/**
 * Lv1 판정 전략: 그립 & 어드레스 안정
 */
export class Lv1JudgmentStrategy implements LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput {
    // 기준 1: 척추 각도 변동 ≤ 4°
    const spineAngleVariance = metrics.spine_angle_variance ?? 999
    if (spineAngleVariance > JUDGMENT_CRITERIA.Lv1.SPINE_ANGLE_VARIANCE_MAX) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.ADDRESS_UNSTABLE,
      }
    }

    // 기준 2: 그립 강도 ≥ 0.75
    const gripStrength = metrics.grip_strength ?? 0
    if (gripStrength < JUDGMENT_CRITERIA.Lv1.GRIP_STRENGTH_MIN) {
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
}

