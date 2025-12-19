'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Level, JudgmentResult, FailureType, UserProgress } from '../../shared/types'
import { getProgress, saveProgress } from './lib/storage'
import { analyzeVideo } from './lib/api'
import ErrorDisplay from './components/ErrorDisplay'

// PRD 화면 1: Home / 오늘의 연습
export default function Home() {
  const router = useRouter()
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProgress = () => {
      const saved = getProgress()
      setProgress(saved)
    }
    
    loadProgress()
    
    // 화면 포커스 시 progress 다시 로드 (다른 화면에서 돌아올 때)
    window.addEventListener('focus', loadProgress)
    
    return () => {
      window.removeEventListener('focus', loadProgress)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !progress) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeVideo(progress.currentLevel, selectedFile)
      
      // Result 화면으로 이동 (결과를 쿼리 파라미터로 전달)
      const params = new URLSearchParams({
        result: result.result,
        failureType: result.failureType,
        problem: result.feedback.problem,
        reason: result.feedback.reason,
        todayPractice: result.feedback.todayPractice,
        level: progress.currentLevel.toString(),
      })
      router.push(`/result?${params.toString()}`)
    } catch (error: any) {
      console.error('분석 실패:', error)
      const errorMessage = error.message || '분석 중 오류가 발생했습니다.'
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!progress) {
    return null
  }

  // PRD 4.2 필수 UI 요소
  const levelText = `Lv${progress.currentLevel}`
  const levelGoals: Record<Level, string> = {
    [Level.Lv1]: '그립 & 어드레스 안정',
    [Level.Lv2]: '스윙 궤도 & 리듬',
    [Level.Lv3]: '아이언 임팩트',
  }
  const todayGoal = levelGoals[progress.currentLevel]

  // PASS 필요 횟수 계산 (최근 3회 중 PASS 횟수)
  // 같은 날짜의 항목은 하나로 카운트
  const today = new Date().toISOString().split('T')[0]
  const todayEntries = progress.daySheets.filter(e => e.date === today)
  const recentEntries = progress.daySheets.slice(-3)
  const passCount = recentEntries.filter(e => e.result === JudgmentResult.PASS).length
  const lastEntry = progress.daySheets[progress.daySheets.length - 1]
  
  // 오늘 시도 횟수
  const todayAttemptCount = todayEntries.length

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* 현재 단계 */}
      <div className="text-center mb-6">
        <div className="text-lg font-normal text-gray-700 mb-2">
          {levelText} · {todayGoal}
        </div>
      </div>

      {/* 오늘의 목표 카드 */}
      <div className="bg-white border border-gray-200 rounded p-4 mb-4">
        <div className="text-sm text-gray-600 mb-1">오늘의 목표</div>
        <div className="text-base text-gray-900">{todayGoal}</div>
      </div>

      {/* 상태 표시: PASS 필요 횟수, 최근 판정 결과 */}
      <div className="mb-4 space-y-2">
        <div className="text-sm text-gray-600">
          3회 중 {passCount}회 완료
          {todayAttemptCount > 0 && (
            <span className="ml-2 text-gray-500">
              (오늘 {todayAttemptCount}회 시도)
            </span>
          )}
        </div>
        {lastEntry && (
          <div className="text-sm">
            최근 판정: 
            <span className={`ml-2 font-semibold ${
              lastEntry.result === JudgmentResult.PASS ? 'text-green-600' : 'text-red-600'
            }`}>
              {lastEntry.result}
            </span>
            {lastEntry.result === JudgmentResult.FAIL && lastEntry.failureType !== FailureType.NONE && (
              <span className="ml-2 text-gray-600">
                {lastEntry.failureType}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Primary Button: 스윙 영상 업로드 */}
      <div className="mb-4">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
        />
        {!selectedFile ? (
          <label
            htmlFor="video-upload"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded cursor-pointer hover:bg-blue-700"
          >
            스윙 영상 업로드
          </label>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-gray-600 text-center">
              선택된 파일: {selectedFile.name}
            </div>
            <button
              onClick={handleUpload}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded disabled:opacity-50"
            >
              {isAnalyzing ? '분석 중...' : '분석 시작'}
            </button>
            <button
              onClick={() => setSelectedFile(null)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 에러 표시 */}
      {error && (
        <ErrorDisplay
          message={error}
          onRetry={() => {
            setError(null)
            if (selectedFile) {
              handleUpload()
            }
          }}
          onClose={() => setError(null)}
        />
      )}

      {/* Secondary Link: 오늘 연습 보기 */}
      <div className="text-center">
        <button
          onClick={() => router.push('/log')}
          className="text-sm text-gray-600 underline"
        >
          오늘 연습 보기
        </button>
      </div>
    </main>
  )
}
