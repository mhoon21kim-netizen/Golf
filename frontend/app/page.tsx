'use client'

import { useState, useEffect } from 'react'
import { Level, JudgmentResult, FailureType, UserProgress, DaySheetEntry } from '../shared/types'
import VideoUpload from './components/VideoUpload'
import JudgmentResultDisplay from './components/JudgmentResultDisplay'
import DaySheet from './components/DaySheet'
import { getProgress, saveProgress, saveDaySheetEntry } from './lib/storage'
import { analyzeVideo } from './lib/api'

export default function Home() {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastJudgment, setLastJudgment] = useState<any>(null)

  useEffect(() => {
    const saved = getProgress()
    setProgress(saved)
  }, [])

  const handleVideoUpload = async (file: File) => {
    if (!progress) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeVideo(progress.currentLevel, file)
      setLastJudgment(result)

      // Day Sheet 저장
      const entry: DaySheetEntry = {
        date: new Date().toISOString().split('T')[0],
        level: progress.currentLevel,
        result: result.result,
        failureType: result.failureType,
        attemptCount: 1, // TODO: 실제 시도 횟수 계산
      }
      saveDaySheetEntry(entry)

      // PASS 시 다음 단계로
      if (result.result === JudgmentResult.PASS) {
        const nextLevel = Math.min(progress.currentLevel + 1, 3) as Level
        const updated: UserProgress = {
          ...progress,
          currentLevel: nextLevel,
        }
        setProgress(updated)
        saveProgress(updated)
      }
    } catch (error) {
      console.error('분석 실패:', error)
      alert('분석 중 오류가 발생했습니다.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!progress) {
    const initial: UserProgress = {
      currentLevel: Level.Lv1,
      daySheets: [],
      totalDays: 0,
      consecutiveDays: 0,
    }
    setProgress(initial)
    saveProgress(initial)
    return null
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Level {progress.currentLevel}
      </h1>

      <VideoUpload
        onUpload={handleVideoUpload}
        isAnalyzing={isAnalyzing}
      />

      {lastJudgment && (
        <div className="mt-4">
          <JudgmentResultDisplay
            level={progress.currentLevel}
            judgment={lastJudgment}
          />
        </div>
      )}

      <div className="mt-4">
        <DaySheet entries={progress.daySheets} />
      </div>
    </main>
  )
}

