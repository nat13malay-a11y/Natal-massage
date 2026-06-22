'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n, type Lang } from '@/i18n'

type PortfolioText = {
  tag?: string
  patient?: string
  title?: string
  description?: string
  metricOneValue?: string
  metricOneLabel?: string
  metricTwoValue?: string
  metricTwoLabel?: string
  quote?: string
}

type PortfolioRow = {
  id: string
  media?: { kind?: string; src?: string }
  text?: Record<Lang, PortfolioText>
}

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

const copy: Record<Lang, {
  eyebrow: string
  title: string
  intro: string
  stats: Array<{ value: string; label: string }>
  cases: Array<{
    tag: string
    heading: string
    patient: string
    text: string
    metrics: Array<{ value: string; label: string }>
  }>
  quote: string
  more: string
  cta: string
}> = {
  uk: {
    eyebrow: 'Реальні результати',
    title: 'Історії успіху',
    intro: 'Кожен пацієнт — унікальна історія. Ось лише кілька випадків, де нейрометодика дала результат, якого не очікували лікарі.',
    stats: [
      { value: '500+', label: 'Пацієнтів' },
      { value: '15+', label: 'Років досвіду' },
      { value: '98%', label: 'Позитивних результатів' },
      { value: '30+', label: 'Видів патологій' },
    ],
    cases: [
      {
        tag: 'ДЦП',
        heading: 'Повернення руху',
        patient: 'Дитина, 6 років',
        text: 'Хлопчик із діагнозом ДЦП не міг самостійно ходити й контролювати рухи рук. Після курсу нейрометодики вдалося відновити рухову функцію: дитина почала ходити без підтримки та виконувати точні рухи руками.',
        metrics: [
          { value: '8', label: 'місяців роботи' },
          { value: '100%', label: 'ходить сам' },
        ],
      },
      {
        tag: 'Вроджена косоокість',
        heading: 'Перемога над косоокістю',
        patient: 'Дівчинка, 9 років',
        text: 'Дівчинка з вираженою косоокістю: одне око відхилялося на 30°. Хірургічне лікування не дало результату. Завдяки нейрометодиці вдалося нормалізувати м’язовий тонус ока — косоокість зникла без операції.',
        metrics: [
          { value: '4', label: 'місяці курсу' },
          { value: '0°', label: 'відхилення' },
        ],
      },
      {
        tag: 'Хвороба Паркінсона',
        heading: 'Робота з хворобою Паркінсона',
        patient: 'Індивідуальна програма',
        text: 'При хворобі Паркінсона робота будується через відновлення зв’язку тіла й нервової системи: пальпація, м’який вплив, зниження м’язового напруження та поступове повернення контролю рухів.',
        metrics: [
          { value: '1:1', label: 'підхід' },
          { value: '15+', label: 'років практики' },
        ],
      },
    ],
    quote: '«Методика Наталії Борисівни дала нам те, про що ми боялися навіть мріяти»',
    more: 'Це лише мала частина випадків. Нейрометодика допомагає при більш ніж 30 видах розладів — від хвороби Паркінсона до посттравматичних станів.',
    cta: 'Обговорити ваш випадок',
  },
  ru: {
    eyebrow: 'Реальные результаты',
    title: 'Истории успеха',
    intro: 'Каждый пациент — уникальная история. Вот лишь несколько случаев, где нейрометодика дала результат, которого не ожидали врачи.',
    stats: [
      { value: '500+', label: 'Пациентов' },
      { value: '15+', label: 'Лет опыта' },
      { value: '98%', label: 'Положительных результатов' },
      { value: '30+', label: 'Видов патологий' },
    ],
    cases: cases.map(({ tag, heading, patient, text, metrics }) => ({ tag, heading, patient, text, metrics })),
    quote: '«Методика Натальи Борисовны дала нам то, о чём мы боялись даже мечтать»',
    more: 'Это лишь малая часть случаев. Нейрометодика помогает при более чем 30 видах расстройств — от болезни Паркинсона до посттравматических состояний.',
    cta: 'Обсудить ваш случай',
  },
  en: {
    eyebrow: 'Real results',
    title: 'Success stories',
    intro: 'Every patient has a unique story. Here are a few cases where the neuromethod produced results doctors did not expect.',
    stats: [
      { value: '500+', label: 'Patients' },
      { value: '15+', label: 'Years experience' },
      { value: '98%', label: 'Positive results' },
      { value: '30+', label: 'Types of conditions' },
    ],
    cases: [
      {
        tag: 'CP',
        heading: 'Movement recovery',
        patient: 'Child, 6 years old',
        text: 'A boy with cerebral palsy could not walk independently or control hand movements. After a neuromethod course, motor function was restored: the child began walking without support and making precise hand movements.',
        metrics: [
          { value: '8', label: 'months of work' },
          { value: '100%', label: 'walks alone' },
        ],
      },
      {
        tag: 'Congenital strabismus',
        heading: 'Overcoming strabismus',
        patient: 'Girl, 9 years old',
        text: 'A girl had pronounced strabismus: one eye deviated by 30 degrees. Surgery did not help. The neuromethod helped normalize eye muscle tone, and the strabismus disappeared without another operation.',
        metrics: [
          { value: '4', label: 'months of course' },
          { value: '0°', label: 'deviation' },
        ],
      },
      {
        tag: 'Parkinson’s disease',
        heading: 'Working with Parkinson’s disease',
        patient: 'Individual program',
        text: 'With Parkinson’s disease, the work focuses on restoring the connection between the body and nervous system: palpation, gentle influence, reducing muscle tension, and gradually returning movement control.',
        metrics: [
          { value: '1:1', label: 'approach' },
          { value: '15+', label: 'years practice' },
        ],
      },
    ],
    quote: '“Natalia Borysivna’s method gave us something we were afraid to even dream about”',
    more: 'These are only a few cases. The neuromethod helps with more than 30 types of disorders, from Parkinson’s disease to post-traumatic conditions.',
    cta: 'Discuss your case',
  },
}

export default function ResultsSection() {
  const { lang } = useI18n()
  const t = copy[lang]
  const sectionRef = useRef<HTMLDivElement>(null)
  const [portfolioRows, setPortfolioRows] = useState<PortfolioRow[] | null>(null)

  useEffect(() => {
    let active = true

    const loadCards = async () => {
      const response = await fetch('/api/portfolio/cards', { cache: 'no-store' }).catch(() => null)
      const payload = response?.ok ? await response.json().catch(() => null) : null
      if (active && payload?.ok && Array.isArray(payload.cards) && payload.cards.length > 0) {
        setPortfolioRows(payload.cards as PortfolioRow[])
      }
    }

    loadCards()

    return () => {
      active = false
    }
  }, [])

  const caseItems = useMemo(() => {
    if (portfolioRows?.length) {
      const colors = [
        'bg-sky-100 text-sky-700',
        'bg-sage-100 text-sage-700',
        'bg-nude-100 text-nude-700',
      ]

      return portfolioRows.map((row, index) => {
        const content = row.text?.[lang]?.title || row.text?.[lang]?.description
          ? row.text[lang]
          : row.text?.uk?.title || row.text?.uk?.description
            ? row.text.uk
            : row.text?.ru || {}

        return {
          id: row.id,
          image: row.media?.src || cases[index % cases.length]?.image || '/assets/massage-result.jpg',
          mediaKind: row.media?.kind || 'image',
          tagColor: colors[index % colors.length],
          tag: content.tag || '',
          heading: content.title || t.title,
          patient: content.patient || '',
          text: content.description || '',
          metrics: [
            { value: content.metricOneValue || '', label: content.metricOneLabel || '' },
            { value: content.metricTwoValue || '', label: content.metricTwoLabel || '' },
          ].filter((metric) => metric.value || metric.label),
          quote: content.quote || t.quote,
        }
      })
    }

    return cases.map((item, index) => {
      const translatedCase = t.cases[index]
      return {
        id: item.id,
        image: item.image,
        mediaKind: 'image',
        tagColor: item.tagColor,
        tag: translatedCase.tag,
        heading: translatedCase.heading,
        patient: translatedCase.patient,
        text: translatedCase.text,
        metrics: translatedCase.metrics,
        quote: t.quote,
      }
    })
  }, [lang, portfolioRows, t])

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
            {t.eyebrow}
          </p>
          <h2 className="results-heading heading-section text-slate-800"
              style={{ fontSize: 'clamp(1.9rem, 9vw, 3rem)' }}>
            {t.title}
          </h2>
          <p className="results-heading text-slate-600 max-w-xl mx-auto font-sans leading-relaxed">
            {t.intro}
          </p>
        </div>

        {/* Summary stats bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-7 sm:py-10 px-4 sm:px-8 rounded-2xl gradient-section border border-nude-200">
          {t.stats.map(({ value, label }) => (
            <div key={label} className="results-stat text-center">
              <div className="stat-number">{value}</div>
              <div className="text-[0.68rem] sm:text-xs text-slate-600 uppercase font-sans mt-2">{label}</div>
            </div>
          ))}
        </div>

        {/* Case cards */}
        <div className="space-y-12">
          {caseItems.map((c, i) => (
            <div
              key={c.id}
              id={c.id}
              className={`case-card card-hover rounded-2xl overflow-hidden border border-slate-200 shadow-lg flex flex-col ${
                i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              {/* Photo */}
              <div className="case-photo relative md:w-2/5 min-h-[230px] sm:min-h-[280px]">
                {c.mediaKind === 'video' ? (
                  <video className="h-full w-full object-cover" src={c.image} controls playsInline>
                    <track kind="captions" />
                  </video>
                ) : c.image.startsWith('/') ? (
                  <Image
                    src={c.image}
                    alt={c.heading}
                    fill
                    unoptimized={c.image.endsWith('.gif')}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                ) : (
                  <img className="h-full w-full object-cover" src={c.image} alt={c.heading} />
                )}
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
                    {c.quote}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional cases mention */}
        <div className="text-center space-y-6 py-10">
          <p className="text-slate-600 font-sans max-w-lg mx-auto">
            {t.more}
          </p>
          <a href="#contact" className="btn-primary inline-flex">
            {t.cta}
          </a>
        </div>

      </div>
    </section>
  )
}
