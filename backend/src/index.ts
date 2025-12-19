import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'
import { judgmentHandler } from './handlers/judgmentHandler'
import { Level } from '../../shared/types'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 미들웨어
app.use(cors())
app.use(express.json())

// 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, '../uploads')
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
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('비디오 파일만 업로드 가능합니다.'))
    }
  },
})

// 라우트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/judgment', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '비디오 파일이 필요합니다.' })
    }

    const level = parseInt(req.body.level) as Level
    if (!level || level < 1 || level > 3) {
      return res.status(400).json({ error: '유효하지 않은 레벨입니다.' })
    }

    const result = await judgmentHandler(level, req.file.path)

    // 임시 파일 삭제 (선택사항)
    // fs.unlinkSync(req.file.path)

    res.json(result)
  } catch (error: any) {
    console.error('판정 오류:', error)
    res.status(500).json({ error: error.message || '판정 중 오류가 발생했습니다.' })
  }
})

app.listen(PORT, () => {
  console.log(`백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`AI 엔진 URL: ${process.env.AI_ENGINE_URL || 'http://localhost:5000'}`)
})

