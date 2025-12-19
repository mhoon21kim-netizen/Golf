'use client'

import { Level, JudgmentResult, FailureType } from '../../../shared/types'

interface JudgmentResultDisplayProps {
  level: Level
  judgment: {
    result: JudgmentResult
    failureType: FailureType
    feedback: {
      problem: string
      reason: string
      todayPractice: string
    }
    metrics: any
  }
}

const failureTypeLabels: Record<FailureType, string> = {
  [FailureType.NONE]: '없음',
  [FailureType.GRIP_WEAK]: '그립 약함',
  [FailureType.ADDRESS_UNSTABLE]: '어드레스 불안정',
  [FailureType.SLICE]: '슬라이스',
  [FailureType.RHYTHM_UNSTABLE]: '리듬 불안정',
  [FailureType.FAT_SHOT]: '팻 샷',
  [FailureType.TOPPING]: '토핑',
}

export default function JudgmentResultDisplay({
  level,
  judgment,
}: JudgmentResultDisplayProps) {
  const isPass = judgment.result === JudgmentResult.PASS

  return (
    <div
      className={`p-4 rounded border ${
        isPass ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">{judgment.result}</span>
      </div>

      {!isPass && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">문제:</span>{' '}
            {judgment.feedback.problem}
          </div>
          <div>
            <span className="font-semibold">이유:</span>{' '}
            {judgment.feedback.reason}
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t">
        <span className="font-semibold">오늘 연습:</span>{' '}
        {judgment.feedback.todayPractice}
      </div>
    </div>
  )
}

