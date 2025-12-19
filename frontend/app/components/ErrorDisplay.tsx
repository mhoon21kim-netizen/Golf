'use client'

interface ErrorDisplayProps {
  message: string
  onRetry?: () => void
  onClose?: () => void
}

export default function ErrorDisplay({ message, onRetry, onClose }: ErrorDisplayProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
      <div className="text-red-800 font-semibold mb-2">오류 발생</div>
      <div className="text-sm text-red-700 mb-3">{message}</div>
      <div className="text-xs text-red-600 mb-3">
        <div>확인사항:</div>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>백엔드 서버가 실행 중인지 확인 (포트 3001)</li>
          <li>AI 엔진이 실행 중인지 확인 (포트 5000)</li>
          <li>브라우저 콘솔에서 자세한 오류 확인</li>
        </ul>
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            다시 시도
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  )
}



