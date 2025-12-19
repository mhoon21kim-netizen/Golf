import { JudgmentResult, FailureType } from '../../../../shared/types'
import { JudgmentOutput, Metrics } from '../judgmentRules'
import { LevelJudgmentStrategy } from './LevelJudgmentStrategy'
import { JUDGMENT_CRITERIA } from '../judgmentCriteria'

/**
 * Lv3 판정 전략: 아이언 임팩트
 */
export class Lv3JudgmentStrategy implements LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput {
    // 기준 1: 체중 이동 ≥ 60%
    const weightShift = metrics.weight_shift ?? 0
    if (weightShift < JUDGMENT_CRITERIA.Lv3.WEIGHT_SHIFT_MIN) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.FAT_SHOT,
      }
    }

    // 기준 2: 임팩트 각도 ≥ -4°
    const impactAngle = metrics.impact_angle ?? -10
    if (impactAngle < JUDGMENT_CRITERIA.Lv3.IMPACT_ANGLE_MIN) {
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
}

