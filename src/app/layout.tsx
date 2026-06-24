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
  metadataBase: new URL('https://natal-massage.vercel.app'),
  title: {
    default: 'Малай Наталія Борисівна — нейрореабілітолог, масаж і реабілітація',
    template: '%s | Малай Наталія Борисівна',
  },
  description:
    'Наталія Борисівна Малай — нейрореабілітолог в Одесі та Білгороді-Дністровському. Авторська нейрометодика, лікувальний масаж, реабілітація після інсульту, робота з ДЦП, хворобою Паркінсона та складними неврологічними станами.',
  keywords: [
    'нейрореабілітолог Одеса',
    'нейрометодика',
    'лікувальний масаж',
    'реабілітація ДЦП',
    'реабілітація після інсульту',
    'хвороба Паркінсона',
    'масаж Білгород-Дністровський',
    'Малай Наталія Борисівна',
  ],
  authors: [{ name: 'Малай Наталія Борисівна' }],
  creator: 'Малай Наталія Борисівна',
  publisher: 'Малай Наталія Борисівна',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Малай Наталія Борисівна — нейрореабілітолог, масаж і реабілітація',
    description:
      'Авторська нейрометодика, лікувальний масаж і реабілітація при складних неврологічних станах.',
    url: '/',
    siteName: 'Малай Наталія Борисівна',
    images: [
      {
        url: '/assets/natalya-professor.jpg',
        width: 1200,
        height: 630,
        alt: 'Малай Наталія Борисівна — нейрореабілітолог',
      },
    ],
    type: 'website',
    locale: 'uk_UA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Малай Наталія Борисівна — нейрореабілітолог, масаж і реабілітація',
    description:
      'Авторська нейрометодика, лікувальний масаж і реабілітація при складних неврологічних станах.',
    images: ['/assets/natalya-professor.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Малай Наталія Борисівна',
    description:
      'Нейрореабілітолог, авторська нейрометодика, лікувальний масаж і реабілітація.',
    areaServed: ['Одеса', 'Білгород-Дністровський', 'Україна'],
    medicalSpecialty: ['Neurologic', 'Physiotherapy', 'Rehabilitation'],
    telephone: '+380501419758',
    email: 'nat13malay@gmail.com',
    url: 'https://natal-massage.vercel.app',
    sameAs: [
      'https://www.instagram.com/nat1304_massage?igsh=aTdkdXNmNHg0dHA2',
      'https://t.me/NatMalay',
    ],
  }

  return (
    <html lang="uk" className={`${inter.variable} ${interSans.variable}`}>
      <body className="antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
