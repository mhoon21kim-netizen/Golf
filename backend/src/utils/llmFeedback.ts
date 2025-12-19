import { Level, JudgmentResult, FailureType, Feedback } from '../../../shared/types'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

/**
 * LLM을 사용한 피드백 생성
 * 판정은 규칙 엔진에서 이미 완료되었으므로, LLM은 피드백 문구만 생성
 */
import { Metrics } from '../rules/judgmentRules'

export async function generateFeedbackWithLLM(
  level: Level,
  result: JudgmentResult,
  failureType: FailureType,
  metrics: Metrics
): Promise<Feedback> {
  // API 키가 없으면 폴백 템플릿 사용
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackFeedback(level, result, failureType, metrics)
  }

  try {
    const prompt = buildPrompt(level, result, failureType, metrics)
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 골프 코치입니다. 피드백은 다음 형식으로만 제공하세요:
- 문제: 한 문장으로 문제점 명시
- 이유: 수치 기반 이유 설명
- 오늘 연습: 구체적인 행동 1개만 제시

설명이나 추가 조언은 절대 하지 마세요.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // 일관성 유지
      max_tokens: 150,
    })

    const content = response.choices[0]?.message?.content || ''
    return parseFeedback(content, level, result, failureType, metrics)
  } catch (error) {
    console.error('LLM 피드백 생성 실패:', error)
    return getFallbackFeedback(level, result, failureType, metrics)
  }
}

function buildPrompt(
  level: Level,
  result: JudgmentResult,
  failureType: FailureType,
  metrics: Metrics
): string {
  const levelNames: Record<Level, string> = {
    [Level.Lv1]: 'Level 1 (그립 & 어드레스 안정)',
    [Level.Lv2]: 'Level 2 (스윙 궤도 & 리듬)',
    [Level.Lv3]: 'Level 3 (아이언 임팩트)',
  }

  const failureTypeNames: Record<FailureType, string> = {
    [FailureType.NONE]: '없음',
    [FailureType.GRIP_WEAK]: '그립 약함',
    [FailureType.ADDRESS_UNSTABLE]: '어드레스 불안정',
    [FailureType.SLICE]: '슬라이스',
    [FailureType.RHYTHM_UNSTABLE]: '리듬 불안정',
    [FailureType.FAT_SHOT]: '팻 샷',
    [FailureType.TOPPING]: '토핑',
  }

  if (result === JudgmentResult.PASS) {
    return `${levelNames[level]} 판정 결과: PASS

다음 단계로 진행할 수 있습니다. 피드백 형식으로 응답하세요:
문제: (비워두기)
이유: (비워두기)
오늘 연습: 다음 단계로 진행하세요.`
  }

  const metricInfo = formatMetrics(level, metrics)
  
  return `${levelNames[level]} 판정 결과: FAIL
실패 타입: ${failureTypeNames[failureType]}

측정 지표:
${metricInfo}

위 정보를 바탕으로 피드백을 제공하세요.`
}

function formatMetrics(level: Level, metrics: Metrics): string {
  if (level === Level.Lv1) {
    return `- 척추 각도 변동: ${metrics.spine_angle_variance?.toFixed(2) ?? 'N/A'}° (기준: ≤4°)
- 그립 강도: ${metrics.grip_strength?.toFixed(2) ?? 'N/A'} (기준: ≥0.75)`
  }
  
  if (level === Level.Lv2) {
    return `- 클럽 패스: ${metrics.club_path?.toFixed(2) ?? 'N/A'}° (기준: -1.5° ~ +1.5°)
- 리듬 변동: ${metrics.rhythm_variance?.toFixed(3) ?? 'N/A'} (기준: ≤0.12)`
  }
  
  if (level === Level.Lv3) {
    return `- 체중 이동: ${metrics.weight_shift?.toFixed(1) ?? 'N/A'}% (기준: ≥60%)
- 임팩트 각도: ${metrics.impact_angle?.toFixed(2) ?? 'N/A'}° (기준: ≥-4°)`
  }
  
  return '측정 지표 없음'
}

function parseFeedback(
  content: string,
  level: Level,
  result: JudgmentResult,
  failureType: FailureType,
  metrics: Metrics
): Feedback {
  // LLM 응답 파싱
  const problemMatch = content.match(/문제[：:]\s*(.+?)(?:\n|이유|$)/i)
  const reasonMatch = content.match(/이유[：:]\s*(.+?)(?:\n|오늘|$)/i)
  const practiceMatch = content.match(/오늘 연습[：:]\s*(.+?)$/i)

  const problem = problemMatch?.[1]?.trim() || ''
  const reason = reasonMatch?.[1]?.trim() || ''
  const todayPractice = practiceMatch?.[1]?.trim() || ''

  // 파싱 실패 시 폴백 사용
  if (!problem && !reason && !todayPractice) {
    return getFallbackFeedback(level, result, failureType, metrics)
  }

  return {
    problem: problem || '',
    reason: reason || '',
    todayPractice: todayPractice || '다시 연습하세요.',
  }
}

function getFallbackFeedback(
  level: Level,
  result: JudgmentResult,
  failureType: FailureType,
  metrics: Metrics
): Feedback {
  // LLM 실패 시 하드코딩된 폴백 피드백
  if (result === JudgmentResult.PASS) {
    return {
      problem: '',
      reason: '',
      todayPractice: '다음 단계로 진행하세요.',
    }
  }

  const failureMessages: Record<FailureType, Feedback> = {
    [FailureType.GRIP_WEAK]: {
      problem: '그립이 약합니다',
      reason: `그립 강도 ${metrics.grip_strength?.toFixed(2) ?? 'N/A'} (기준: ≥0.75)`,
      todayPractice: '그립을 더 단단히 잡고 연습하세요.',
    },
    [FailureType.ADDRESS_UNSTABLE]: {
      problem: '어드레스가 불안정합니다',
      reason: `척추 각도 변동 ${metrics.spine_angle_variance?.toFixed(2) ?? 'N/A'}° (기준: ≤4°)`,
      todayPractice: '어드레스 자세를 고정하고 연습하세요.',
    },
    [FailureType.SLICE]: {
      problem: '스윙 궤도가 벗어났습니다',
      reason: `클럽 패스 ${metrics.club_path?.toFixed(2) ?? 'N/A'}° (기준: -1.5° ~ +1.5°)`,
      todayPractice: '스윙 궤도를 교정하고 연습하세요.',
    },
    [FailureType.RHYTHM_UNSTABLE]: {
      problem: '리듬이 불안정합니다',
      reason: `리듬 변동 ${metrics.rhythm_variance?.toFixed(3) ?? 'N/A'} (기준: ≤0.12)`,
      todayPractice: '일정한 리듬으로 스윙하세요.',
    },
    [FailureType.FAT_SHOT]: {
      problem: '팻 샷이 발생했습니다',
      reason: `체중 이동 ${metrics.weight_shift?.toFixed(1) ?? 'N/A'}% (기준: ≥60%)`,
      todayPractice: '체중 이동을 강화하고 연습하세요.',
    },
    [FailureType.TOPPING]: {
      problem: '토핑이 발생했습니다',
      reason: `임팩트 각도 ${metrics.impact_angle?.toFixed(2) ?? 'N/A'}° (기준: ≥-4°)`,
      todayPractice: '임팩트 각도를 교정하고 연습하세요.',
    },
    [FailureType.NONE]: {
      problem: '기준을 충족하지 못했습니다',
      reason: `${level} 기준을 통과하지 못했습니다`,
      todayPractice: '다시 연습하세요.',
    },
  }

  return failureMessages[failureType] || {
    problem: '기준을 충족하지 못했습니다',
    reason: '판정 기준을 통과하지 못했습니다',
    todayPractice: '다시 연습하세요.',
  }
}

