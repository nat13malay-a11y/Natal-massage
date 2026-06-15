'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const services = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5a2.5 2.5 0 0 1-5 0V2z"/>
        <circle cx="12" cy="8" r="3"/>
        <path d="M6.5 21c0-3.31 2.46-6 5.5-6s5.5 2.69 5.5 6"/>
        <path d="M3 8.5c1.5-1 3.5-1.5 5.5-.5"/>
        <path d="M21 8.5c-1.5-1-3.5-1.5-5.5-.5"/>
      </svg>
    ),
    title:   'Нейрометодика',
    color:   'from-sky-200 to-sky-100',
    accent:  'text-sky-600',
    bg:      'bg-sky-50',
    border:  'border-sky-200',
    desc:    'Уникальная система воздействия на нервную систему для восстановления двигательных функций, лечения неврологических расстройств и реабилитации после травм.',
    bullets: ['Реабилитация после инсульта', 'Лечение ДЦП', 'Восстановление нервных связей'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v0"/>
        <path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/>
        <path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/>
        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
      </svg>
    ),
    title:   'Лечебный массаж',
    color:   'from-sage-200 to-sage-100',
    accent:  'text-sage-600',
    bg:      'bg-sage-50',
    border:  'border-sage-200',
    desc:    'Профессиональный лечебный и релаксирующий массаж с применением авторских методик. Снятие болевого синдрома, улучшение кровообращения, омоложение.',
    bullets: ['Антицеллюлитный массаж', 'Массаж лица', 'Реабилитационный массаж'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    title:   'Реабилитация',
    color:   'from-nude-200 to-nude-100',
    accent:  'text-nude-600',
    bg:      'bg-nude-50',
    border:  'border-nude-200',
    desc:    'Комплексные программы реабилитации при тяжёлых заболеваниях: неврологических расстройствах, опорно-двигательных нарушениях и посттравматических состояниях.',
    bullets: ['Синдром Туретта', 'Болезнь Паркинсона', 'Постинсультная реабилитация'],
  },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      // Heading flip-in from bottom
      gsap.from('.about-heading', {
        rotateX:         -80,
        opacity:         0,
        transformOrigin: '50% 100%',
        y:               60,
        duration:        1,
        ease:            'power3.out',
        scrollTrigger: {
          trigger:       '.about-heading',
          start:         'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      // Bio text slide in from left
      gsap.from('.about-bio', {
        x:        -60,
        opacity:  0,
        duration: 1,
        ease:     'power2.out',
        scrollTrigger: {
          trigger:       '.about-bio',
          start:         'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      // Photo flip from right diagonal
      gsap.from('.about-photo', {
        rotateY: 75,
        rotateX: 15,
        x:       100,
        opacity: 0,
        transformOrigin: '0% 50%',
        duration: 1.2,
        ease:    'power3.out',
        scrollTrigger: {
          trigger:       '.about-photo',
          start:         'top 80%',
          toggleActions: 'play none none reverse',
        },
      })

      // Service cards cascade reveal
      gsap.from('.service-card', {
        y:               36,
        opacity:         0,
        scale:           0.98,
        stagger:         0.18,
        duration:        0.75,
        ease:            'power2.out',
        clearProps:      'transform',
        scrollTrigger: {
          trigger:       '.service-card',
          start:         'top 82%',
          toggleActions: 'play none none reverse',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="about" className="py-16 sm:py-20 lg:py-28 gradient-section overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 space-y-14 sm:space-y-20 lg:space-y-24">

        {/* Top: Bio + Photo */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div>
              <p className="about-heading text-sm font-medium text-sky-500 uppercase tracking-widest mb-3 font-sans">
                Обо мне
              </p>
              <h2 className="about-heading heading-section text-slate-800"
                  style={{ fontSize: 'clamp(1.9rem, 9vw, 3rem)' }}>
                Здоровье — это<br />
                <span className="text-sky-600">возможно вернуть</span>
              </h2>
            </div>

            <div className="about-bio space-y-5 text-slate-600 leading-relaxed font-sans text-base sm:text-[1.05rem]">
              <p>
                Меня зовут <strong className="text-slate-800">Малай Наталья Борисовна</strong>. Более 15 лет я
                посвятила изучению и практике нейрометодики — уникальной системы воздействия на нервную систему
                человека, которая позволяет достигать результатов там, где традиционная медицина отступает.
              </p>
              <p>
                Я прошла обучение у ведущих специалистов в области нейрореабилитации и нейропсихологии, постоянно
                совершенствую свои методики и применяю индивидуальный подход к каждому пациенту.
              </p>
              <p>
                Моя миссия — помочь вам обрести здоровье и качество жизни через силу нашего собственного тела.
              </p>
            </div>

            {/* Certificate preview */}
            <div className="about-bio flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 glass p-5 sm:p-6 rounded-2xl border border-nude-200 w-full sm:w-fit max-w-2xl">
              <div className="w-full sm:w-44 md:w-52 lg:w-56 aspect-[4/3] rounded-xl overflow-hidden flex-shrink-0 shadow-lg bg-white">
                <Image
                  src="/assets/certificate.jpg"
                  alt="Сертификат специалиста"
                  width={448}
                  height={336}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
              <div>
                <div className="font-semibold text-slate-700 font-sans text-base">Сертифицированный специалист</div>
                <div className="text-sm text-slate-500 font-sans">Нейрометодика и реабилитация</div>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="about-photo relative">
            <div
              className="absolute inset-0 -m-4"
              style={{
                background: 'radial-gradient(ellipse, rgba(195,225,245,0.4) 0%, transparent 70%)',
              }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl img-reveal-wrapper"
                 style={{ height: 'clamp(320px, 64vw, 520px)' }}>
              <Image
                src="/assets/massage.jpg"
                alt="Наталья за работой"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute right-3 sm:-right-4 top-5 sm:top-8 glass rounded-2xl p-4 shadow-xl">
              <div className="text-center">
                <div className="stat-number" style={{ fontSize: '2rem' }}>15+</div>
                <div className="text-xs text-slate-500 font-sans">лет опыта</div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-sky-500 uppercase tracking-widest mb-3 font-sans">Услуги</p>
            <h2 className="heading-section text-slate-800" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Направления работы
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 items-stretch">
            {services.map((s) => (
              <div
                key={s.title}
                className={`service-card card-hover rounded-2xl p-6 sm:p-7 lg:p-8 border ${s.border} ${s.bg} space-y-5 w-full min-h-[360px]`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center ${s.accent} shadow-sm`}>
                  {s.icon}
                </div>

                <h3 className={`text-xl font-semibold ${s.accent} heading-section`}>{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-sans">{s.desc}</p>

                <ul className="space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-600 font-sans">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.accent.replace('text', 'bg')} flex-shrink-0`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
