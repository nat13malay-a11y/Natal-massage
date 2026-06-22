'use client'

import { useEffect, useMemo, useState } from 'react'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import MiniAppHeader from '@/components/MiniAppHeader'
import { useI18n, type Lang } from '@/i18n'

type MiniLang = Lang

type Summary = {
  total: number
  uniqueVisitors: number
  returningPercent: number
  readersPercent: number
  accidentalPercent: number
  avgDuration: number
  avgReadScore: number
  site: number
  miniapp: number
}

const emptySummary: Summary = {
  total: 0,
  uniqueVisitors: 0,
  returningPercent: 0,
  readersPercent: 0,
  accidentalPercent: 0,
  avgDuration: 0,
  avgReadScore: 0,
  site: 0,
  miniapp: 0,
}

const text = {
  uk: {
    title: 'Портфоліо',
    cards: 'Картки',
    analytics: 'Аналітика',
    visits: 'Візити',
    unique: 'Унікальні',
    returns: 'Повернення',
    reading: 'Читають інформацію',
    accidental: 'Випадкові входи',
    avgTime: 'Середній час',
    readScore: 'Індекс читання',
    split: 'Джерела',
    site: 'Сайт',
    miniapp: 'Mini app',
  },
  ru: {
    title: 'Портфолио',
    cards: 'Карточки',
    analytics: 'Аналитика',
    visits: 'Визиты',
    unique: 'Уникальные',
    returns: 'Возвраты',
    reading: 'Читают информацию',
    accidental: 'Случайные входы',
    avgTime: 'Среднее время',
    readScore: 'Индекс чтения',
    split: 'Источники',
    site: 'Сайт',
    miniapp: 'Mini app',
  },
  en: {
    title: 'Portfolio',
    cards: 'Cards',
    analytics: 'Analytics',
    visits: 'Visits',
    unique: 'Unique',
    returns: 'Returns',
    reading: 'Reading info',
    accidental: 'Accidental visits',
    avgTime: 'Average time',
    readScore: 'Read score',
    split: 'Sources',
    site: 'Site',
    miniapp: 'Mini app',
  },
}

function getLang(): MiniLang {
  if (typeof window === 'undefined') return 'uk'
  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code
  if (tgLang?.startsWith('ru')) return 'ru'
  if (tgLang?.startsWith('en')) return 'en'
  return 'uk'
}

function seconds(value: number) {
  if (value < 60) return `${value}s`
  return `${Math.floor(value / 60)}m ${value % 60}s`
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void
        expand?: () => void
        initDataUnsafe?: { user?: { language_code?: string } }
      }
    }
  }
}

export default function BotMiniApp() {
  const { lang, setLang } = useI18n()
  const [summary, setSummary] = useState<Summary>(emptySummary)
  const t = text[lang]

  useEffect(() => {
    const telegramLang = getLang()
    const savedLang = window.localStorage.getItem('site-lang')
    if (!savedLang) setLang(telegramLang)
    window.Telegram?.WebApp?.ready?.()
    window.Telegram?.WebApp?.expand?.()
  }, [setLang])

  useEffect(() => {
    const load = async () => {
      const response = await fetch('/api/analytics/summary', { cache: 'no-store' }).catch(() => null)
      if (response?.ok) {
        const data = await response.json()
        setSummary({ ...emptySummary, ...data })
      }
    }

    load()
    const interval = window.setInterval(load, 10000)

    return () => window.clearInterval(interval)
  }, [])

  const stats = useMemo(
    () => [
      { label: t.visits, value: summary.total },
      { label: t.unique, value: summary.uniqueVisitors },
      { label: t.returns, value: `${summary.returningPercent}%` },
      { label: t.reading, value: `${summary.readersPercent}%` },
      { label: t.accidental, value: `${summary.accidentalPercent}%` },
      { label: t.avgTime, value: seconds(summary.avgDuration) },
      { label: t.readScore, value: `${summary.avgReadScore}%` },
    ],
    [summary, t],
  )

  return (
    <main className="min-h-screen bg-[#f5fbff] px-4 pb-5 pt-28 text-slate-800 sm:pt-32">
      <AnalyticsTracker source="miniapp" />
      <MiniAppHeader active="analytics" />
      <h1 className="sr-only">{t.title}</h1>

      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="stat-number" style={{ fontSize: '2rem' }}>{item.value}</div>
              <div className="mt-1 text-xs font-bold uppercase text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase text-slate-500">{t.split}</h2>
          <div className="space-y-3">
            <Bar label={t.site} value={summary.site} total={summary.total} />
            <Bar label={t.miniapp} value={summary.miniapp} total={summary.total} />
          </div>
        </div>
      </section>
    </main>
  )
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-semibold text-slate-600">
        <span>{label}</span>
        <span>{width}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sage-400" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
