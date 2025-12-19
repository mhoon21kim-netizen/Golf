import express, { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { handleJudgment } from '../controllers/judgmentController'
import { MAX_FILE_SIZE_BYTES } from '../rules/judgmentCriteria'

export function createJudgmentRouter(): Router {
  const router = express.Router()

  // 업로드 디렉토리 생성
  const uploadDir = path.join(__dirname, '../../uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // Multer 설정
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`)
    },
  })

  const upload = multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true)
      } else {
        cb(new Error('비디오 파일만 업로드 가능합니다.'))
      }
    },
  })

  router.post('/', upload.single('video'), handleJudgment)

  return router
}

