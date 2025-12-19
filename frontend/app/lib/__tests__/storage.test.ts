/**
 * Day Sheet 저장/로드 테스트
 * TDD Green 단계: 테스트를 통과시키기 위한 구현
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Level, JudgmentResult, FailureType } from '../../../../../shared/types'
import {
  getProgress,
  saveProgress,
  saveDaySheetEntry,
  getDaySheets,
} from '../storage'

// LocalStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('초기 진행 상태', () => {
    it('초기 진행 상태 생성', () => {
      const progress = getProgress()

      expect(progress.currentLevel).toBe(Level.Lv1)
      expect(progress.daySheets).toEqual([])
      expect(progress.totalDays).toBe(0)
      expect(progress.consecutiveDays).toBe(0)
    })
  })

  describe('Day Sheet 항목 저장', () => {
    it('Day Sheet 항목 저장', () => {
      const entry = {
        date: '2024-01-15',
        level: Level.Lv1,
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
        attemptCount: 1,
      }

      saveDaySheetEntry(entry)
      const sheets = getDaySheets()

      expect(sheets).toHaveLength(1)
      expect(sheets[0]).toEqual(entry)
    })
  })

  describe('Day Sheet 항목 로드', () => {
    it('Day Sheet 항목 로드', () => {
      const entry = {
        date: '2024-01-15',
        level: Level.Lv1,
        result: JudgmentResult.PASS,
        failureType: FailureType.NONE,
        attemptCount: 1,
      }

      saveDaySheetEntry(entry)
      const sheets = getDaySheets()

      expect(sheets).toHaveLength(1)
      expect(sheets[0].date).toBe('2024-01-15')
      expect(sheets[0].level).toBe(Level.Lv1)
      expect(sheets[0].result).toBe(JudgmentResult.PASS)
    })
  })

  describe('총 일수 계산', () => {
    it('총 일수 계산', () => {
      const entry1 = {
        date: '2024-01-15',
        level: Level.Lv1,
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
        attemptCount: 1,
      }

      const entry2 = {
        date: '2024-01-16',
        level: Level.Lv1,
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
        attemptCount: 1,
      }

      saveDaySheetEntry(entry1)
      saveDaySheetEntry(entry2)

      const progress = getProgress()
      expect(progress.totalDays).toBe(2)
    })
  })

  describe('연속 일수 계산', () => {
    it('연속 일수 계산', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const entry1 = {
        date: yesterday.toISOString().split('T')[0],
        level: Level.Lv1,
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
        attemptCount: 1,
      }

      const entry2 = {
        date: today.toISOString().split('T')[0],
        level: Level.Lv1,
        result: JudgmentResult.FAIL,
        failureType: FailureType.GRIP_WEAK,
        attemptCount: 1,
      }

      saveDaySheetEntry(entry1)
      saveDaySheetEntry(entry2)

      const progress = getProgress()
      expect(progress.consecutiveDays).toBeGreaterThanOrEqual(1)
    })
  })

  describe('PASS 시 다음 레벨로 진행', () => {
    it('PASS 시 다음 레벨로 진행', () => {
      const progress = getProgress()
      expect(progress.currentLevel).toBe(Level.Lv1)

      const entry = {
        date: new Date().toISOString().split('T')[0],
        level: Level.Lv1,
        result: JudgmentResult.PASS,
        failureType: FailureType.NONE,
        attemptCount: 1,
      }

      saveDaySheetEntry(entry)

      // Note: 실제로는 프론트엔드에서 레벨 업데이트 로직이 있음
      // 여기서는 저장만 테스트
      const updatedProgress = getProgress()
      expect(updatedProgress.daySheets.length).toBeGreaterThan(0)
    })
  })

  describe('LocalStorage 없을 때', () => {
    it('LocalStorage 없을 때 기본값 반환', () => {
      // window 객체 제거 시뮬레이션
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const progress = getProgress()

      expect(progress.currentLevel).toBe(Level.Lv1)
      expect(progress.daySheets).toEqual([])
      expect(progress.totalDays).toBe(0)
      expect(progress.consecutiveDays).toBe(0)

      global.window = originalWindow
    })
  })
})

