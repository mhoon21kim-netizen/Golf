import { Request, Response, NextFunction } from 'express'
import { JudgmentError } from '../utils/errors'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof JudgmentError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  // Multer 에러 처리
  if (err.name === 'MulterError') {
    res.status(400).json({
      error: err.message || '파일 업로드 중 오류가 발생했습니다.',
      code: 'UPLOAD_ERROR',
    })
    return
  }

  // 기타 에러
  console.error('서버 오류:', err)
  res.status(500).json({
    error: err.message || '서버 오류가 발생했습니다.',
    code: 'INTERNAL_ERROR',
  })
}

