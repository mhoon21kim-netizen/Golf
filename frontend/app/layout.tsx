import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Personal AI Golf Coach',
  description: '골프 초보자를 위한 단계별 AI 코치',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}

