import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})

const interSans = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Малай Наталья Борисовна — Нейрометодика и Массаж',
  description:
    'Профессиональная нейрометодика, массаж, реабилитация и лечение сложных заболеваний. Индивидуальный подход к каждому пациенту.',
  keywords: 'нейрометодика, массаж, реабилитация, лечение, Малай Наталья',
  openGraph: {
    title: 'Малай Наталья Борисовна — Нейрометодика и Массаж',
    description: 'Профессиональная нейрометодика, массаж, реабилитация',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${interSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
