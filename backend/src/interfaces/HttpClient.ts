/**
 * HTTP 클라이언트 인터페이스
 * 의존성 역전 원칙을 위한 추상화
 */

export interface HttpClient {
  post<T = any>(
    url: string,
    data?: any,
    config?: {
      headers?: Record<string, string>
      timeout?: number
    }
  ): Promise<{ data: T; status: number }>
}

