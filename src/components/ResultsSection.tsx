'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const cases = [
  {
    id:        'case-cerebral-palsy',
    tag:       'ДЦП',
    tagColor:  'bg-sky-100 text-sky-700',
    image:     '/assets/IMG_1217.gif',
    heading:   'Возвращение движения',
    patient:   'Ребёнок, 6 лет',
    text:      'Мальчик с диагнозом ДЦП не мог самостоятельно ходить и контролировать движения рук. После курса нейрометодики удалось восстановить двигательную функцию: ребёнок начал ходить без поддержки и выполнять точные движения руками.',
    metrics:   [
      { value: '8', label: 'месяцев работы' },
      { value: '100%', label: 'ходит сам' },
    ],
    flip: 'left',
  },
  {
    id:       'case-strabismus',
    tag:      'Врождённое косоглазие',
    tagColor: 'bg-sage-100 text-sage-700',
    image:    '/assets/strabismus-result.jpg',
    heading:  'Победа над косоглазием',
    patient:  'Девочка, 9 лет',
    text:     'Девочка с выраженным косоглазием: один глаз отклонялся на 30°. Хирургическое лечение не дало результата. Благодаря нейрометодике удалось нормализовать мышечный тонус глаза — косоглазие исчезло без операции.',
    metrics:  [
      { value: '4', label: 'месяца курса' },
      { value: '0°', label: 'отклонение' },
    ],
    flip: 'right',
  },
  {
    id:       'case-parkinsons',
    tag:      'Болезнь Паркинсона',
    tagColor: 'bg-nude-100 text-nude-700',
    image:    '/assets/parkinsons-result.jpg',
    heading:  'Работа с болезнью Паркинсона',
    patient:  'Индивидуальная программа',
    text:     'При болезни Паркинсона работа строится через восстановление связи тела и нервной системы: пальпация, мягкое воздействие, снижение мышечного напряжения и постепенное возвращение контроля движений.',
    metrics:  [
      { value: '1:1', label: 'подход' },
      { value: '15+', label: 'лет практики' },
    ],
    flip: 'bottom',
  },
]

export default function ResultsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      // Heading flip from diagonal
      gsap.from('.results-heading', {
        rotateY:         -70,
        rotateX:         20,
        x:              -80,
        opacity:         0,
        transformOrigin: '100% 50%',
        duration:        1.1,
        ease:            'power3.out',
        scrollTrigger: {
          trigger:       '.results-heading',
          start:         'top 82%',
          toggleActions: 'play none none reverse',
        },
      })

      // Stats counter row
      gsap.from('.results-stat', {
        rotateX:         -60,
        y:               50,
        opacity:         0,
        transformOrigin: '50% 0%',
        stagger:         0.15,
        duration:        0.9,
        ease:            'back.out(1.4)',
        scrollTrigger: {
          trigger:       '.results-stat',
          start:         'top 85%',
          toggleActions: 'play none none reverse',
        },
      })

      // Case cards — each flips from different direction
      document.querySelectorAll('.case-card').forEach((card, i) => {
        const directions = [
          { rotateY: -85, x: -100, transformOrigin: '100% 50%' },
          { rotateY:  85, x:  100, transformOrigin: '0% 50%'   },
          { rotateX: -70, y:   80, transformOrigin: '50% 0%'   },
        ]
        const d = directions[i % directions.length]

        gsap.from(card, {
          ...d,
          opacity:  0,
          duration: 1.1,
          ease:     'power3.out',
          scrollTrigger: {
            trigger:       card,
            start:         'top 83%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      // Photo panel reveal as horizontal wipe
      document.querySelectorAll('.case-photo').forEach((photo) => {
        gsap.from(photo, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1.2,
          ease:     'power3.out',
          scrollTrigger: {
            trigger:       photo,
            start:         'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="results" className="scroll-cover scroll-cover-white relative z-20 -mt-10 md:-mt-[18vh] pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* Header */}
        <div className="text-center space-y-4">
          <p className="results-heading text-sm font-medium text-sky-500 uppercase tracking-widest font-sans">
            Реальные результаты
          </p>
          <h2 className="results-heading heading-section text-slate-800"
              style={{ fontSize: 'clamp(1.9rem, 9vw, 3rem)' }}>
            Истории успеха
          </h2>
          <p className="results-heading text-slate-600 max-w-xl mx-auto font-sans leading-relaxed">
            Каждый пациент — уникальная история. Вот лишь несколько случаев,
            где нейрометодика дала результат, которого не ожидали врачи.
          </p>
        </div>

        {/* Summary stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-7 sm:py-10 px-4 sm:px-8 rounded-2xl gradient-section border border-nude-200">
          {[
            { value: '500+', label: 'Пациентов' },
            { value: '15+',  label: 'Лет опыта' },
            { value: '98%',  label: 'Положительных результатов' },
            { value: '30+',  label: 'Видов патологий' },
          ].map(({ value, label }) => (
            <div key={label} className="results-stat text-center">
              <div className="stat-number">{value}</div>
              <div className="text-[0.68rem] sm:text-xs text-slate-600 uppercase font-sans mt-2">{label}</div>
            </div>
          ))}
        </div>

        {/* Case cards */}
        <div className="space-y-12">
          {cases.map((c, i) => (
            <div
              key={c.id}
              id={c.id}
              className={`case-card card-hover rounded-2xl overflow-hidden border border-slate-200 shadow-lg flex flex-col ${
                i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              {/* Photo */}
              <div className="case-photo relative md:w-2/5 min-h-[230px] sm:min-h-[280px]">
                <Image
                  src={c.image}
                  alt={c.heading}
                  fill
                  unoptimized={c.image.endsWith('.gif')}
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                {/* Tag */}
                <div className="absolute top-5 left-5">
                  <span className={`${c.tagColor} text-xs font-bold px-3 py-1.5 rounded-full font-sans`}>
                    {c.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="md:w-3/5 p-5 sm:p-8 lg:p-12 flex flex-col justify-center space-y-5 sm:space-y-6 bg-white">
                <div>
                  <p className="text-xs text-slate-500 font-sans uppercase mb-2">{c.patient}</p>
                  <h3 className="heading-section text-slate-800 text-2xl lg:text-3xl">{c.heading}</h3>
                </div>

                <p className="text-slate-600 leading-relaxed font-sans">{c.text}</p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-5 sm:flex sm:gap-8 pt-2 border-t border-slate-100">
                  {c.metrics.map(({ value, label }) => (
                    <div key={label}>
                      <div className="stat-number" style={{ fontSize: '2rem' }}>{value}</div>
                      <div className="text-[0.68rem] sm:text-xs text-slate-600 font-sans uppercase mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div className="flex items-start gap-3 glass p-4 rounded-xl border border-nude-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sky-400 flex-shrink-0 mt-0.5">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
                  </svg>
                  <p className="text-slate-600 text-sm italic font-sans leading-relaxed">
                    «Методика Натальи Борисовны дала нам то, о чём мы боялись даже мечтать»
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional cases mention */}
        <div className="text-center space-y-6 py-10">
          <p className="text-slate-600 font-sans max-w-lg mx-auto">
            Это лишь малая часть случаев. Нейрометодика помогает при более чем 30 видах расстройств —
            от болезни Паркинсона до посттравматических состояний.
          </p>
          <a href="#contact" className="btn-primary inline-block">
            Обсудить ваш случай
          </a>
        </div>

      </div>
    </section>
  )
}
