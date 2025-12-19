import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createJudgmentRouter } from './routes/judgmentRoutes'
import { errorHandler } from './middleware/errorHandler'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// 미들웨어
app.use(cors())
app.use(express.json())

// 라우트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/judgment', createJudgmentRouter())

// 에러 처리 미들웨어 (모든 라우트 이후에 위치)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`AI 엔진 URL: ${process.env.AI_ENGINE_URL || 'http://localhost:5000'}`)
})

