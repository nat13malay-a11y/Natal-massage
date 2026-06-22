import type { Metadata } from 'next'
import MiniAppHeader from '@/components/MiniAppHeader'
import PortfolioManager from '@/components/PortfolioManager'
import { LanguageProvider } from '@/i18n'

export const metadata: Metadata = {
  title: 'Портфоліо результатів',
  description: 'Портфоліо результатів з редактором карток, медіа та багатомовним описом.',
}

export default function PortfolioPage() {
  return (
    <LanguageProvider>
      <main className="min-h-screen gradient-hero pb-28 md:pb-16">
        <MiniAppHeader active="cards" />
        <PortfolioManager />
      </main>
    </LanguageProvider>
  )
}
