import type { Metadata } from 'next'
import BotMiniApp from '@/components/BotMiniApp'
import { LanguageProvider } from '@/i18n'

export const metadata: Metadata = {
  title: 'Bot Mini App',
  description: 'Telegram mini app with portfolio cards and analytics.',
}

export default function BotAppPage() {
  return (
    <LanguageProvider>
      <BotMiniApp />
    </LanguageProvider>
  )
}
