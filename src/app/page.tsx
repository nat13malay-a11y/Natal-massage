import dynamic from 'next/dynamic'
import Navigation       from '@/components/Navigation'
import HeroSection      from '@/components/HeroSection'
import AboutSection     from '@/components/AboutSection'
import ResultsSection   from '@/components/ResultsSection'
import ContactSection   from '@/components/ContactSection'
import SmoothScrollProvider from '@/components/SmoothScrollProvider'
import { LanguageProvider } from '@/i18n'

// Scene3D uses Three.js — must be client-only
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div
      className="h-screen gradient-dark flex items-center justify-center"
      id="scene"
    >
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-sky-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-300 font-sans text-sm">Завантажується 3D-сцена…</p>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <SmoothScrollProvider>
      <LanguageProvider>
        <main className="relative pb-24 md:pb-0">
          <Navigation />
          <HeroSection />
          <AboutSection />
          <Scene3D />
          <ResultsSection />
          <ContactSection />
        </main>
      </LanguageProvider>
    </SmoothScrollProvider>
  )
}
