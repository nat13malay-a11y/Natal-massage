'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n, type Lang } from '@/i18n'

const copy: Record<Lang, {
  eyebrow: string
  title: string
  intro: string
  phoneLabel: string
  phoneAria: string
  emailLabel: string
  visitLabel: string
  visitText: ReactNode
  social: string
  footerName: string
  rights: string
  made: string
}> = {
  uk: {
    eyebrow: 'Зв’яжіться зі мною',
    title: 'Почніть шлях до здоров’я',
    intro: 'Запишіться на консультацію. Разом ми визначимо, як нейрометодика може допомогти саме вам.',
    phoneLabel: 'Телефон',
    phoneAria: 'Подзвонити за номером +38 097 053 49 33',
    emailLabel: 'Email',
    visitLabel: 'Прийом',
    visitText: <>Одеса <br/> Білгород-Дністровський <br/> Виїзд в інші міста обговорюється</>,
    social: 'Стежте за результатами в соціальних мережах',
    footerName: 'Малай Наталія Борисівна',
    rights: '© 2026 · Нейрометодика і масаж · Усі права захищені',
    made: 'Створено для здоров’я',
  },
  ru: {
    eyebrow: 'Свяжитесь со мной',
    title: 'Начните путь к здоровью',
    intro: 'Запишитесь на консультацию. Вместе мы определим, как нейрометодика может помочь именно вам.',
    phoneLabel: 'Телефон',
    phoneAria: 'Позвонить по номеру +38 097 053 49 33',
    emailLabel: 'Email',
    visitLabel: 'Приём',
    visitText: <>Одесса <br/> Белгород-Днепровский <br/> Выезд в другие города обсуждается</>,
    social: 'Следите за результатами в социальных сетях',
    footerName: 'Малай Наталья Борисовна',
    rights: '© 2026 · Нейрометодика и массаж · Все права защищены',
    made: 'Сделано для здоровья',
  },
}

export default function ContactSection() {
  const { lang } = useI18n()
  const t = copy[lang]
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      // Heading flips from top diagonal
      gsap.from('.contact-heading', {
        rotateX:         70,
        rotateY:         -30,
        y:              -60,
        opacity:         0,
        transformOrigin: '50% 100%',
        duration:        1.2,
        ease:            'power3.out',
        scrollTrigger: {
          trigger:       '.contact-heading',
          start:         'top 82%',
          toggleActions: 'play none none reverse',
        },
      })

      // Contact cards reveal without 3D compression
      gsap.from('.contact-card', {
        y:        80,
        opacity:  0,
        scale:    0.98,
        stagger:  0.15,
        duration: 0.75,
        ease:     'power2.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger:       '.contact-card',
          start:         'top 83%',
          toggleActions: 'play none none reverse',
        },
      })

      // Social icons bounce in
      gsap.from('.social-icon', {
        scale:   0,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease:    'back.out(2)',
        scrollTrigger: {
          trigger:       '.social-icon',
          start:         'top 88%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={sectionRef} id="contact" className="scroll-cover scroll-cover-contact relative z-30 -mt-8 md:-mt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-20 lg:py-24 space-y-10 sm:space-y-14 lg:space-y-16">

        {/* Header */}
        <div className="text-center space-y-4">
          <p className="contact-heading text-sm font-medium text-sky-500 uppercase tracking-widest font-sans">
            {t.eyebrow}
          </p>
          <h2 className="contact-heading heading-section text-slate-800"
              style={{ fontSize: 'clamp(1.9rem, 9vw, 3rem)' }}>
            {t.title}
          </h2>
          <p className="contact-heading text-slate-600 max-w-lg mx-auto font-sans leading-relaxed">
            {t.intro}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Phone */}
          <a
            href="tel:+380970534933"
            className="contact-card card-hover glass rounded-2xl p-6 sm:p-8 text-center border border-white/70 space-y-4 group cursor-pointer min-h-[180px] flex flex-col justify-center"
            aria-label={t.phoneAria}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-200 to-sky-100 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3D94C0" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-sans uppercase tracking-wider mb-1">{t.phoneLabel}</div>
              <div className="font-semibold text-slate-700 font-sans text-lg">+38 (097) 053-49-33</div>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:nat13malay@gmail.com"
            className="contact-card card-hover glass rounded-2xl p-6 sm:p-8 text-center border border-white/70 space-y-4 group cursor-pointer min-h-[180px] flex flex-col justify-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-200 to-sage-100 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#639463" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-sans uppercase tracking-wider mb-1">{t.emailLabel}</div>
              <div className="font-semibold text-slate-700 font-sans break-all">nat13malay@gmail.com</div>
            </div>
          </a>

          {/* Location */}
          <div className="contact-card card-hover glass rounded-2xl p-6 sm:p-8 text-center border border-white/70 space-y-4 group sm:col-span-2 lg:col-span-1 min-h-[180px] flex flex-col justify-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nude-200 to-nude-100 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B07050" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-sans uppercase tracking-wider mb-1">{t.visitLabel}</div>
              <div className="font-semibold text-slate-700 font-sans">{t.visitText}</div>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="text-center space-y-6">
          <p className="text-slate-600 font-sans text-sm">{t.social}</p>
          <div className="flex justify-center gap-5">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/nat1304_massage?igsh=aTdkdXNmNHg0dHA2"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group rounded-2xl cursor-pointer"
              aria-label="Instagram"
            >
              <div className="w-14 h-14 rounded-2xl glass border border-white/60 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
                   style={{ background: 'linear-gradient(135deg, rgba(249,168,212,0.3), rgba(253,224,71,0.2), rgba(248,113,113,0.3))' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#igGrad)" strokeWidth="1.8">
                  <defs>
                    <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316"/>
                      <stop offset="50%" stopColor="#ec4899"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/NatMalay"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group rounded-2xl cursor-pointer"
              aria-label="Telegram"
            >
              <div className="w-14 h-14 rounded-2xl glass border border-sky-200/60 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
                   style={{ background: 'rgba(99,176,216,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13" stroke="#3D94C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#3D94C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/380970534933"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon group rounded-2xl cursor-pointer"
              aria-label="WhatsApp"
            >
              <div className="w-14 h-14 rounded-2xl glass border border-sage-200/60 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
                   style={{ background: 'rgba(133,174,133,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#639463" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-nude-200" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-300 to-sage-300 flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-700 font-sans text-sm">{t.footerName}</span>
          </div>

          <p className="text-slate-500 font-sans text-xs text-center">
            {t.rights.replace('2026', String(new Date().getFullYear()))}
          </p>

          <p className="text-slate-500 font-sans text-xs">
            {t.made}
          </p>
        </div>
      </div>
    </footer>
  )
}
