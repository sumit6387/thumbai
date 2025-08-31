import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Thumbnail Generator',
  description: 'Generate stunning thumbnails from images using AI-powered prompts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
