'use client'

import { useEffect } from 'react'

function id(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function AnalyticsTracker({ source = 'site' }: { source?: 'site' | 'miniapp' }) {
  useEffect(() => {
    const visitorKey = 'malay-visitor-id'
    const seenKey = 'malay-seen-before'
    const sessionKey = `malay-session-${source}`

    const visitorId = window.localStorage.getItem(visitorKey) || id('visitor')
    window.localStorage.setItem(visitorKey, visitorId)

    const isReturning = window.localStorage.getItem(seenKey) === '1'
    window.localStorage.setItem(seenKey, '1')

    const sessionId = window.sessionStorage.getItem(sessionKey) || id('session')
    const isNewSession = !window.sessionStorage.getItem(sessionKey)
    window.sessionStorage.setItem(sessionKey, sessionId)

    const startedAt = new Date().toISOString()
    const entryPath = window.location.pathname
    let maxScrollDepth = 0
    let pageViews = Number(window.sessionStorage.getItem(`${sessionKey}-views`) || '0') + 1
    window.sessionStorage.setItem(`${sessionKey}-views`, String(pageViews))
    let activeSeconds = 0
    let lastTick = Date.now()

    const updateScroll = () => {
      const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const depth = Math.round((window.scrollY / scrollable) * 100)
      maxScrollDepth = Math.max(maxScrollDepth, Math.max(0, Math.min(100, depth)))
    }

    const payload = (notify = false) => ({
      id: sessionId,
      visitorId,
      source,
      entryPath,
      lastPath: window.location.pathname,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      startedAt,
      durationSeconds: activeSeconds,
      pageViews,
      maxScrollDepth,
      isReturning,
      notify,
      client: {
        width: window.innerWidth,
        height: window.innerHeight,
        language: navigator.language,
      },
    })

    const send = (notify = false, keepalive = false) => {
      updateScroll()
      const body = JSON.stringify(payload(notify))
      fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive,
      }).catch(() => undefined)
    }

    const tick = window.setInterval(() => {
      const now = Date.now()
      if (!document.hidden) activeSeconds += Math.round((now - lastTick) / 1000)
      lastTick = now
    }, 1000)

    const sync = window.setInterval(() => send(false), 15000)
    const onVisibility = () => {
      if (document.hidden) send(false, true)
      lastTick = Date.now()
    }
    const onPageHide = () => send(false, true)

    window.addEventListener('scroll', updateScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', onPageHide)
    updateScroll()
    window.setTimeout(() => send(isNewSession), 2500)

    return () => {
      window.clearInterval(tick)
      window.clearInterval(sync)
      window.removeEventListener('scroll', updateScroll)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', onPageHide)
      send(false, true)
    }
  }, [source])

  return null
}
