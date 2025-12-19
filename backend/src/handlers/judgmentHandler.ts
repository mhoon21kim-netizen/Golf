import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { Level, JudgmentResponse, Feedback } from '../../../shared/types'
import { generateFeedbackWithLLM } from '../utils/llmFeedback'
import { applyJudgmentRules } from '../rules/judgmentRules'

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000'

export async function judgmentHandler(
  level: Level,
  videoPath: string
): Promise<JudgmentResponse> {
  try {
    // AI 엔진에 분석 요청
    const formData = new FormData()
    formData.append('video', fs.createReadStream(videoPath), {
      filename: path.basename(videoPath),
    })
    formData.append('level', level.toString())

    const response = await axios.post(
      `${AI_ENGINE_URL}/analyze`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 30000, // 30초 타임아웃
      }
    )

    // AI 엔진 오류 확인
    if (response.data.error) {
      throw new Error(response.data.error)
    }

    const aiResult = response.data

    // 규칙 엔진 기반 판정
    const judgment = applyJudgmentRules(level, aiResult.metrics || {})

    // 피드백 생성 (LLM 사용)
    const feedback = await generateFeedbackWithLLM(
      level,
      judgment.result,
      judgment.failureType,
      aiResult.metrics || {}
    )

    return {
      result: judgment.result,
      failureType: judgment.failureType,
      feedback,
      metrics: aiResult.metrics || {},
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('AI 엔진 호출 실패:', error)
    
    // AI 엔진에서 반환된 오류 메시지 추출
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    
    // axios 오류 처리
    if (error.message) {
      throw new Error(error.message)
    }
    
    throw new Error('AI 분석 중 오류가 발생했습니다.')
  }
}

