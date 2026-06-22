'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n, type Lang } from '@/i18n'

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

const copy: Record<Lang, {
  eyebrow: string
  titleA: string
  titleB: string
  paragraphs: string[]
  parkinson: string
  strabismus: string
  cerebralPalsy: string
  massageAlt: string
  years: string
  certAlt: string
  certTitle: string
  certText: string
  servicesEyebrow: string
  servicesTitle: string
  services: Array<{ title: string; desc: string; bullets: string[] }>
}> = {
  uk: {
    eyebrow: 'Про мене',
    titleA: 'Здоров’я — це',
    titleB: 'можливо повернути',
    paragraphs: [
      'Звати мене Наталія Борисівна Малай. Я нейрореабілітолог. Цей вибір був зроблений завдяки здібностям, які проявилися ще в дитинстві.',
      'Через відсутність мовлення до 15 років у мене розвинулася здатність тонко відчувати природу і стан людини. Перший масаж я зробила у 7 років, і він допоміг моїй бабусі. Зі своїм мовленням я працювала самостійно: співала, читала, тренувалася щодня. Допомагаючи собі й родичам, я на практиці вчилася розуміти, як працює природа.',
      'Протягом багатьох років із різними захворюваннями я справлялася без таблеток. У 2007 році познайомилася з кардіологом, який допоміг мені заснувати методику пальпації. Спілкування й навчання у кваліфікованих спеціалістів, професорів та академіків допомогли сформулювати авторську методику.',
      'Завдяки знанням, досвіду і практиці я стала знаходити не просто причину хвороби, а її походження. І тепер кидаю виклик традиційній медицині.',
      'Знаю, що в природі немає хвороби, з якою неможливо впоратися.',
      'Працюю за спеціальними програмами: дефект мовлення, аутизм у дітей, ДЦП та інші складні стани. В основі роботи — індивідуальний підхід до кожного.',
      'Думаю, що кожна людина має відчувати свою природу і бути на своєму місці.',
    ],
    parkinson: 'Хвороба Паркінсона',
    strabismus: 'Вроджена косоокість',
    cerebralPalsy: 'Лікування ДЦП',
    massageAlt: 'Наталія за роботою',
    years: 'років досвіду',
    certAlt: 'Сертифікат спеціаліста',
    certTitle: 'Сертифікований спеціаліст з реабілітації.',
    certText: 'Нейрореабілітолог, авторська нейро методика.',
    servicesEyebrow: 'Послуги',
    servicesTitle: 'Напрями роботи',
    services: [
      {
        title: 'Нейрометодика',
        desc: 'Унікальна система впливу на нервову систему для відновлення рухових функцій, роботи з неврологічними розладами та реабілітації після травм.',
        bullets: ['Реабілітація після інсульту', 'Лікування ДЦП', 'Відновлення нервових зв’язків'],
      },
      {
        title: 'Лікувальний масаж',
        desc: 'Професійний лікувальний і релаксуючий масаж із застосуванням авторських методик. Зняття больового синдрому, покращення кровообігу, омолодження.',
        bullets: ['Антицелюлітний масаж', 'Масаж обличчя', 'Реабілітаційний масаж'],
      },
      {
        title: 'Реабілітація',
        desc: 'Комплексні програми реабілітації при складних станах: неврологічних розладах, опорно-рухових порушеннях і посттравматичних наслідках.',
        bullets: ['Синдром Туретта', 'Хвороба Паркінсона', 'Постінсультна реабілітація'],
      },
    ],
  },
  ru: {
    eyebrow: 'Обо мне',
    titleA: 'Здоровье — это',
    titleB: 'возможно вернуть',
    paragraphs: [
      'Зовут меня Наталья Борисовна Малай. Я нейрореабилитолог. Этот выбор был сделан благодаря способностям, которые проявились ещё в детстве.',
      'Из-за отсутствия речи до 15 лет у меня развилась способность тонко чувствовать природу и состояние человека. Первый массаж я сделала в 7 лет, и он помог моей бабушке. Со своей речью я работала самостоятельно: пела, читала, тренировалась каждый день. Помогая себе и родственникам, я на практике училась понимать, как работает природа.',
      'На протяжении многих лет с разными заболеваниями я справлялась без таблеток. В 2007 году познакомилась с кардиологом, который помог мне основать методику пальпации. Общение и обучение у квалифицированных специалистов, профессоров и академиков помогли сформулировать авторскую методику.',
      'Благодаря знаниям, опыту и практике я стала находить не просто причину болезни, а её происхождение. И теперь бросаю вызов традиционной медицине.',
      'Знаю, что в природе нет болезни, с которой нельзя не справиться.',
      'Работаю по специальным программам: дефект речи, аутизм у детей, ДЦП и другие сложные состояния. В основе работы — индивидуальный подход к каждому.',
      'Думаю, что каждый человек должен чувствовать свою природу и быть на своём месте.',
    ],
    parkinson: 'Болезнь Паркинсона',
    strabismus: 'Врождённое косоглазие',
    cerebralPalsy: 'Лечение ДЦП',
    massageAlt: 'Наталья за работой',
    years: 'лет опыта',
    certAlt: 'Сертификат специалиста',
    certTitle: 'Сертифицированный специалист по реабилитации.',
    certText: 'Нейрореабилитолог, авторская нейро методика.',
    servicesEyebrow: 'Услуги',
    servicesTitle: 'Направления работы',
    services: services.map(({ title, desc, bullets }) => ({ title, desc, bullets })),
  },
  en: {
    eyebrow: 'About me',
    titleA: 'Health can',
    titleB: 'be restored',
    paragraphs: [
      'My name is Natalia Borysivna Malay. I am a neurorehabilitation specialist. This path grew from abilities that appeared in childhood.',
      'Because I did not speak until the age of 15, I developed a subtle ability to feel nature and a person’s condition. I gave my first massage at the age of 7, and it helped my grandmother. I worked on my speech independently: singing, reading, and training every day. By helping myself and my family, I learned in practice how nature works.',
      'For many years I dealt with different health conditions without pills. In 2007 I met a cardiologist who helped me establish my palpation method. Communication and study with qualified specialists, professors, and academics helped me formulate my own method.',
      'Through knowledge, experience, and practice, I learned to find not only the cause of disease, but its origin. Now I challenge traditional medicine.',
      'I know that in nature there is no disease that cannot be addressed.',
      'I work with special programs: speech disorders, autism in children, cerebral palsy, and other complex conditions. The basis of my work is an individual approach to each person.',
      'I believe every person should feel their nature and be in their right place.',
    ],
    parkinson: 'Parkinson’s disease',
    strabismus: 'Congenital strabismus',
    cerebralPalsy: 'Cerebral palsy treatment',
    massageAlt: 'Natalia at work',
    years: 'years experience',
    certAlt: 'Specialist certificate',
    certTitle: 'Certified rehabilitation specialist.',
    certText: 'Neurorehabilitation specialist, author neuromethod.',
    servicesEyebrow: 'Services',
    servicesTitle: 'Areas of work',
    services: [
      {
        title: 'Neuromethod',
        desc: 'A unique system for working with the nervous system to restore motor functions, support neurological disorders, and rehabilitate after injuries.',
        bullets: ['Post-stroke rehabilitation', 'Cerebral palsy treatment', 'Restoring neural connections'],
      },
      {
        title: 'Therapeutic massage',
        desc: 'Professional therapeutic and relaxing massage using author techniques. Pain relief, improved circulation, and body renewal.',
        bullets: ['Anti-cellulite massage', 'Facial massage', 'Rehabilitation massage'],
      },
      {
        title: 'Rehabilitation',
        desc: 'Comprehensive rehabilitation programs for complex conditions: neurological disorders, musculoskeletal issues, and post-traumatic states.',
        bullets: ['Tourette syndrome', 'Parkinson’s disease', 'Post-stroke rehabilitation'],
      },
    ],
  },
}

export default function AboutSection() {
  const { lang } = useI18n()
  const t = copy[lang]
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
                {t.eyebrow}
              </p>
              <h2 className="about-heading heading-section text-slate-800"
                  style={{ fontSize: 'clamp(1.9rem, 9vw, 3rem)' }}>
                {t.titleA}<br />
                <span className="text-sky-600">{t.titleB}</span>
              </h2>
            </div>

            <div className="about-bio space-y-5 text-slate-600 leading-relaxed font-sans text-base sm:text-[1.05rem]">
              <p>{t.paragraphs[0]}</p>
              <p>{t.paragraphs[1]}</p>
              <p>{t.paragraphs[2]}</p>
              <p>
                {t.paragraphs[3]}
                {' '}
                <CaseTextLink href="#case-parkinsons">{t.parkinson}</CaseTextLink>
              </p>

              <p>
                {t.paragraphs[4]}
                {' '}
                <CaseTextLink href="#case-strabismus">{t.strabismus}</CaseTextLink>
              </p>

              <p>
                {t.paragraphs[5]}
                {' '}
                <CaseTextLink href="#case-cerebral-palsy">{t.cerebralPalsy}</CaseTextLink>
              </p>
              <p>{t.paragraphs[6]}</p>
            </div>
          </div>

          {/* Photo */}
          <div className="about-photo space-y-5 sm:space-y-6">
            <div className="relative">
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
                  alt={t.massageAlt}
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
                  <div className="text-xs text-slate-500 font-sans">{t.years}</div>
                </div>
              </div>
            </div>

            {/* Certificate preview */}
            <div className="glass rounded-2xl border border-nude-200 p-4 sm:p-5 shadow-lg">
              <div className="grid grid-cols-[minmax(132px,0.9fr)_1fr] gap-4 sm:gap-5 items-center">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-white">
                  <Image
                    src="/assets/certificate.jpg"
                    alt={t.certAlt}
                    width={448}
                    height={336}
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700 font-sans text-sm sm:text-base leading-snug">
                    {t.certTitle}
                  </div>
                  <div className="text-sm text-slate-500 font-sans leading-snug">
                    {t.certText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-sky-500 uppercase tracking-widest mb-3 font-sans">{t.servicesEyebrow}</p>
            <h2 className="heading-section text-slate-800" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              {t.servicesTitle}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-8 items-stretch">
            {services.map((s, index) => {
              const service = t.services[index]
              return (
              <div
                key={s.title}
                className={`service-card card-hover rounded-2xl p-6 sm:p-7 lg:p-8 border ${s.border} ${s.bg} space-y-5 w-full min-h-[360px]`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center ${s.accent} shadow-sm`}>
                  {s.icon}
                </div>

                <h3 className={`text-xl font-semibold ${s.accent} heading-section`}>{service.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-sans">{service.desc}</p>

                <ul className="space-y-2">
                  {service.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-600 font-sans">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.accent.replace('text', 'bg')} flex-shrink-0`} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )})}
          </div>
        </div>

      </div>
    </section>
  )
}

function CaseTextLink({ href, children }: { href: string; children: ReactNode }) {
  const goToCase = () => {
    const target = document.querySelector(href)
    if (!target) return

    const top = target.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12
    window.scrollTo({ top, behavior: 'smooth' })
    window.history.replaceState(null, '', href)
  }

  return (
    <button
      type="button"
      onClick={goToCase}
      className="inline cursor-pointer font-semibold text-sky-600 underline decoration-sky-300 decoration-2 underline-offset-4 transition-colors hover:text-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    >
      {children}
    </button>
  )
}
