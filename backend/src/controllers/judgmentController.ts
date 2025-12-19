import { Request, Response, NextFunction } from 'express'
import { Level } from '../../../shared/types'
import { judgmentHandler } from '../handlers/judgmentHandler'
import { ValidationError } from '../utils/errors'

export async function handleJudgment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new ValidationError('비디오 파일이 필요합니다.')
    }

    const level = parseInt(req.body.level) as Level
    if (!level || level < 1 || level > 3) {
      throw new ValidationError('유효하지 않은 레벨입니다.')
    }

    const result = await judgmentHandler(level, req.file.path)

    // 임시 파일 삭제 (선택사항)
    // fs.unlinkSync(req.file.path)

    res.json(result)
  } catch (error) {
    next(error) // 에러는 미들웨어에서 처리
  }
}

