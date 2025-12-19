import { Level, JudgmentResponse } from '../../../shared/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function analyzeVideo(
  level: Level,
  videoFile: File
): Promise<JudgmentResponse> {
  const formData = new FormData()
  formData.append('video', videoFile)
  formData.append('level', level.toString())

  const response = await fetch(`${API_URL}/api/judgment`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('분석 요청 실패')
  }

  return response.json()
}

