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
  title: 'Малай Наталія Борисівна — Нейрометодика і масаж',
  description:
    'Професійна нейрометодика, масаж, реабілітація і робота зі складними станами. Індивідуальний підхід до кожного.',
  keywords: 'нейрометодика, масаж, реабілітація, лікування, Малай Наталія',
  openGraph: {
    title: 'Малай Наталія Борисівна — Нейрометодика і масаж',
    description: 'Професійна нейрометодика, масаж, реабілітація',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${inter.variable} ${interSans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
