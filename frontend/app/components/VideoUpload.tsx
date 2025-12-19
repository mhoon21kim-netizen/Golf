'use client'

import { useState, useRef } from 'react'

interface VideoUploadProps {
  onUpload: (file: File) => void
  isAnalyzing: boolean
}

export default function VideoUpload({ onUpload, isAnalyzing }: VideoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {preview ? (
        <div className="space-y-2">
          <video src={preview} controls className="w-full max-h-48 rounded" />
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                setSelectedFile(null)
                setPreview(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              className="px-3 py-1 text-sm border rounded"
              disabled={isAnalyzing}
            >
              취소
            </button>
            <button
              onClick={handleUpload}
              disabled={isAnalyzing}
              className="px-3 py-1 text-sm bg-primary-500 text-white rounded disabled:opacity-50"
            >
              {isAnalyzing ? '분석 중...' : '분석'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary-500 text-white rounded"
          disabled={isAnalyzing}
        >
          영상 선택
        </button>
      )}
    </div>
  )
}

