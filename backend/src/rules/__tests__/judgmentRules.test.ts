/**
 * 판정 로직 테스트 (규칙 엔진)
 * TDD Green 단계: 테스트를 통과시키기 위한 구현
 */

import { Level, JudgmentResult, FailureType } from '../../../../shared/types'
import { applyJudgmentRules, Metrics } from '../judgmentRules'

describe('applyJudgmentRules - Lv1 테스트', () => {
  describe('척추 각도 변동 테스트', () => {
    it('척추 각도 변동 > 4° → FAIL (ADDRESS_UNSTABLE)', () => {
      const metrics: Metrics = {
        spine_angle_variance: 5,
        grip_strength: 0.8,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.ADDRESS_UNSTABLE)
    })

    it('척추 각도 변동 = 4° → PASS', () => {
      const metrics: Metrics = {
        spine_angle_variance: 4,
        grip_strength: 0.8,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })

    it('척추 각도 변동 < 4° → PASS', () => {
      const metrics: Metrics = {
        spine_angle_variance: 3,
        grip_strength: 0.8,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('그립 강도 테스트', () => {
    it('그립 강도 < 0.75 → FAIL (GRIP_WEAK)', () => {
      const metrics: Metrics = {
        spine_angle_variance: 3,
        grip_strength: 0.7,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.GRIP_WEAK)
    })

    it('그립 강도 = 0.75 → PASS', () => {
      const metrics: Metrics = {
        spine_angle_variance: 3,
        grip_strength: 0.75,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })

    it('그립 강도 > 0.75 → PASS', () => {
      const metrics: Metrics = {
        spine_angle_variance: 3,
        grip_strength: 0.8,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('복합 테스트', () => {
    it('두 기준 모두 통과 → PASS', () => {
      const metrics: Metrics = {
        spine_angle_variance: 3,
        grip_strength: 0.8,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })

    it('하나라도 실패 → FAIL', () => {
      const metrics: Metrics = {
        spine_angle_variance: 5,
        grip_strength: 0.7,
      }
      const result = applyJudgmentRules(Level.Lv1, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      // 첫 번째 실패 기준이 우선
      expect(result.failureType).toBe(FailureType.ADDRESS_UNSTABLE)
    })
  })
})

describe('applyJudgmentRules - Lv2 테스트', () => {
  describe('클럽 패스 테스트', () => {
    it('클럽 패스 < -1.5° → FAIL (SLICE)', () => {
      const metrics: Metrics = {
        club_path: -2,
        rhythm_variance: 0.1,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.SLICE)
    })

    it('클럽 패스 > +1.5° → FAIL (SLICE)', () => {
      const metrics: Metrics = {
        club_path: 2,
        rhythm_variance: 0.1,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.SLICE)
    })

    it('클럽 패스 -1.5° ~ +1.5° → PASS', () => {
      const metrics: Metrics = {
        club_path: 0,
        rhythm_variance: 0.1,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('리듬 변동 테스트', () => {
    it('리듬 변동 > 0.12 → FAIL (RHYTHM_UNSTABLE)', () => {
      const metrics: Metrics = {
        club_path: 0,
        rhythm_variance: 0.15,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.RHYTHM_UNSTABLE)
    })

    it('리듬 변동 ≤ 0.12 → PASS', () => {
      const metrics: Metrics = {
        club_path: 0,
        rhythm_variance: 0.12,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('복합 테스트', () => {
    it('두 기준 모두 통과 → PASS', () => {
      const metrics: Metrics = {
        club_path: 0,
        rhythm_variance: 0.1,
      }
      const result = applyJudgmentRules(Level.Lv2, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })
})

describe('applyJudgmentRules - Lv3 테스트', () => {
  describe('체중 이동 테스트', () => {
    it('체중 이동 < 60% → FAIL (FAT_SHOT)', () => {
      const metrics: Metrics = {
        weight_shift: 55,
        impact_angle: -3,
      }
      const result = applyJudgmentRules(Level.Lv3, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.FAT_SHOT)
    })

    it('체중 이동 ≥ 60% → PASS', () => {
      const metrics: Metrics = {
        weight_shift: 60,
        impact_angle: -3,
      }
      const result = applyJudgmentRules(Level.Lv3, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('임팩트 각도 테스트', () => {
    it('임팩트 각도 < -4° → FAIL (TOPPING)', () => {
      const metrics: Metrics = {
        weight_shift: 65,
        impact_angle: -5,
      }
      const result = applyJudgmentRules(Level.Lv3, metrics)
      expect(result.result).toBe(JudgmentResult.FAIL)
      expect(result.failureType).toBe(FailureType.TOPPING)
    })

    it('임팩트 각도 ≥ -4° → PASS', () => {
      const metrics: Metrics = {
        weight_shift: 65,
        impact_angle: -4,
      }
      const result = applyJudgmentRules(Level.Lv3, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })

  describe('복합 테스트', () => {
    it('두 기준 모두 통과 → PASS', () => {
      const metrics: Metrics = {
        weight_shift: 65,
        impact_angle: -3,
      }
      const result = applyJudgmentRules(Level.Lv3, metrics)
      expect(result.result).toBe(JudgmentResult.PASS)
      expect(result.failureType).toBe(FailureType.NONE)
    })
  })
})

describe('applyJudgmentRules - 엣지 케이스', () => {
  it('지표가 undefined/null → FAIL', () => {
    const metrics: Metrics = {}
    const result = applyJudgmentRules(Level.Lv1, metrics)
    expect(result.result).toBe(JudgmentResult.FAIL)
  })

  it('알 수 없는 레벨 → FAIL', () => {
    const metrics: Metrics = {
      spine_angle_variance: 3,
      grip_strength: 0.8,
    }
    // @ts-ignore - 테스트를 위해 잘못된 레벨 전달
    const result = applyJudgmentRules(999 as Level, metrics)
    expect(result.result).toBe(JudgmentResult.FAIL)
    expect(result.failureType).toBe(FailureType.NONE)
  })

  it('모든 지표가 경계값 → 정확한 판정', () => {
    // Lv1 경계값 테스트
    const metricsLv1: Metrics = {
      spine_angle_variance: 4,
      grip_strength: 0.75,
    }
    const resultLv1 = applyJudgmentRules(Level.Lv1, metricsLv1)
    expect(resultLv1.result).toBe(JudgmentResult.PASS)

    // Lv2 경계값 테스트
    const metricsLv2: Metrics = {
      club_path: 1.5,
      rhythm_variance: 0.12,
    }
    const resultLv2 = applyJudgmentRules(Level.Lv2, metricsLv2)
    expect(resultLv2.result).toBe(JudgmentResult.PASS)

    // Lv3 경계값 테스트
    const metricsLv3: Metrics = {
      weight_shift: 60,
      impact_angle: -4,
    }
    const resultLv3 = applyJudgmentRules(Level.Lv3, metricsLv3)
    expect(resultLv3.result).toBe(JudgmentResult.PASS)
  })
})

