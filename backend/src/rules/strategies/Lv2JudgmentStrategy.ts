import { JudgmentResult, FailureType } from '../../../../shared/types'
import { JudgmentOutput, Metrics } from '../judgmentRules'
import { LevelJudgmentStrategy } from './LevelJudgmentStrategy'
import { JUDGMENT_CRITERIA } from '../judgmentCriteria'

/**
 * Lv2 판정 전략: 스윙 궤도 & 리듬
 */
export class Lv2JudgmentStrategy implements LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput {
    // 기준 1: 클럽 패스 -1.5° ~ +1.5°
    const clubPath = metrics.club_path ?? 999
    if (
      clubPath < JUDGMENT_CRITERIA.Lv2.CLUB_PATH_MIN ||
      clubPath > JUDGMENT_CRITERIA.Lv2.CLUB_PATH_MAX
    ) {
      return {
        result: JudgmentResult.FAIL,
        failureType: FailureType.SLICE,
      }
    }

    // 기준 2: 리듬 변동 ≤ 0.12
    const rhythmVariance = metrics.rhythm_variance ?? 1.0
    if (rhythmVariance > JUDGMENT_CRITERIA.Lv2.RHYTHM_VARIANCE_MAX) {
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
}

