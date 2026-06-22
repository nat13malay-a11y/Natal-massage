'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { useI18n, type Lang } from '@/i18n'

const text: Record<Lang, {
  tag: string
  words: string[]
  subtitle: string
  cta: string
  results: string
  stats: Array<{ value: string; label: string; pricePrefix?: string }>
  alt: string
  certifiedSmall: string
  certifiedMain: string
  uniqueSmall: string
  uniqueMain: string
  scroll: string
}> = {
  uk: {
    tag: 'Нейрометодика · Масаж · Реабілітація',
    words: ['Малай', 'Наталія', 'Борисівна'],
    subtitle: 'Понад 15 років я допомагаю людям відновлювати здоров’я через унікальні методики нейрореабілітації та професійного масажу. Разом ми знайдемо шлях до вашого відновлення.',
    cta: 'Записатися на консультацію',
    results: 'Історії успіху',
    stats: [
      { value: '15+', label: 'років досвіду' },
      { value: '500+', label: 'пацієнтів' },
      { value: '98%', label: 'результат' },
      { value: '1000', label: 'за годину', pricePrefix: 'від' },
    ],
    alt: 'Малай Наталія Борисівна — нейрометодика',
    certifiedSmall: 'Сертифікований спеціаліст',
    certifiedMain: 'Нейрометодика',
    uniqueSmall: 'Унікальна',
    uniqueMain: 'методика',
    scroll: 'Прокрутити',
  },
  ru: {
    tag: 'Нейрометодика · Массаж · Реабилитация',
    words: ['Малай', 'Наталья', 'Борисовна'],
    subtitle: 'Более 15 лет я помогаю людям восстанавливать здоровье через уникальные методики нейрореабилитации и профессионального массажа. Вместе мы найдём путь к вашему выздоровлению.',
    cta: 'Записаться на консультацию',
    results: 'Истории успеха',
    stats: [
      { value: '15+', label: 'лет опыта' },
      { value: '500+', label: 'пациентов' },
      { value: '98%', label: 'результат' },
      { value: '1000', label: 'в час', pricePrefix: 'от' },
    ],
    alt: 'Малай Наталья Борисовна — нейрометодика',
    certifiedSmall: 'Сертифицированный специалист',
    certifiedMain: 'Нейрометодика',
    uniqueSmall: 'Уникальная',
    uniqueMain: 'методика',
    scroll: 'Прокрутить',
  },
  en: {
    tag: 'Neuromethod · Massage · Rehabilitation',
    words: ['Natalia', 'Borysivna', 'Malay'],
    subtitle: 'For more than 15 years I have helped people restore health through unique neurorehabilitation methods and professional massage. Together we will find your path to recovery.',
    cta: 'Book a consultation',
    results: 'Success stories',
    stats: [
      { value: '15+', label: 'years experience' },
      { value: '500+', label: 'patients' },
      { value: '98%', label: 'result' },
      { value: '1000', label: 'per hour', pricePrefix: 'from' },
    ],
    alt: 'Natalia Borysivna Malay — neuromethod',
    certifiedSmall: 'Certified specialist',
    certifiedMain: 'Neuromethod',
    uniqueSmall: 'Unique',
    uniqueMain: 'method',
    scroll: 'Scroll',
  },
}

export default function HeroSection() {
  const { lang } = useI18n()
  const t = text[lang]
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef      = useRef<HTMLDivElement>(null)
  const imageRef     = useRef<HTMLDivElement>(null)
  const blobsRef     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Blobs float in
      tl.from('.hero-blob', {
        scale: 0,
        opacity: 0,
        duration: 1.6,
        stagger: 0.2,
        ease: 'elastic.out(1, 0.5)',
      }, 0)

      // Tag line
      tl.from('.hero-tag', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, 0.3)

      // Name — character split reveal
      tl.from('.hero-name-word', {
        y: 80,
        opacity: 0,
        rotateX: -45,
        transformOrigin: '50% 100%',
        stagger: 0.08,
        duration: 0.9,
      }, 0.6)

      // Subtitle
      tl.from('.hero-subtitle', {
        y: 24,
        opacity: 0,
        duration: 0.8,
      }, 1.1)

      // Buttons
      tl.from('.hero-btn', {
        y: 20,
        opacity: 0,
        stagger: 0.12,
        duration: 0.7,
      }, 1.3)

      // Stats
      tl.from('.hero-stat', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
      }, 1.5)

      // Photo reveal
      tl.from(imageRef.current, {
        x: 80,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power2.out',
      }, 0.5)
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-[100svh] gradient-hero flex items-center overflow-hidden pt-10 pb-28 md:pt-28 md:pb-10 lg:pt-24"
    >
      {/* Decorative blobs */}
      <div ref={blobsRef} className="absolute inset-0 pointer-events-none opacity-80 max-sm:hidden" aria-hidden="true">
        <div
          className="hero-blob absolute blob"
          style={{
            width: 500,
            height: 500,
            top: '-10%',
            right: '-5%',
            background: 'radial-gradient(ellipse, rgba(195,225,245,0.5) 0%, transparent 70%)',
          }}
        />
        <div
          className="hero-blob absolute blob"
          style={{
            width: 400,
            height: 400,
            bottom: '-5%',
            left: '-8%',
            background: 'radial-gradient(ellipse, rgba(200,223,200,0.45) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="hero-blob absolute blob"
          style={{
            width: 300,
            height: 300,
            top: '40%',
            left: '35%',
            background: 'radial-gradient(ellipse, rgba(227,196,170,0.3) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Floating dots grid */}
      <div className="absolute inset-0 pointer-events-none opacity-25 max-sm:hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-sky-300"
            style={{
              left:           `${(i % 5) * 22 + 5}%`,
              top:            `${Math.floor(i / 5) * 25 + 10}%`,
              animationDelay: `${i * 0.3}s`,
              animation:      'float 4s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-6 sm:py-12 lg:py-16 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
        {/* Left: Text */}
        <div ref={textRef} className="space-y-5 sm:space-y-6">
          {/* Tag */}
          <div className="hero-tag inline-flex max-w-full items-center gap-2 glass px-4 py-2 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-slow" />
            <span className="text-sm font-medium text-slate-700">
              {t.tag}
            </span>
          </div>

          {/* Name */}
          <div className="overflow-hidden">
            <h1 className="heading-display text-slate-800" style={{ fontSize: 'clamp(2.35rem, 12vw, 3.8rem)' }}>
              {t.words.map((word, i) => (
                <span key={i} className="hero-name-word inline-block mr-3" style={{ display: 'inline-block' }}>
                  {word}
                </span>
              ))}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg font-sans">
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 pt-1 sm:pt-2">
            <a href="#contact" className="hero-btn btn-primary">
              {t.cta}
            </a>
            <a href="#results" className="hero-btn btn-outline">
              {t.results}
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 items-start justify-between gap-1 pt-4 border-t border-nude-200">
            {t.stats.map(({ value, label, pricePrefix }) => (
              <div key={label} className="hero-stat flex min-w-0 flex-col items-center text-center">
                {pricePrefix ? (
                  <div className="stat-number stat-price" aria-label={`${pricePrefix} ${value} гривень ${label}`}>
                    <span className="stat-price-prefix">{pricePrefix}</span>
                    <span className="stat-price-value">{value}</span>
                    <span className="stat-price-currency">₴</span>
                  </div>
                ) : (
                  <div className="stat-number">{value}</div>
                )}
                <div className="text-[0.68rem] sm:text-xs text-slate-600 font-sans mt-1 uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Photo */}
        <div ref={imageRef} className="relative flex justify-center lg:justify-end mt-2 sm:mt-0">
          {/* Outer ring */}
          <div
            className="absolute blob"
            style={{
              width: '105%',
              height: '105%',
              background: 'linear-gradient(135deg, rgba(150,202,232,0.4), rgba(168,200,168,0.3), rgba(227,196,170,0.3))',
              top: '-2.5%',
              left: '-2.5%',
              animation: 'morph 10s ease-in-out infinite',
            }}
          />

          {/* Photo container */}
          <div
            className="relative img-reveal-wrapper shadow-2xl"
            style={{
              width:       'clamp(280px, 40vw, 480px)',
              height:      'clamp(330px, 50vw, 580px)',
              borderRadius: '60% 40% 55% 45% / 50% 55% 45% 50%',
              overflow:     'hidden',
              animation:   'morph 12s ease-in-out infinite',
            }}
          >
            <Image
              src="/assets/natalya-professor.jpg"
              alt={t.alt}
              fill
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority
              sizes="(max-width: 640px) 86vw, (max-width: 1024px) 60vw, 480px"
            />
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-3 left-0 sm:-left-4 lg:left-0 glass rounded-2xl px-4 sm:px-5 py-3 shadow-xl max-w-[92%]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-300 to-sky-300 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-600 font-sans">{t.certifiedSmall}</div>
                <div className="text-sm font-semibold text-slate-700 font-sans">{t.certifiedMain}</div>
              </div>
            </div>
          </div>

          {/* Top badge */}
          <div className="absolute -top-3 right-2 lg:right-0 glass rounded-2xl px-4 py-2.5 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
                  <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z" />
                </svg>
              </span>
              <div>
                <div className="text-xs text-slate-600 font-sans">{t.uniqueSmall}</div>
                <div className="text-sm font-semibold text-slate-700 font-sans">{t.uniqueMain}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs text-slate-500 font-sans tracking-widest uppercase">{t.scroll}</span>
        <div className="w-5 h-8 rounded-full border-2 border-slate-300 flex justify-center pt-1.5">
          <div
            className="w-1 h-1.5 rounded-full bg-slate-400"
            style={{ animation: 'scrollDot 1.8s ease-in-out infinite' }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollDot {
          0%   { transform: translateY(0); opacity: 1; }
          80%  { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 0; }
        }
      `}</style>
    </section>
  )
}
