import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { supabase } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Docker Build System',
  description: 'Submit GitHub repos for Docker builds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}