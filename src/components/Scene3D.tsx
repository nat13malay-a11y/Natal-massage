'use client'

import { useRef, useMemo, useEffect, Suspense, type CSSProperties } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Environment, MeshDistortMaterial, Torus, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useI18n, type Lang } from '@/i18n'

// ─── Scene geometry ───────────────────────────────────────────────────────────

function HealingCore({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const meshRef  = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    const t    = state.clock.elapsedTime
    const sc   = scrollRef.current

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.2 + sc * 0.8)
      meshRef.current.rotation.x  = Math.sin(t * 0.4) * 0.3 + sc * Math.PI * 0.5
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = sc * Math.PI * 1.5
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={meshRef} castShadow>
          <torusKnotGeometry args={[1.2, 0.38, 200, 32, 2, 3]} />
          <MeshDistortMaterial
            color="#9ECDE8"
            roughness={0.05}
            metalness={0.2}
            distort={0.25}
            speed={3}
            transmission={0.3}
            thickness={0.5}
            envMapIntensity={1.5}
          />
        </mesh>
      </Float>
    </group>
  )
}

function OrbitRings({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const sc = scrollRef.current
    const t  = state.clock.elapsedTime

    if (ring1.current) {
      ring1.current.rotation.x += delta * 0.4
      ring1.current.rotation.z  = sc * Math.PI * 2
    }
    if (ring2.current) {
      ring2.current.rotation.y += delta * 0.3
      ring2.current.rotation.x  = Math.PI / 3 + sc * Math.PI
    }
    if (ring3.current) {
      ring3.current.rotation.z += delta * 0.25
      ring3.current.rotation.y  = Math.PI / 4 - sc * Math.PI * 1.5
    }
  })

  return (
    <>
      <Torus ref={ring1} args={[2.4, 0.025, 16, 120]}>
        <meshStandardMaterial color="#A8C8A8" roughness={0.2} metalness={0.6} />
      </Torus>
      <Torus ref={ring2} args={[3.1, 0.018, 16, 120]} rotation={[Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#B8D8E8" roughness={0.2} metalness={0.5} />
      </Torus>
      <Torus ref={ring3} args={[3.8, 0.012, 16, 120]} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <meshStandardMaterial color="#E3C4AA" roughness={0.3} metalness={0.4} />
      </Torus>
    </>
  )
}

function OrbitingOrbs({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const orbs = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle:  (i / 8) * Math.PI * 2,
      radius: 2.2 + (i % 3) * 0.6,
      size:   0.08 + (i % 4) * 0.04,
      speed:  0.3 + i * 0.08,
      color:  ['#A8C8A8', '#96CAE8', '#E3C4AA', '#B8D8E8'][i % 4],
    }))
  }, [])

  const groupRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (0.15 + scrollRef.current * 0.5)
    groupRef.current.rotation.x  = scrollRef.current * Math.PI * 0.3
  })

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <OrbMesh key={i} {...orb} index={i} />
      ))}
    </group>
  )
}

function OrbMesh({ angle, radius, size, color }: {
  angle: number; radius: number; size: number; speed: number; color: string; index: number
}) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.position.x = Math.cos(t * 0.4 + angle) * radius
      ref.current.position.z = Math.sin(t * 0.4 + angle) * radius
      ref.current.position.y = Math.sin(t * 0.6 + angle) * 0.5
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.1} metalness={0.7} />
    </mesh>
  )
}

function DynamicLights({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const light1 = useRef<THREE.PointLight>(null)
  const light2 = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const t  = state.clock.elapsedTime
    const sc = scrollRef.current

    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.5) * 4
      light1.current.position.y = Math.cos(t * 0.3) * 3
      light1.current.intensity  = 1.5 + sc * 2
    }
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.4) * 5
      light2.current.position.z = Math.sin(t * 0.6) * 4
      light2.current.intensity  = 1.2 + sc * 1.5
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} color="#E8F4FC" />
      <pointLight ref={light1} color="#63B0D8" intensity={1.5} distance={12} />
      <pointLight ref={light2} color="#85AE85" intensity={1.2} distance={10} position={[3, -2, 3]} />
      <pointLight color="#D4A882" intensity={0.8} distance={8}  position={[-4, 2, -2]} />
    </>
  )
}

function CameraRig({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { camera, size } = useThree()

  useFrame(() => {
    const sc    = scrollRef.current
    const angle = sc * Math.PI * 0.5
    const targetZ = size.width < 480 ? 13 : size.width < 768 ? 10.8 : 7

    camera.position.x += (Math.sin(angle) * 2 - camera.position.x) * 0.03
    camera.position.y += (Math.cos(angle) * 0.5 - camera.position.y) * 0.03
    camera.position.z += (targetZ - camera.position.z) * 0.04
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ─── Main Scene Canvas ────────────────────────────────────────────────────────

function ThreeScene({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <CameraRig scrollRef={scrollRef} />
        <DynamicLights scrollRef={scrollRef} />
        <HealingCore scrollRef={scrollRef} />
        <OrbitRings scrollRef={scrollRef} />
        <OrbitingOrbs scrollRef={scrollRef} />
        <Sparkles
          count={120}
          scale={10}
          size={1.2}
          speed={0.25}
          color="#B8D8E8"
          opacity={0.6}
        />
        <Environment preset="dawn" />
      </Suspense>
    </Canvas>
  )
}

// ─── Overlay labels ───────────────────────────────────────────────────────────

const overlaySteps = [
  {
    start:     0.06,
    peak:      0.16,
    hold:      0.34,
    end:       0.44,
    x:         '8%',
    y:         '32%',
    color:     'sky',
  },
  {
    start:     0.30,
    peak:      0.42,
    hold:      0.62,
    end:       0.74,
    x:         '64%',
    y:         '28%',
    color:     'sage',
  },
  {
    start:     0.58,
    peak:      0.70,
    hold:      0.88,
    end:       0.98,
    x:         '12%',
    y:         '64%',
    color:     'nude',
  },
]

const copy: Record<Lang, {
  eyebrow: string
  title: string
  intro: string
  progress: string
  steps: Array<{ title: string; desc: string }>
}> = {
  uk: {
    eyebrow: 'Методика',
    title: 'Наука зцілення',
    intro: 'Прокрутіть, щоб дослідити методику',
    progress: 'Скрольте для обертання',
    steps: [
      {
        title: 'Нейрометодика',
        desc: 'Вплив на нервову систему для\nвідновлення функцій організму',
      },
      {
        title: 'Реабілітація',
        desc: 'Комплексні програми для роботи\nзі складними неврологічними станами',
      },
      {
        title: 'Лікувальний масаж',
        desc: 'Авторські техніки для зняття болю\nі покращення якості життя',
      },
    ],
  },
  ru: {
    eyebrow: 'Методика',
    title: 'Наука исцеления',
    intro: 'Прокрутите, чтобы исследовать методику',
    progress: 'Скроллите для вращения',
    steps: [
      {
        title: 'Нейрометодика',
        desc: 'Воздействие на нервную систему для\nвосстановления функций организма',
      },
      {
        title: 'Реабилитация',
        desc: 'Комплексные программы для лечения\nсложных неврологических заболеваний',
      },
      {
        title: 'Лечебный массаж',
        desc: 'Авторские техники для снятия боли\nи улучшения качества жизни',
      },
    ],
  },
  en: {
    eyebrow: 'Method',
    title: 'The Science of Healing',
    intro: 'Scroll to explore the method',
    progress: 'Scroll to rotate',
    steps: [
      {
        title: 'Neuromethod',
        desc: 'Working with the nervous system\nto restore body functions',
      },
      {
        title: 'Rehabilitation',
        desc: 'Comprehensive programs for complex\nneurological conditions',
      },
      {
        title: 'Therapeutic massage',
        desc: 'Author techniques for pain relief\nand better quality of life',
      },
    ],
  },
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const easeInOut = (value: number) => value * value * (3 - 2 * value)

function revealForProgress(progress: number, start: number, peak: number, hold: number, end: number) {
  if (progress <= start || progress >= end) return 0
  if (progress <= peak) return easeInOut(clamp01((progress - start) / (peak - start)))
  if (progress <= hold) return 1
  return easeInOut(clamp01((end - progress) / (end - hold)))
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

export default function Scene3D() {
  const { lang } = useI18n()
  const t = copy[lang]
  const sectionRef  = useRef<HTMLDivElement>(null)
  const stickyRef   = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef(0)
  const labelsRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const progressBar = document.getElementById('scene-progress-bar')
    let frame = 0

    const updateProgress = () => {
      const rect = section.getBoundingClientRect()
      const vh   = window.innerHeight
      const h    = section.offsetHeight
      const scrolled = -rect.top
      const total    = Math.max(1, h - vh)
      const progress = Math.max(0, Math.min(1, scrolled / total))
      scrollRef.current = progress
      if (progressBar) progressBar.style.width = `${Math.round(progress * 100)}%`

      labelsRef.current
        ?.querySelectorAll<HTMLElement>('[data-scene-card]')
        .forEach((card, index) => {
          const step = overlaySteps[index]
          const reveal = revealForProgress(progress, step.start, step.peak, step.hold, step.end)
          const y = Math.round((1 - reveal) * 18)
          const scale = 0.96 + reveal * 0.04
          card.style.opacity = reveal.toFixed(3)
          card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale.toFixed(3)})`
          card.style.pointerEvents = reveal > 0.7 ? 'auto' : 'none'
        })
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateProgress()
      })
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    updateProgress()
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const ctx = gsap.context(() => {
      // Heading flip in from top diagonal
      gsap.from('.scene-heading', {
        rotateX:         60,
        rotateY:        -20,
        y:              -50,
        opacity:         0,
        transformOrigin: '50% 0%',
        duration:        1.2,
        ease:            'power3.out',
        scrollTrigger: {
          trigger:       sectionRef.current,
          start:         'top 75%',
          toggleActions: 'play none none reverse',
        },
      })

      gsap.to('.scene-heading', {
        y: -16,
        opacity: 0.82,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  const colorMap: Record<string, { border: string; bg: string; title: string; dot: string }> = {
    sky:  { border: 'border-sky-300',  bg: 'bg-sky-50/80',  title: 'text-sky-600',  dot: 'bg-sky-400'  },
    sage: { border: 'border-sage-300', bg: 'bg-sage-50/80', title: 'text-sage-600', dot: 'bg-sage-400' },
    nude: { border: 'border-nude-300', bg: 'bg-nude-50/80', title: 'text-nude-600', dot: 'bg-nude-400' },
  }

  return (
    <section
      ref={sectionRef}
      id="scene"
      className="relative h-[330svh] md:h-[370vh] gradient-dark"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 h-[100svh] gradient-dark overflow-hidden"
      >
        {/* Background gradient orbs */}
        <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden="true">
          <div
            className="absolute"
            style={{
              width:    600,
              height:   600,
              top:     '-20%',
              right:   '-10%',
              background: 'radial-gradient(ellipse, rgba(99,176,216,0.12) 0%, transparent 60%)',
            }}
          />
          <div
            className="absolute"
            style={{
              width:    500,
              height:   500,
              bottom:  '-15%',
              left:    '-8%',
              background: 'radial-gradient(ellipse, rgba(133,174,133,0.1) 0%, transparent 60%)',
            }}
          />
        </div>

        {/* Heading */}
        <div className="absolute top-20 md:top-12 left-0 right-0 text-center z-20 px-5 pointer-events-none">
          <p className="scene-heading text-sm font-medium text-sky-400 uppercase tracking-widest mb-3 font-sans">
            {t.eyebrow}
          </p>
          <h2
            className="scene-heading heading-section text-white"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
          >
            {t.title}
          </h2>
          <p className="scene-heading text-slate-300 mt-3 font-sans text-sm">
            {t.intro}
          </p>
        </div>

        {/* Three.js Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <ThreeScene scrollRef={scrollRef} />
        </div>

        {/* Overlay labels */}
        <div ref={labelsRef} className="absolute inset-x-4 bottom-32 z-10 h-[190px] pointer-events-none md:inset-0 md:h-auto md:block">
          {overlaySteps.map((step, index) => {
            const stepText = t.steps[index]
            const c = colorMap[step.color]
            return (
              <div
                key={stepText.title}
                data-scene-card
                className={`scene-label-card absolute inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:left-[var(--label-left)] md:top-[var(--label-top)] glass-dark border ${c.border} rounded-2xl px-4 py-3 md:px-5 md:py-4 max-w-none md:max-w-[260px] opacity-0 will-change-transform`}
                style={{
                  '--label-left': step.x,
                  '--label-top': step.y,
                  opacity: 0,
                } as CSSProperties}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className={`font-semibold text-sm ${c.title} font-sans`}>{stepText.title}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed font-sans whitespace-pre-line">
                  {stepText.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Bottom progress bar */}
        <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none">
          <div className="w-48 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div id="scene-progress-bar"
              className="h-full bg-gradient-to-r from-sky-400 to-sage-400 rounded-full"
              style={{ width: '0%' }}
            />
          </div>
          <span className="text-slate-500 text-xs font-sans">{t.progress}</span>
        </div>
      </div>
    </section>
  )
}
