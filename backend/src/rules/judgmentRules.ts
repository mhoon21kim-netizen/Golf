/**
 * 규칙 엔진 기반 판정 로직
 * 보수적 기준 적용 - 절대 완화하지 않음
 */

import { Level, JudgmentResult, FailureType } from '../../../shared/types'
import { LevelJudgmentStrategy } from './strategies/LevelJudgmentStrategy'
import { Lv1JudgmentStrategy } from './strategies/Lv1JudgmentStrategy'
import { Lv2JudgmentStrategy } from './strategies/Lv2JudgmentStrategy'
import { Lv3JudgmentStrategy } from './strategies/Lv3JudgmentStrategy'

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
  [key: string]: number | undefined
}

/**
 * 레벨별 판정 전략 맵
 */
const strategies: Record<Level, LevelJudgmentStrategy> = {
  [Level.Lv1]: new Lv1JudgmentStrategy(),
  [Level.Lv2]: new Lv2JudgmentStrategy(),
  [Level.Lv3]: new Lv3JudgmentStrategy(),
}

/**
 * 규칙 엔진 기반 판정
 * 전략 패턴을 사용하여 레벨별 판정 로직을 분리
 * @param level 현재 레벨
 * @param metrics 측정 지표
 * @returns 판정 결과 및 실패 타입
 */
export function applyJudgmentRules(
  level: Level,
  metrics: Metrics
): JudgmentOutput {
  const strategy = strategies[level]
  
  if (!strategy) {
    // 알 수 없는 레벨: FAIL (보수적 접근)
    return {
      result: JudgmentResult.FAIL,
      failureType: FailureType.NONE,
    }
  }

  return strategy.evaluate(metrics)
}

