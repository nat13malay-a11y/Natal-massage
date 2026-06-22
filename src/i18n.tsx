'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'uk' | 'ru' | 'en'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'uk'
  const saved = window.localStorage.getItem('site-lang')
  return saved === 'ru' || saved === 'uk' || saved === 'en' ? saved : 'uk'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  useEffect(() => {
    const saved = window.localStorage.getItem('site-lang')
    if (saved === 'ru' || saved === 'uk' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (nextLang: Lang) => {
    setLangState(nextLang)
    window.localStorage.setItem('site-lang', nextLang)
    document.documentElement.lang = nextLang
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang(lang === 'uk' ? 'ru' : lang === 'ru' ? 'en' : 'uk'),
    }),
    [lang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useI18n must be used within LanguageProvider')
  return context
}
