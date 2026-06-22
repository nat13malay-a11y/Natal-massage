'use client'

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useI18n } from '@/i18n'
import { isSupabaseConfigured, portfolioMediaBucket, supabase } from '@/lib/supabaseClient'

type EditorLang = 'uk' | 'ru' | 'en'
type MediaKind = 'image' | 'video' | 'embed' | 'none'

type PortfolioText = {
  tag: string
  patient: string
  title: string
  description: string
  metricOneValue: string
  metricOneLabel: string
  metricTwoValue: string
  metricTwoLabel: string
  quote: string
}

type PortfolioMedia = {
  kind: MediaKind
  src: string
  source: 'file' | 'url' | 'none'
  name?: string
}

type PortfolioCard = {
  id: string
  media: PortfolioMedia
  text: Record<EditorLang, PortfolioText>
  createdAt: string
}

type PortfolioRow = {
  id: string
  media: PortfolioMedia
  text: Record<EditorLang, PortfolioText>
  created_at: string
}

const storageKey = 'malay-portfolio-cards'
const editorLangs: Array<{ key: EditorLang; label: string }> = [
  { key: 'uk', label: 'UK' },
  { key: 'ru', label: 'RU' },
  { key: 'en', label: 'EN' },
]

const emptyText: PortfolioText = {
  tag: '',
  patient: '',
  title: '',
  description: '',
  metricOneValue: '',
  metricOneLabel: '',
  metricTwoValue: '',
  metricTwoLabel: '',
  quote: '',
}

const defaultCards: PortfolioCard[] = [
  {
    id: 'sample-cerebral-palsy',
    media: {
      kind: 'image',
      src: '/assets/IMG_1217.gif',
      source: 'url',
      name: 'IMG_1217.gif',
    },
    createdAt: new Date().toISOString(),
    text: {
      uk: {
        tag: 'ДЦП',
        patient: 'Дитина, 6 років',
        title: 'Повернення руху',
        description:
          'Хлопчик із діагнозом ДЦП не міг самостійно ходити й контролювати рухи рук. Після курсу нейрометодики вдалося відновити рухову функцію: дитина почала ходити без підтримки та виконувати точні рухи руками.',
        metricOneValue: '8',
        metricOneLabel: 'місяців роботи',
        metricTwoValue: '100%',
        metricTwoLabel: 'ходить сам',
        quote: 'Методика Наталії Борисівни дала нам те, про що ми боялися навіть мріяти',
      },
      ru: {
        tag: 'ДЦП',
        patient: 'Ребёнок, 6 лет',
        title: 'Возвращение движения',
        description:
          'Мальчик с диагнозом ДЦП не мог самостоятельно ходить и контролировать движения рук. После курса нейрометодики удалось восстановить двигательную функцию: ребёнок начал ходить без поддержки и выполнять точные движения руками.',
        metricOneValue: '8',
        metricOneLabel: 'месяцев работы',
        metricTwoValue: '100%',
        metricTwoLabel: 'ходит сам',
        quote: 'Методика Натальи Борисовны дала нам то, о чём мы боялись даже мечтать',
      },
      en: {
        tag: 'CP',
        patient: 'Child, 6 years old',
        title: 'Movement Recovery',
        description:
          'A child with cerebral palsy could not walk independently or control hand movements. After the neuromethod course, motor function improved: the child began walking without support and making precise hand movements.',
        metricOneValue: '8',
        metricOneLabel: 'months of work',
        metricTwoValue: '100%',
        metricTwoLabel: 'walks alone',
        quote: 'Natalia Borysivna’s method gave us something we were afraid to even dream about',
      },
    },
  },
]

const ui = {
  uk: {
    eyebrow: 'Портфоліо',
    title: 'Картки результатів',
    intro: 'Додавайте випадки, перекладайте опис трьома мовами та прикріплюйте фото, GIF або відео.',
    add: 'Додати картку',
    cancel: 'Скасувати',
    save: 'Зберегти картку',
    update: 'Оновити картку',
    edit: 'Редагувати',
    remove: 'Видалити',
    previewLang: 'Мова перегляду',
    formTitleNew: 'Нова картка',
    formTitleEdit: 'Редагування картки',
    media: 'Медіа',
    file: 'Файл з пристрою',
    url: 'Посилання на медіа',
    clearMedia: 'Прибрати медіа',
    fields: {
      tag: 'Мітка',
      patient: 'Пацієнт',
      title: 'Заголовок',
      description: 'Опис',
      metricOneValue: 'Метрика 1',
      metricOneLabel: 'Підпис 1',
      metricTwoValue: 'Метрика 2',
      metricTwoLabel: 'Підпис 2',
      quote: 'Цитата',
    },
    empty: 'Поки немає карток.',
    confirm: 'Видалити цю картку?',
    saved: 'Збережено.',
    loadedCloud: 'Підключено Supabase.',
    fallbackLocal: 'Supabase недоступний, працюємо локально в цьому браузері.',
    uploading: 'Завантажую файл...',
    required: 'Заповніть заголовок хоча б однією мовою.',
    storageError: 'Не вдалося зберегти. Можливо, файл завеликий для локального сховища браузера.',
  },
  ru: {
    eyebrow: 'Портфолио',
    title: 'Карточки результатов',
    intro: 'Добавляйте случаи, переводите описание на три языка и прикрепляйте фото, GIF или видео.',
    add: 'Добавить карточку',
    cancel: 'Отмена',
    save: 'Сохранить карточку',
    update: 'Обновить карточку',
    edit: 'Редактировать',
    remove: 'Удалить',
    previewLang: 'Язык просмотра',
    formTitleNew: 'Новая карточка',
    formTitleEdit: 'Редактирование карточки',
    media: 'Медиа',
    file: 'Файл с устройства',
    url: 'Ссылка на медиа',
    clearMedia: 'Убрать медиа',
    fields: {
      tag: 'Метка',
      patient: 'Пациент',
      title: 'Заголовок',
      description: 'Описание',
      metricOneValue: 'Метрика 1',
      metricOneLabel: 'Подпись 1',
      metricTwoValue: 'Метрика 2',
      metricTwoLabel: 'Подпись 2',
      quote: 'Цитата',
    },
    empty: 'Пока нет карточек.',
    confirm: 'Удалить эту карточку?',
    saved: 'Сохранено.',
    loadedCloud: 'Supabase подключен.',
    fallbackLocal: 'Supabase недоступен, работаем локально в этом браузере.',
    uploading: 'Загружаю файл...',
    required: 'Заполните заголовок хотя бы на одном языке.',
    storageError: 'Не удалось сохранить. Возможно, файл слишком большой для локального хранилища браузера.',
  },
  en: {
    eyebrow: 'Portfolio',
    title: 'Result cards',
    intro: 'Add cases, translate descriptions into three languages, and attach photos, GIFs, or videos.',
    add: 'Add card',
    cancel: 'Cancel',
    save: 'Save card',
    update: 'Update card',
    edit: 'Edit',
    remove: 'Delete',
    previewLang: 'Preview language',
    formTitleNew: 'New card',
    formTitleEdit: 'Editing card',
    media: 'Media',
    file: 'File from device',
    url: 'Media URL',
    clearMedia: 'Remove media',
    fields: {
      tag: 'Tag',
      patient: 'Patient',
      title: 'Title',
      description: 'Description',
      metricOneValue: 'Metric 1',
      metricOneLabel: 'Label 1',
      metricTwoValue: 'Metric 2',
      metricTwoLabel: 'Label 2',
      quote: 'Quote',
    },
    empty: 'No cards yet.',
    confirm: 'Delete this card?',
    saved: 'Saved.',
    loadedCloud: 'Supabase connected.',
    fallbackLocal: 'Supabase is unavailable, using local browser storage.',
    uploading: 'Uploading file...',
    required: 'Fill in a title in at least one language.',
    storageError: 'Could not save. The file may be too large for browser local storage.',
  },
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createEmptyCard(): PortfolioCard {
  return {
    id: createId(),
    media: { kind: 'none', src: '', source: 'none' },
    createdAt: new Date().toISOString(),
    text: {
      uk: { ...emptyText },
      ru: { ...emptyText },
      en: { ...emptyText },
    },
  }
}

function inferMediaKind(value: string, fileType?: string): MediaKind {
  const lower = value.toLowerCase()
  if (!value) return 'none'
  if (fileType?.startsWith('video/') || /\.(mp4|webm|ogg|mov)(\?.*)?$/.test(lower)) return 'video'
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('vimeo.com')) return 'embed'
  return 'image'
}

function toEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${parsed.pathname.replace('/', '')}`
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }
    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : url
    }
    return url
  } catch {
    return url
  }
}

function displayText(card: PortfolioCard, lang: EditorLang) {
  const current = card.text[lang]
  if (current.title || current.description) return current
  return card.text.uk.title || card.text.uk.description ? card.text.uk : card.text.ru
}

function rowToCard(row: PortfolioRow): PortfolioCard {
  return {
    id: row.id,
    media: row.media || { kind: 'none', src: '', source: 'none' },
    text: {
      uk: { ...emptyText, ...row.text?.uk },
      ru: { ...emptyText, ...row.text?.ru },
      en: { ...emptyText, ...row.text?.en },
    },
    createdAt: row.created_at,
  }
}

function cardToRow(card: PortfolioCard) {
  return {
    id: card.id,
    media: card.media,
    text: card.text,
    created_at: card.createdAt,
  }
}

function safeFileName(fileName: string) {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'upload'
  const base = fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42)

  return `${base || 'media'}-${Date.now()}.${extension}`
}

function MediaPreview({ media, title }: { media: PortfolioMedia; title: string }) {
  if (!media.src) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center bg-gradient-to-br from-sky-50 to-sage-50 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Media
      </div>
    )
  }

  if (media.kind === 'video') {
    return (
      <video className="h-full w-full object-cover" src={media.src} controls playsInline>
        <track kind="captions" />
      </video>
    )
  }

  if (media.kind === 'embed') {
    return (
      <iframe
        className="h-full w-full"
        src={toEmbedUrl(media.src)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  return <img className="h-full w-full object-cover" src={media.src} alt={title} />
}

export default function PortfolioManager() {
  const { lang } = useI18n()
  const t = ui[lang]
  const [cards, setCards] = useState<PortfolioCard[]>(defaultCards)
  const [draft, setDraft] = useState<PortfolioCard>(() => createEmptyCard())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editLang, setEditLang] = useState<EditorLang>('uk')
  const [previewLang, setPreviewLang] = useState<EditorLang>(lang)
  const [mediaUrl, setMediaUrl] = useState('')
  const [status, setStatus] = useState('')
  const [useCloud, setUseCloud] = useState(false)

  useEffect(() => {
    let active = true

    const loadCards = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('portfolio_cards')
          .select('id, media, text, created_at')
          .order('created_at', { ascending: false })

        if (!error && active) {
          const nextCards = data?.length ? (data as PortfolioRow[]).map(rowToCard) : defaultCards
          setCards(nextCards)
          setUseCloud(true)
          setStatus(t.loadedCloud)
          window.localStorage.setItem(storageKey, JSON.stringify(nextCards))
          return
        }
      }

      if (!active) return

      try {
        const saved = window.localStorage.getItem(storageKey)
        if (saved) setCards(JSON.parse(saved) as PortfolioCard[])
      } catch {
        setCards(defaultCards)
      }

      setUseCloud(false)
      if (isSupabaseConfigured) setStatus(t.fallbackLocal)
    }

    loadCards()

    return () => {
      active = false
    }
  }, [t.fallbackLocal, t.loadedCloud])

  useEffect(() => {
    setPreviewLang(lang)
  }, [lang])

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [cards],
  )

  const persist = async (
    nextCards: PortfolioCard[],
    remote?: { type: 'upsert'; card: PortfolioCard } | { type: 'delete'; id: string },
  ) => {
    if (supabase && useCloud && remote?.type === 'upsert') {
      const { error } = await supabase
        .from('portfolio_cards')
        .upsert(cardToRow(remote.card), { onConflict: 'id' })

      if (error) throw error
    }

    if (supabase && useCloud && remote?.type === 'delete') {
      const { error } = await supabase
        .from('portfolio_cards')
        .delete()
        .eq('id', remote.id)

      if (error) throw error
    }

    window.localStorage.setItem(storageKey, JSON.stringify(nextCards))
    setCards(nextCards)
  }

  const openNewCard = () => {
    setDraft(createEmptyCard())
    setEditingId(null)
    setMediaUrl('')
    setEditLang('uk')
    setStatus('')
    setFormOpen(true)
  }

  const openEditCard = (card: PortfolioCard) => {
    setDraft({
      ...card,
      text: {
        uk: { ...card.text.uk },
        ru: { ...card.text.ru },
        en: { ...card.text.en },
      },
      media: { ...card.media },
    })
    setEditingId(card.id)
    setMediaUrl(card.media.source === 'url' ? card.media.src : '')
    setEditLang(previewLang)
    setStatus('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setDraft(createEmptyCard())
    setMediaUrl('')
    setStatus('')
  }

  const updateText = (field: keyof PortfolioText, value: string) => {
    setDraft((current) => ({
      ...current,
      text: {
        ...current.text,
        [editLang]: {
          ...current.text[editLang],
          [field]: value,
        },
      },
    }))
  }

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (supabase && useCloud) {
      setStatus(t.uploading)
      const path = `portfolio/${safeFileName(file.name)}`
      const { error } = await supabase.storage
        .from(portfolioMediaBucket)
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        })

      if (!error) {
        const { data } = supabase.storage.from(portfolioMediaBucket).getPublicUrl(path)
        setDraft((current) => ({
          ...current,
          media: {
            kind: inferMediaKind(data.publicUrl, file.type),
            src: data.publicUrl,
            source: 'file',
            name: file.name,
          },
        }))
        setMediaUrl('')
        setStatus('')
        return
      }

      setStatus(t.fallbackLocal)
    }

    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result || '')
      setDraft((current) => ({
        ...current,
        media: {
          kind: inferMediaKind(src, file.type),
          src,
          source: 'file',
          name: file.name,
        },
      }))
      setMediaUrl('')
    }
    reader.readAsDataURL(file)
  }

  const clearMedia = () => {
    setDraft((current) => ({ ...current, media: { kind: 'none', src: '', source: 'none' } }))
    setMediaUrl('')
  }

  const saveCard = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const hasTitle = editorLangs.some(({ key }) => draft.text[key].title.trim())
    if (!hasTitle) {
      setStatus(t.required)
      return
    }

    const media = mediaUrl.trim()
      ? {
          kind: inferMediaKind(mediaUrl.trim()),
          src: mediaUrl.trim(),
          source: 'url' as const,
          name: mediaUrl.trim(),
        }
      : draft.media

    const nextCard = {
      ...draft,
      media,
      createdAt: editingId ? draft.createdAt : new Date().toISOString(),
    }

    try {
      const nextCards = editingId
        ? cards.map((card) => (card.id === editingId ? nextCard : card))
        : [nextCard, ...cards]
      await persist(nextCards, { type: 'upsert', card: nextCard })
      closeForm()
      setStatus(t.saved)
    } catch {
      setStatus(t.storageError)
    }
  }

  const removeCard = async (id: string) => {
    if (!window.confirm(t.confirm)) return
    try {
      await persist(cards.filter((card) => card.id !== id), { type: 'delete', id })
    } catch {
      setStatus(t.storageError)
    }
  }

  const currentText = draft.text[editLang]

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-10 pt-28 sm:px-6 lg:px-12 lg:pt-32">
      <h1 className="sr-only">{t.title}</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="rounded-full border border-white/70 bg-white/72 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          {t.intro}
        </p>
        <button type="button" onClick={openNewCard} className="btn-primary shrink-0">
          <PlusIcon />
          <span className="ml-2">{t.add}</span>
        </button>
      </div>

      {status && !formOpen && (
        <p className="w-fit rounded-full border border-white/70 bg-white/72 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
          {status}
        </p>
      )}

      {formOpen && (
        <form onSubmit={saveCard} className="grid gap-5 rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-xl sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="heading-section text-2xl text-slate-800">
                {editingId ? t.formTitleEdit : t.formTitleNew}
              </h2>
              <div className="inline-flex rounded-full border border-sky-100 bg-sky-50 p-1">
                {editorLangs.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditLang(key)}
                    className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                      editLang === key ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.fields.tag} value={currentText.tag} onChange={(value) => updateText('tag', value)} />
              <Field label={t.fields.patient} value={currentText.patient} onChange={(value) => updateText('patient', value)} />
            </div>
            <Field label={t.fields.title} value={currentText.title} onChange={(value) => updateText('title', value)} />
            <TextArea label={t.fields.description} value={currentText.description} onChange={(value) => updateText('description', value)} rows={5} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.fields.metricOneValue} value={currentText.metricOneValue} onChange={(value) => updateText('metricOneValue', value)} />
              <Field label={t.fields.metricOneLabel} value={currentText.metricOneLabel} onChange={(value) => updateText('metricOneLabel', value)} />
              <Field label={t.fields.metricTwoValue} value={currentText.metricTwoValue} onChange={(value) => updateText('metricTwoValue', value)} />
              <Field label={t.fields.metricTwoLabel} value={currentText.metricTwoLabel} onChange={(value) => updateText('metricTwoLabel', value)} />
            </div>
            <TextArea label={t.fields.quote} value={currentText.quote} onChange={(value) => updateText('quote', value)} rows={3} />
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t.media}</p>
              <div className="relative mb-4 min-h-[260px] overflow-hidden rounded-xl bg-white">
                <MediaPreview media={mediaUrl.trim() ? { kind: inferMediaKind(mediaUrl), src: mediaUrl, source: 'url' } : draft.media} title={currentText.title || t.media} />
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t.file}</span>
                <input
                  type="file"
                  accept="image/*,video/*,.gif"
                  onChange={handleFile}
                  className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-sky-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-sky-700"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t.url}</span>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder="https://..."
                  className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300"
                />
              </label>
              {(draft.media.src || mediaUrl) && (
                <button type="button" onClick={clearMedia} className="mt-4 min-h-11 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600">
                  {t.clearMedia}
                </button>
              )}
            </div>

            {status && <p className="rounded-xl bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">{status}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="btn-primary flex-1">
                <SaveIcon />
                <span className="ml-2">{editingId ? t.update : t.save}</span>
              </button>
              <button type="button" onClick={closeForm} className="btn-outline flex-1">
                {t.cancel}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t.previewLang}</p>
        <div className="inline-flex w-fit rounded-full border border-white/70 bg-white/70 p-1 shadow-sm">
          {editorLangs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreviewLang(key)}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${
                previewLang === key ? 'bg-sky-100 text-sky-800' : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {sortedCards.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sky-200 bg-white/70 p-10 text-center text-slate-500">
            {t.empty}
          </div>
        )}

        {sortedCards.map((card, index) => {
          const content = displayText(card, previewLang)
          return (
            <article
              key={card.id}
              className={`overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)] md:flex ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="relative min-h-[280px] md:w-2/5">
                <MediaPreview media={card.media} title={content.title || t.title} />
                {content.tag && (
                  <span className="absolute left-5 top-5 rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700 shadow-sm">
                    {content.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-center gap-5 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    {content.patient && <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{content.patient}</p>}
                    <h3 className="heading-section text-3xl text-slate-800">{content.title || t.formTitleNew}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditCard(card)} className="min-h-11 rounded-full border border-sky-200 px-4 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50">
                      {t.edit}
                    </button>
                    <button type="button" onClick={() => removeCard(card.id)} className="min-h-11 rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50">
                      {t.remove}
                    </button>
                  </div>
                </div>

                {content.description && <p className="text-lg leading-relaxed text-slate-600">{content.description}</p>}

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:flex sm:gap-10">
                  {(content.metricOneValue || content.metricOneLabel) && (
                    <div>
                      <div className="stat-number" style={{ fontSize: '2.25rem' }}>{content.metricOneValue}</div>
                      <div className="mt-1 text-xs font-semibold uppercase text-slate-600">{content.metricOneLabel}</div>
                    </div>
                  )}
                  {(content.metricTwoValue || content.metricTwoLabel) && (
                    <div>
                      <div className="stat-number" style={{ fontSize: '2.25rem' }}>{content.metricTwoValue}</div>
                      <div className="mt-1 text-xs font-semibold uppercase text-slate-600">{content.metricTwoLabel}</div>
                    </div>
                  )}
                </div>

                {content.quote && (
                  <div className="glass flex items-start gap-3 rounded-xl border border-nude-200 p-4">
                    <QuoteIcon />
                    <p className="text-sm italic leading-relaxed text-slate-600">«{content.quote}»</p>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-sky-300"
      />
    </label>
  )
}

function TextArea({ label, value, rows, onChange }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-700 outline-none transition-colors focus:border-sky-300"
      />
    </label>
  )
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path d="M17 21v-8H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  )
}

function QuoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-sky-400" aria-hidden="true">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor" />
    </svg>
  )
}
