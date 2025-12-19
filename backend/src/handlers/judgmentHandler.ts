import axios, { AxiosInstance } from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import { Level, JudgmentResponse, Feedback } from '../../../shared/types'
import { generateFeedbackWithLLM } from '../utils/llmFeedback'
import { applyJudgmentRules } from '../rules/judgmentRules'
import { AI_ENGINE_TIMEOUT_MS } from '../rules/judgmentCriteria'
import { AIEngineError } from '../utils/errors'
import { HttpClient } from '../interfaces/HttpClient'

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000'

/**
 * Axios를 HttpClient 인터페이스로 래핑하는 어댑터
 */
class AxiosHttpClient implements HttpClient {
  constructor(private axiosInstance: AxiosInstance) {}

  async post<T = any>(
    url: string,
    data?: any,
    config?: {
      headers?: Record<string, string>
      timeout?: number
    }
  ): Promise<{ data: T; status: number }> {
    const response = await this.axiosInstance.post<T>(url, data, config)
    return {
      data: response.data,
      status: response.status,
    }
  }
}

// 기본 HTTP 클라이언트 (의존성 주입을 위한 기본값)
const defaultHttpClient = new AxiosHttpClient(axios.create())

export async function judgmentHandler(
  level: Level,
  videoPath: string,
  httpClient: HttpClient = defaultHttpClient
): Promise<JudgmentResponse> {
  try {
    // AI 엔진에 분석 요청
    const formData = new FormData()
    formData.append('video', fs.createReadStream(videoPath), {
      filename: path.basename(videoPath),
    })
    formData.append('level', level.toString())

    const response = await httpClient.post(
      `${AI_ENGINE_URL}/analyze`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: AI_ENGINE_TIMEOUT_MS,
      }
    )

    // AI 엔진 오류 확인
    if (response.data.error) {
      throw new AIEngineError(response.data.error)
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
  } catch (error: unknown) {
    console.error('AI 엔진 호출 실패:', error)
    
    // 이미 AIEngineError인 경우 그대로 throw
    if (error instanceof AIEngineError) {
      throw error
    }
    
    // axios 에러 처리 (기본 클라이언트 사용 시)
    if (error instanceof Error && 'response' in error) {
      const axiosError = error as any
      // AI 엔진에서 반환된 오류 메시지 추출
      if (axiosError.response?.data?.error) {
        throw new AIEngineError(axiosError.response.data.error)
      }
      
      // 네트워크 오류 등
      const message = axiosError.message || 'AI 엔진에 연결할 수 없습니다.'
      throw new AIEngineError(message)
    }
    
    // 일반 Error 처리 - AIEngineError로 변환
    if (error instanceof Error) {
      throw new AIEngineError(error.message || 'AI 분석 중 오류가 발생했습니다.')
    }
    
    throw new AIEngineError('AI 분석 중 오류가 발생했습니다.')
  }
}

