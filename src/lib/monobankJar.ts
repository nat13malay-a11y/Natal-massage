export type MonoStatementItem = {
  id: string
  time: number
  description?: string
  comment?: string
  amount: number
  operationAmount?: number
  currencyCode?: number
  hold?: boolean
  receiptId?: string
}

export function getJarPaymentConfig() {
  const token =
    process.env.MONOBANK_PERSONAL_TOKEN ||
    process.env.MONOBANK_TOKEN ||
    process.env.MONO_TOKEN ||
    process.env.MONO_PERSONAL_TOKEN ||
    process.env.X_TOKEN ||
    process.env.monobank_personal_token ||
    process.env.monobank_token ||
    ''
  const jarId =
    process.env.MONOBANK_JAR_ID ||
    process.env.MONOBANK_BANKA_ID ||
    process.env.MONO_JAR_ID ||
    process.env.MONO_BANKA_ID ||
    process.env.BANKA_JAR_ID ||
    process.env.JAR_ID ||
    process.env.BANKA_ID ||
    process.env.monobank_jar_id ||
    ''
  const jarSendId =
    process.env.MONOBANK_JAR_SEND_ID ||
    process.env.MONOBANK_BANKA_SEND_ID ||
    process.env.MONO_JAR_SEND_ID ||
    process.env.MONO_BANKA_SEND_ID ||
    process.env.BANKA_SEND_ID ||
    process.env.SEND_ID ||
    process.env.JAR_SEND_ID ||
    process.env.monobank_jar_send_id ||
    ''
  const jarUrl =
    process.env.MONOBANK_JAR_URL ||
    process.env.MONOBANK_BANKA_URL ||
    process.env.MONO_JAR_URL ||
    process.env.MONO_BANKA_URL ||
    process.env.BANKA_URL ||
    process.env.JAR_URL ||
    (jarSendId ? `https://send.monobank.ua/jar/${jarSendId}` : '')

  return { token, jarId, jarSendId, jarUrl }
}

export function missingJarPaymentConfig() {
  const config = getJarPaymentConfig()
  const missing: string[] = []
  if (!config.token) missing.push('MONOBANK_PERSONAL_TOKEN')
  if (!config.jarId) missing.push('MONOBANK_JAR_ID')
  if (!config.jarUrl) missing.push('MONOBANK_JAR_URL or MONOBANK_JAR_SEND_ID')
  return missing
}

export function depositAmountKopiykas() {
  const configured = Number(process.env.BOOKING_DEPOSIT_AMOUNT || process.env.booking_deposit_amount || 400)
  const hryvnias = Number.isFinite(configured) ? configured : 400
  return Math.round(Math.min(Math.max(hryvnias, 400), 400) * 100)
}

export async function fetchJarStatement(fromUnix: number, toUnix = Math.floor(Date.now() / 1000)) {
  const { token, jarId } = getJarPaymentConfig()
  if (!token || !jarId) {
    return { ok: false as const, error: 'Monobank jar token or jar id is not configured', items: [] as MonoStatementItem[] }
  }

  const response = await fetch(`https://api.monobank.ua/personal/statement/${encodeURIComponent(jarId)}/${fromUnix}/${toUnix}`, {
    headers: { 'X-Token': token },
    cache: 'no-store',
  }).catch(() => null)

  if (!response?.ok) {
    const errorText = response ? await response.text().catch(() => '') : ''
    return { ok: false as const, error: errorText || 'Could not fetch Monobank jar statement', items: [] as MonoStatementItem[] }
  }

  const items = await response.json().catch(() => []) as MonoStatementItem[]
  return { ok: true as const, error: '', items }
}

export function isMatchingDeposit(item: MonoStatementItem, amount: number, fromUnix: number) {
  return Boolean(
    item.id &&
    !item.hold &&
    item.currencyCode === 980 &&
    item.amount === amount &&
    item.time >= fromUnix,
  )
}
