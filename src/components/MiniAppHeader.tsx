'use client'

import Link from 'next/link'
import { useI18n, type Lang } from '@/i18n'

type ActiveTab = 'cards' | 'analytics'

const copy: Record<Lang, {
  cards: string
  analytics: string
  language: string
}> = {
  uk: {
    cards: 'Картки',
    analytics: 'Аналітика',
    language: 'Мова',
  },
  ru: {
    cards: 'Карточки',
    analytics: 'Аналитика',
    language: 'Язык',
  },
  en: {
    cards: 'Cards',
    analytics: 'Analytics',
    language: 'Language',
  },
}

const langLabels: Array<{ value: Lang; label: string; full: string }> = [
  { value: 'uk', label: 'UA', full: 'UKR' },
  { value: 'ru', label: 'RU', full: 'RUS' },
  { value: 'en', label: 'EN', full: 'ENG' },
]

export default function MiniAppHeader({ active }: { active: ActiveTab }) {
  const { lang, setLang } = useI18n()
  const t = copy[lang]
  const currentLang = langLabels.find((item) => item.value === lang) ?? langLabels[0]

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-5 sm:px-5" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="mx-auto flex w-full max-w-3xl items-center gap-1 rounded-full border border-white/60 bg-white/34 p-1.5 shadow-[0_22px_55px_rgba(15,23,42,0.18),inset_0_2px_3px_rgba(255,255,255,0.78),inset_0_-2px_5px_rgba(255,255,255,0.24)] backdrop-blur-[32px] saturate-[1.8]">
        <div className="pointer-events-none absolute inset-x-4 top-4 h-8 rounded-t-full bg-gradient-to-b from-white/80 to-white/0" />
        <div className="relative z-10 grid min-w-0 flex-1 grid-cols-2 gap-1">
          <HeaderTab href="/portfolio" label={t.cards} active={active === 'cards'} Icon={CardsIcon} />
          <HeaderTab href="/bot-app" label={t.analytics} active={active === 'analytics'} Icon={AnalyticsIcon} />
        </div>

        <div className="relative z-10 group h-[58px] w-[64px] shrink-0">
          <button
            type="button"
            className="flex h-[58px] w-[64px] cursor-pointer flex-col items-center justify-center rounded-full border border-sky-100/70 bg-white/50 text-sky-900 shadow-[inset_0_1px_1px_rgba(255,255,255,0.86),0_8px_18px_rgba(61,148,192,0.18)] transition-colors hover:bg-white/72"
            aria-label={t.language}
          >
            <span className="text-lg font-black leading-none">{currentLang.label}</span>
            <span className="mt-1 text-[10px] font-extrabold leading-none text-sky-700">{currentLang.full}</span>
            <span className="mt-2 h-1 w-7 rounded-full bg-sage-500" />
          </button>

          <div className="pointer-events-none absolute right-0 top-[64px] grid w-[64px] gap-1 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
            {langLabels.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setLang(item.value)}
                className={`min-h-11 rounded-full border border-white/70 px-2 text-xs font-black shadow-sm backdrop-blur-xl transition-colors ${
                  lang === item.value ? 'bg-sky-100 text-sky-800' : 'bg-white/80 text-slate-600 hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

function HeaderTab({
  href,
  label,
  active,
  Icon,
}: {
  href: string
  label: string
  active: boolean
  Icon: () => JSX.Element
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-full px-2 text-sm font-extrabold leading-none transition-colors ${
        active
          ? 'bg-white/58 text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)]'
          : 'text-sky-900 hover:bg-white/34'
      }`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  )
}

function CardsIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5.5h16" />
      <path d="M6 10h12" />
      <path d="M7 14.5h5" />
      <path d="M4 19V5.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </svg>
  )
}
