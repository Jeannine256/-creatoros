import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CreatorOS — Sponsorship & Content Management',
  description: 'The operating system for professional content creators.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  )
}
