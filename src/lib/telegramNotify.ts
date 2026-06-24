export function telegramChatIds() {
  const raw = process.env.TELEGRAM_CHAT_IDS
    || process.env.telegram_chat_ids
    || process.env.TELEGRAM_CHAT_ID
    || process.env.telegram_chat_id
    || ''

  return raw
    .split(',')
    .map((chatId) => chatId.trim())
    .filter(Boolean)
}

export function telegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN || process.env.telegram_bot_token || ''
}

export function isTelegramConfigured() {
  return Boolean(telegramBotToken() && telegramChatIds().length)
}

export type TelegramSendResult = {
  chatId: string
  ok: boolean
  messageId?: number
}

export async function sendTelegramMessageDetailed(
  text: string,
  options?: {
    disableWebPagePreview?: boolean
    replyToMessageIds?: Record<string, number>
  },
): Promise<TelegramSendResult[]> {
  const token = telegramBotToken()
  const chatIds = telegramChatIds()

  if (!token || chatIds.length === 0) return []

  return Promise.all(chatIds.map(async (chatId) => {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: options?.disableWebPagePreview ?? true,
        ...(options?.replyToMessageIds?.[chatId] ? { reply_to_message_id: options.replyToMessageIds[chatId] } : {}),
      }),
    }).catch(() => null)

    const data = await response?.json().catch(() => null)

    return {
      chatId,
      ok: Boolean(response?.ok),
      messageId: typeof data?.result?.message_id === 'number' ? data.result.message_id : undefined,
    }
  }))
}

export async function sendTelegramMessage(text: string, options?: { disableWebPagePreview?: boolean }) {
  const results = await sendTelegramMessageDetailed(text, options)

  return results.some((result) => result.ok)
}
