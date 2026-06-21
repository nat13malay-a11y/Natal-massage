'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useI18n, type Lang } from '@/i18n'

const labels: Record<Lang, {
  nav: Array<{ href: string; label: string }>
  mobile: Array<{ href: string; label: string; Icon: typeof HomeIcon }>
  brand: string
  top: string
  ariaMobile: string
  switchTo: string
}> = {
  uk: {
    nav: [
      { href: '#about', label: 'Про мене' },
      { href: '#scene', label: 'Методика' },
      { href: '#results', label: 'Результати' },
      { href: '#contact', label: 'Контакти' },
    ],
    mobile: [
      { href: '#hero', label: 'Головна', Icon: HomeIcon },
      { href: '#scene', label: 'Методика', Icon: MethodIcon },
      { href: '#results', label: 'Кейси', Icon: ResultsIcon },
      { href: '#contact', label: 'Запис', Icon: ContactIcon },
    ],
    brand: 'Малай Н.Б.',
    top: 'Повернутися на початок сторінки',
    ariaMobile: 'Основна мобільна навігація',
    switchTo: 'Переключити на російську',
  },
  ru: {
    nav: [
      { href: '#about', label: 'Обо мне' },
      { href: '#scene', label: 'Методика' },
      { href: '#results', label: 'Результаты' },
      { href: '#contact', label: 'Контакты' },
    ],
    mobile: [
      { href: '#hero', label: 'Главная', Icon: HomeIcon },
      { href: '#scene', label: 'Методика', Icon: MethodIcon },
      { href: '#results', label: 'Кейсы', Icon: ResultsIcon },
      { href: '#contact', label: 'Запись', Icon: ContactIcon },
    ],
    brand: 'Малай Н.Б.',
    top: 'Вернуться к началу страницы',
    ariaMobile: 'Основная мобильная навигация',
    switchTo: 'Переключить на украинский',
  },
}

const navHrefs = ['#hero', '#scene', '#results', '#contact']

export default function Navigation() {
  const { lang, toggleLang } = useI18n()
  const t = labels[lang]
  const [scrolled, setScrolled] = useState(false)
  const [activeHref, setActiveHref] = useState('#hero')
  const [pillStyle, setPillStyle] = useState<CSSProperties>({ opacity: 0 })
  const navItemsRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const updateActivePill = useCallback((href: string) => {
    const button = itemRefs.current[href]
    if (!button) return

    setPillStyle({
      opacity: 1,
      width: button.offsetWidth,
      transform: `translateX(${button.offsetLeft}px)`,
    })
  }, [])

  useEffect(() => {
    const updateActiveFromScroll = () => {
      const anchorY = window.scrollY + window.innerHeight * 0.46
      let current = navHrefs[0]

      navHrefs.forEach((href) => {
        const section = document.querySelector<HTMLElement>(href)
        if (section && section.offsetTop <= anchorY) current = href
      })

      setActiveHref(current)
    }

    window.addEventListener('scroll', updateActiveFromScroll, { passive: true })
    window.addEventListener('resize', updateActiveFromScroll)
    updateActiveFromScroll()

    return () => {
      window.removeEventListener('scroll', updateActiveFromScroll)
      window.removeEventListener('resize', updateActiveFromScroll)
    }
  }, [])

  useEffect(() => {
    const syncPill = () => updateActivePill(activeHref)
    const frame = window.requestAnimationFrame(syncPill)

    window.addEventListener('resize', syncPill)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', syncPill)
    }
  }, [activeHref, updateActivePill])

  const scrollTo = (href: string) => {
    setActiveHref(href)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav
        className="fixed left-0 right-0 top-4 z-50 hidden px-6 pointer-events-none md:block"
      >
        <div
          className={`pointer-events-auto max-w-7xl mx-auto px-5 py-2.5 flex items-center justify-between rounded-full glass bg-white/82 transition-shadow duration-300 ${
            scrolled ? 'shadow-lg shadow-sky-100/40' : 'shadow-sm shadow-slate-200/30'
          }`}
        >
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group cursor-pointer rounded-full"
            aria-label={t.top}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-300 to-sage-300 flex items-center justify-center shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <span className="heading-section text-lg text-slate-700 group-hover:text-sky-500 transition-colors">
              {t.brand}
            </span>
          </button>

          <ul className="flex items-center gap-8">
            {t.nav.map(({ href, label }) => (
              <li key={href}>
                <button
                  onClick={() => scrollTo(href)}
                  className="animated-underline cursor-pointer rounded-md text-slate-600 hover:text-sky-600 transition-colors font-sans text-sm font-medium"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={toggleLang}
            className="min-h-[42px] rounded-full border border-sky-200 bg-white/70 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700"
            aria-label={t.switchTo}
          >
            {lang === 'uk' ? 'RU' : 'UA'}
          </button>
        </div>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-3 z-50 px-3 pointer-events-none md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={t.ariaMobile}
      >
        <div className="pointer-events-auto relative mx-auto flex w-full max-w-[390px] items-center rounded-full border border-white/55 bg-white/30 p-1.5 shadow-[0_22px_55px_rgba(15,23,42,0.20),inset_0_2px_3px_rgba(255,255,255,0.78),inset_0_-2px_5px_rgba(255,255,255,0.24)] backdrop-blur-[32px] saturate-[1.9]">
          <div className="pointer-events-none absolute inset-x-1 top-1 h-[46%] rounded-t-full bg-gradient-to-b from-white/75 to-white/0" />
          <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(150,202,232,0.32),transparent_58%)]" />
          <div ref={navItemsRef} className="relative z-10 flex w-full items-center gap-1">
            <div
              className="absolute left-0 top-0 h-11 rounded-full bg-white/72 shadow-[0_7px_18px_rgba(15,23,42,0.12),inset_0_1px_1px_rgba(255,255,255,0.88)] transition-[transform,width,opacity] duration-500 ease-out"
              style={pillStyle}
              aria-hidden="true"
            />

            {t.mobile.map(({ href, label, Icon }) => (
              <button
                key={href}
                ref={(node) => {
                  itemRefs.current[href] = node
                }}
                onClick={() => scrollTo(href)}
                className={`relative z-10 flex h-11 min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-full px-1 font-sans text-[9px] font-semibold leading-none transition-colors duration-300 min-[370px]:text-[10px] ${
                  activeHref === href ? 'text-slate-950' : 'text-slate-700'
                }`}
                aria-current={activeHref === href ? 'page' : undefined}
              >
                <Icon />
                <span className="max-w-full truncate">{label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={toggleLang}
              className="relative z-10 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-sky-100/70 bg-white/52 font-sans text-xs font-bold text-sky-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.86)] transition-colors duration-300 hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
              aria-label={t.switchTo}
            >
              {lang === 'uk' ? 'RU' : 'UA'}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

function HomeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
      <path d="M9.5 20v-5h5v5" />
    </svg>
  )
}

function MethodIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v18" />
      <path d="M5 8c4.5 0 7 2.5 7 7" />
      <path d="M19 8c-4.5 0-7 2.5-7 7" />
      <path d="M7 16h10" />
    </svg>
  )
}

function ResultsIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3.2-3.2 2.4 2.4L18 8.8" />
      <path d="M18 8.8V13" />
      <path d="M18 8.8h-4.2" />
    </svg>
  )
}

function ContactIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M4 9h16" />
      <path d="M6 4h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M8 14h4" />
      <path d="M8 17h7" />
    </svg>
  )
}
