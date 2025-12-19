'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Level, JudgmentResult, FailureType } from '../../../shared/types'
import { getProgress, saveProgress, saveDaySheetEntry } from '../lib/storage'

// PRD 화면 2: Result / 스윙 분석 결과
export default function Result() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 쿼리 파라미터에서 결과 받기
  const result = searchParams.get('result') as JudgmentResult
  const failureType = searchParams.get('failureType') as FailureType
  const problem = searchParams.get('problem') || ''
  const reason = searchParams.get('reason') || ''
  const todayPractice = searchParams.get('todayPractice') || ''
  const level = parseInt(searchParams.get('level') || '1') as Level

  const isPass = result === JudgmentResult.PASS

  const handleComplete = () => {
    // Day Sheet 저장
    const entry = {
      date: new Date().toISOString().split('T')[0],
      level,
      result,
      failureType: failureType || FailureType.NONE,
      attemptCount: 1,
    }
    saveDaySheetEntry(entry)

    // PASS 시 다음 레벨로
    if (result === JudgmentResult.PASS) {
      const progress = getProgress()
      const nextLevel = Math.min(progress.currentLevel + 1, 3) as Level
      progress.currentLevel = nextLevel
      saveProgress(progress)
    }

    // 홈으로 이동
    router.push('/')
  }

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* 분석 단계 표시 */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-600">
          Lv{level} 분석 결과
        </div>
      </div>

      {/* 판정 결과 */}
      <div className={`mb-4 p-4 rounded border ${
        isPass ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}>
        <div className={`text-2xl font-bold text-center ${
          isPass ? 'text-green-600' : 'text-red-600'
        }`}>
          {result}
        </div>
      </div>

      {/* 문제 (FAIL일 경우만) */}
      {!isPass && problem && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">문제</div>
          <div className="text-base text-gray-900">{problem}</div>
        </div>
      )}

      {/* 이유 (FAIL일 경우만) */}
      {!isPass && reason && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">이유</div>
          <div className="text-base text-gray-900">{reason}</div>
        </div>
      )}

      {/* 오늘 연습 */}
      {todayPractice && (
        <div className="mb-6">
          <div className="text-sm text-gray-600 mb-1">오늘 연습</div>
          <div className="text-base text-gray-900 font-medium">{todayPractice}</div>
        </div>
      )}

      {/* 버튼 */}
      <div className="space-y-2">
        <button
          onClick={handleComplete}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded"
        >
          연습 완료 체크
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
        >
          홈으로 이동
        </button>
      </div>
    </main>
  )
}

