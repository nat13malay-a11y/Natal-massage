'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'uk' | 'ru'

type LanguageContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('uk')

  useEffect(() => {
    const saved = window.localStorage.getItem('site-lang')
    if (saved === 'ru' || saved === 'uk') setLangState(saved)
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
      toggleLang: () => setLang(lang === 'uk' ? 'ru' : 'uk'),
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
