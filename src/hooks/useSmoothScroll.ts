'use client'

import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type Lenis from 'lenis'

export function useSmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    let lenis: Lenis
    let rafCallback: (time: number) => void

    const init = async () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) {
        ScrollTrigger.update()
        return
      }

      const LenisClass = (await import('lenis')).default

      lenis = new LenisClass({
        duration:    window.matchMedia('(max-width: 767px)').matches ? 0.85 : 1.2,
        easing:      (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      lenis.on('scroll', ScrollTrigger.update)

      rafCallback = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(rafCallback)
      gsap.ticker.lagSmoothing(0)
    }

    init()

    return () => {
      if (lenis) lenis.destroy()
      if (rafCallback) gsap.ticker.remove(rafCallback)
    }
  }, [])
}
