/**
 * API 핸들러 테스트
 * TDD Green 단계: 테스트를 통과시키기 위한 구현
 */

import { Level } from '../../../../shared/types'
import { judgmentHandler } from '../judgmentHandler'
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'

// 모킹
jest.mock('axios')
jest.mock('fs')
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    getHeaders: jest.fn(() => ({})),
  }))
})

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('judgmentHandler', () => {
  const mockVideoPath = '/tmp/test-video.mp4'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('영상 파일 업로드 처리', () => {
    it('영상 파일 업로드 처리', async () => {
      // 파일 존재 모킹
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      // AI 엔진 응답 모킹
      mockedAxios.post.mockResolvedValue({
        data: {
          metrics: {
            spine_angle_variance: 3,
            grip_strength: 0.8,
          },
        },
      })

      await judgmentHandler(Level.Lv1, mockVideoPath)

      expect(mockedAxios.post).toHaveBeenCalled()
      expect(FormData).toHaveBeenCalled()
    })
  })

  describe('AI 엔진 호출', () => {
    it('AI 엔진 호출', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      mockedAxios.post.mockResolvedValue({
        data: {
          metrics: {
            spine_angle_variance: 3,
            grip_strength: 0.8,
          },
        },
      })

      await judgmentHandler(Level.Lv1, mockVideoPath)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/analyze'),
        expect.any(Object),
        expect.any(Object)
      )
    })
  })

  describe('판정 로직 적용', () => {
    it('판정 로직 적용', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      mockedAxios.post.mockResolvedValue({
        data: {
          metrics: {
            spine_angle_variance: 3,
            grip_strength: 0.8,
          },
        },
      })

      const result = await judgmentHandler(Level.Lv1, mockVideoPath)

      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('failureType')
      expect(result).toHaveProperty('feedback')
      expect(result).toHaveProperty('metrics')
    })
  })

  describe('피드백 생성', () => {
    it('피드백 생성', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      mockedAxios.post.mockResolvedValue({
        data: {
          metrics: {
            spine_angle_variance: 3,
            grip_strength: 0.8,
          },
        },
      })

      const result = await judgmentHandler(Level.Lv1, mockVideoPath)

      expect(result.feedback).toHaveProperty('problem')
      expect(result.feedback).toHaveProperty('reason')
      expect(result.feedback).toHaveProperty('todayPractice')
    })
  })

  describe('에러 처리', () => {
    it('AI 엔진 실패 시 에러 처리', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      mockedAxios.post.mockRejectedValue(new Error('AI 엔진 연결 실패'))

      await expect(judgmentHandler(Level.Lv1, mockVideoPath)).rejects.toThrow(
        'AI 분석 중 오류가 발생했습니다'
      )
    })

    it('파일 없음 시 에러 처리', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      ;(fs.createReadStream as jest.Mock).mockImplementation(() => {
        throw new Error('파일을 찾을 수 없습니다')
      })

      await expect(judgmentHandler(Level.Lv1, mockVideoPath)).rejects.toThrow()
    })
  })

  describe('응답 형식 검증', () => {
    it('응답 형식 검증', async () => {
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      ;(fs.createReadStream as jest.Mock).mockReturnValue({
        pipe: jest.fn(),
      })

      mockedAxios.post.mockResolvedValue({
        data: {
          metrics: {
            spine_angle_variance: 3,
            grip_strength: 0.8,
          },
        },
      })

      const result = await judgmentHandler(Level.Lv1, mockVideoPath)

      expect(result).toHaveProperty('result')
      expect(result).toHaveProperty('failureType')
      expect(result).toHaveProperty('feedback')
      expect(result).toHaveProperty('metrics')
      expect(result).toHaveProperty('timestamp')
      expect(typeof result.timestamp).toBe('string')
    })
  })
})

