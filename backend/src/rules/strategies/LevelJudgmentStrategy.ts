import { JudgmentOutput, Metrics } from '../judgmentRules'

/**
 * 레벨별 판정 전략 인터페이스
 */
export interface LevelJudgmentStrategy {
  evaluate(metrics: Metrics): JudgmentOutput
}

