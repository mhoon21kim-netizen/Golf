/**
 * 피드백 생성 테스트
 * TDD Green 단계: 테스트를 통과시키기 위한 구현
 */

import { Level, JudgmentResult, FailureType } from '../../../../shared/types'
import { generateFeedbackWithLLM } from '../llmFeedback'

// OpenAI 모킹
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  }
})

describe('generateFeedbackWithLLM', () => {
  const mockMetrics = {
    spine_angle_variance: 5,
    grip_strength: 0.7,
  }

  describe('PASS 시 피드백', () => {
    it('PASS 시 피드백 형식 검증', async () => {
      // API 키 없을 때 폴백 사용
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.PASS,
        FailureType.NONE,
        mockMetrics
      )

      expect(feedback).toHaveProperty('problem')
      expect(feedback).toHaveProperty('reason')
      expect(feedback).toHaveProperty('todayPractice')
      expect(feedback.todayPractice).toContain('다음 단계')
    })
  })

  describe('FAIL 시 피드백', () => {
    it('FAIL 시 문제/이유/연습 내용 포함 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.GRIP_WEAK,
        mockMetrics
      )

      expect(feedback.problem).toBeTruthy()
      expect(feedback.reason).toBeTruthy()
      expect(feedback.todayPractice).toBeTruthy()
      expect(feedback.problem.length).toBeGreaterThan(0)
      expect(feedback.reason.length).toBeGreaterThan(0)
      expect(feedback.todayPractice.length).toBeGreaterThan(0)
    })
  })

  describe('LLM API 실패 처리', () => {
    it('LLM API 실패 시 폴백 피드백 사용', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.ADDRESS_UNSTABLE,
        mockMetrics
      )

      // 폴백 피드백이 반환되어야 함
      expect(feedback).toHaveProperty('problem')
      expect(feedback).toHaveProperty('reason')
      expect(feedback).toHaveProperty('todayPractice')
    })
  })

  describe('API 키 없을 때', () => {
    it('API 키 없을 때 폴백 피드백 사용', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.GRIP_WEAK,
        mockMetrics
      )

      expect(feedback.problem).toBe('그립이 약합니다')
      expect(feedback.reason).toContain('그립 강도')
      expect(feedback.todayPractice).toContain('그립')
    })
  })

  describe('각 FailureType별 피드백', () => {
    it('GRIP_WEAK 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.GRIP_WEAK,
        { grip_strength: 0.7 }
      )

      expect(feedback.problem).toContain('그립')
    })

    it('ADDRESS_UNSTABLE 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.ADDRESS_UNSTABLE,
        { spine_angle_variance: 5 }
      )

      expect(feedback.problem).toContain('어드레스')
    })

    it('SLICE 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv2,
        JudgmentResult.FAIL,
        FailureType.SLICE,
        { club_path: -2 }
      )

      expect(feedback.problem).toContain('궤도')
    })

    it('RHYTHM_UNSTABLE 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv2,
        JudgmentResult.FAIL,
        FailureType.RHYTHM_UNSTABLE,
        { rhythm_variance: 0.15 }
      )

      expect(feedback.problem).toContain('리듬')
    })

    it('FAT_SHOT 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv3,
        JudgmentResult.FAIL,
        FailureType.FAT_SHOT,
        { weight_shift: 55 }
      )

      expect(feedback.problem).toContain('팻')
    })

    it('TOPPING 피드백 내용 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv3,
        JudgmentResult.FAIL,
        FailureType.TOPPING,
        { impact_angle: -5 }
      )

      expect(feedback.problem).toContain('토핑')
    })
  })

  describe('수치 정보 포함 검증', () => {
    it('피드백에 수치 정보 포함 검증', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv1,
        JudgmentResult.FAIL,
        FailureType.GRIP_WEAK,
        { grip_strength: 0.7 }
      )

      expect(feedback.reason).toMatch(/\d+\.?\d*/) // 숫자 포함
    })

    it('Lv2 피드백에 수치 정보 포함', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv2,
        JudgmentResult.FAIL,
        FailureType.SLICE,
        { club_path: -2 }
      )

      expect(feedback.reason).toMatch(/-?\d+\.?\d*/) // 음수 포함 가능
    })

    it('Lv3 피드백에 수치 정보 포함', async () => {
      delete process.env.OPENAI_API_KEY

      const feedback = await generateFeedbackWithLLM(
        Level.Lv3,
        JudgmentResult.FAIL,
        FailureType.FAT_SHOT,
        { weight_shift: 55 }
      )

      expect(feedback.reason).toMatch(/\d+/) // 숫자 포함
    })
  })
})



