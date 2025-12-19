import { UserProgress, DaySheetEntry } from '../../../shared/types'

const STORAGE_KEY_PROGRESS = 'golf_coach_progress'
const STORAGE_KEY_DAY_SHEETS = 'golf_coach_day_sheets'

export function getProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return {
      currentLevel: 1,
      daySheets: [],
      totalDays: 0,
      consecutiveDays: 0,
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY_PROGRESS)
  if (stored) {
    return JSON.parse(stored)
  }

  return {
    currentLevel: 1,
    daySheets: [],
    totalDays: 0,
    consecutiveDays: 0,
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress))
}

export function saveDaySheetEntry(entry: DaySheetEntry): void {
  if (typeof window === 'undefined') return

  const existing = getDaySheets()
  const updated = [...existing, entry]

  // 진행 상태 업데이트
  const progress = getProgress()
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = updated.filter((e) => e.date === today)

  progress.totalDays = new Set(updated.map((e) => e.date)).size
  progress.consecutiveDays = calculateConsecutiveDays(updated)
  progress.daySheets = updated

  localStorage.setItem(STORAGE_KEY_DAY_SHEETS, JSON.stringify(updated))
  saveProgress(progress)
}

export function getDaySheets(): DaySheetEntry[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEY_DAY_SHEETS)
  return stored ? JSON.parse(stored) : []
}

function calculateConsecutiveDays(entries: DaySheetEntry[]): number {
  if (entries.length === 0) return 0

  const dates = [...new Set(entries.map((e) => e.date))]
    .sort()
    .reverse()
    .map((d) => new Date(d))

  let consecutive = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date(today)
    expectedDate.setDate(today.getDate() - i)
    expectedDate.setHours(0, 0, 0, 0)

    const entryDate = new Date(dates[i])
    entryDate.setHours(0, 0, 0, 0)

    if (
      entryDate.getTime() === expectedDate.getTime() ||
      (i === 0 && entryDate.getTime() === expectedDate.getTime() - 86400000)
    ) {
      consecutive++
    } else {
      break
    }
  }

  return consecutive
}

