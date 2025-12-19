import { Level, JudgmentResponse } from '../../../shared/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export async function analyzeVideo(
  level: Level,
  videoFile: File
): Promise<JudgmentResponse> {
  const formData = new FormData()
  formData.append('video', videoFile)
  formData.append('level', level.toString())

  try {
    const response = await fetch(`${API_URL}/api/judgment`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error || `서버 오류 (${response.status})`
      
      // 프레임 부족 오류에 대한 추가 안내
      if (errorMessage.includes('프레임이 부족')) {
        throw new Error(
          `${errorMessage}\n\n해결 방법:\n` +
          `- 영상에 사람의 전체 몸이 명확하게 보이는지 확인\n` +
          `- 영상 길이가 최소 1초 이상인지 확인\n` +
          `- 조명이 충분한지 확인\n` +
          `- 카메라 각도가 적절한지 확인`
        )
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error: any) {
    // 네트워크 오류 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.')
    }
    throw error
  }
}

