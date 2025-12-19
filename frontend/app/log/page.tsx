'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DaySheetEntry, JudgmentResult, FailureType } from '../../../shared/types'
import { getProgress } from '../lib/storage'

// PRD 화면 3: Log / Day Sheet
export default function Log() {
  const router = useRouter()
  const progress = getProgress()
  const entries = progress.daySheets || []

  const failureTypeLabels: Record<FailureType, string> = {
    [FailureType.NONE]: '-',
    [FailureType.GRIP_WEAK]: '그립 약함',
    [FailureType.ADDRESS_UNSTABLE]: '어드레스 불안정',
    [FailureType.SLICE]: '슬라이스',
    [FailureType.RHYTHM_UNSTABLE]: '리듬 불안정',
    [FailureType.FAT_SHOT]: '팻 샷',
    [FailureType.TOPPING]: '토핑',
  }

  const [selectedDay, setSelectedDay] = useState<DaySheetEntry | null>(null)

  return (
    <main className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* 리스트 */}
      <div className="mb-6">
        <div className="text-lg font-normal text-gray-900 mb-4">Day Sheet</div>
        
        {entries.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-8">
            기록이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {(() => {
              // 날짜별로 그룹화 (같은 날짜는 하나로 표시)
              const uniqueDates = [...new Set(entries.map(e => e.date))].sort().reverse()
              return uniqueDates.map((date, index) => {
                const dayEntries = entries.filter(e => e.date === date)
                const latestEntry = dayEntries[dayEntries.length - 1] // 최신 항목
                const totalAttempts = dayEntries.reduce((sum, e) => sum + e.attemptCount, 0)
                const dayNumber = uniqueDates.length - index
                
                return (
                  <div
                    key={date}
                    className="border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setSelectedDay(latestEntry)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-medium">
                          Day {dayNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Lv{latestEntry.level} · {date}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          latestEntry.result === JudgmentResult.PASS
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {latestEntry.result}
                        </span>
                        {latestEntry.result === JudgmentResult.FAIL && latestEntry.failureType !== FailureType.NONE && (
                          <span className="text-xs text-gray-600">
                            {failureTypeLabels[latestEntry.failureType]}
                          </span>
                        )}
                        {totalAttempts > 1 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {totalAttempts}회
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        )}
      </div>

      {/* 상세 보기 */}
      {selectedDay && (
        <div className="mb-6 border border-gray-200 rounded p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">상세 정보</div>
          <div className="space-y-1 text-sm">
            <div>날짜: {selectedDay.date}</div>
            <div>레벨: Lv{selectedDay.level}</div>
            <div>결과: {selectedDay.result}</div>
            {selectedDay.failureType !== FailureType.NONE && (
              <div>실패 타입: {failureTypeLabels[selectedDay.failureType]}</div>
            )}
            <div>시도 횟수: {(() => {
              const dayEntries = entries.filter(e => e.date === selectedDay.date && e.level === selectedDay.level)
              return dayEntries.reduce((sum, e) => sum + e.attemptCount, 0)
            })()}회</div>
          </div>
          <button
            onClick={() => setSelectedDay(null)}
            className="mt-3 text-xs text-gray-600 underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 네비게이션: 홈으로 이동 */}
      <div className="text-center">
        <button
          onClick={() => router.push('/')}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm"
        >
          홈으로 이동
        </button>
      </div>
    </main>
  )
}

