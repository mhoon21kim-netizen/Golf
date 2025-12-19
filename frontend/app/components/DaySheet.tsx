'use client'

import { DaySheetEntry, JudgmentResult, FailureType } from '../../../shared/types'
import { format } from 'date-fns'

interface DaySheetProps {
  entries: DaySheetEntry[]
}

const failureTypeLabels: Record<FailureType, string> = {
  [FailureType.NONE]: '-',
  [FailureType.GRIP_WEAK]: '그립 약함',
  [FailureType.ADDRESS_UNSTABLE]: '어드레스 불안정',
  [FailureType.SLICE]: '슬라이스',
  [FailureType.RHYTHM_UNSTABLE]: '리듬 불안정',
  [FailureType.FAT_SHOT]: '팻 샷',
  [FailureType.TOPPING]: '토핑',
}

export default function DaySheet({ entries }: DaySheetProps) {
  if (entries.length === 0) {
    return null
  }

  const recentEntries = entries.slice().reverse().slice(0, 5)

  return (
    <div className="mt-4 text-sm">
      <div className="font-semibold mb-2">최근 기록</div>
      <div className="space-y-1">
        {recentEntries.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b pb-1"
          >
            <span>{format(new Date(entry.date), 'MM-dd')}</span>
            <span className="text-xs">Lv{entry.level}</span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                entry.result === JudgmentResult.PASS
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {entry.result}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

