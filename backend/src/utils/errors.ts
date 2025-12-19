/**
 * 커스텀 에러 클래스
 */

export class JudgmentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'JudgmentError'
    Object.setPrototypeOf(this, JudgmentError.prototype)
  }
}

export class ValidationError extends JudgmentError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AIEngineError extends JudgmentError {
  constructor(message: string) {
    super(message, 'AI_ENGINE_ERROR', 500)
    this.name = 'AIEngineError'
    Object.setPrototypeOf(this, AIEngineError.prototype)
  }
}

