import { useMemo, useState, useEffect, useRef } from 'react'

const KINDS = [
    { key: 'habit', title: 'Привычка' },
    { key: 'task', title: 'Задача' },
]

function firstGrapheme(s) {
    const str = (s || '').trim()
    if (!str) return ''
    try {
        if (Intl?.Segmenter) {
            const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
            return [...seg.segment(str)][0]?.segment || ''
        }
    } catch (_) {}
    return Array.from(str)[0] || ''
}

export default function CreateItemFab({ onCreate, bottomOffsetPx = 0 }) {
    const fabRef = useRef(null)
    const titleRef = useRef(null)

    // closed | flying | open
    const [ui, setUi] = useState('closed')
    const [fly, setFly] = useState({ sx: 0, sy: 0, ex: 0, ey: 0 })

    const [kind, setKind] = useState('habit')
    const [emoji, setEmoji] = useState('🏃')
    const [title, setTitle] = useState('')
    const [reminderEnabled, setReminderEnabled] = useState(false)
    const [reminderTime, setReminderTime] = useState('')
    const [comment, setComment] = useState('')

    const canSubmit = useMemo(() => title.trim().length > 0, [title])
    const open = ui !== 'closed'

    const FLY_MS = 420
    const BURST_MS = 320
    const OPEN_AFTER_MS = FLY_MS + 80

    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [open])

    useEffect(() => {
        if (ui !== 'open') return
        const id = setTimeout(() => titleRef.current?.focus?.(), 90)
        return () => clearTimeout(id)
    }, [ui])

    const resetForm = () => {
        setKind('habit')
        setEmoji('🏃')
        setTitle('')
        setReminderEnabled(false)
        setReminderTime('')
        setComment('')
    }

    const close = () => {
        setUi('closed')
        setTimeout(() => resetForm(), 240)
    }

    const startOpen = () => {
        const el = fabRef.current
        const size = 56
        const vw = window.innerWidth
        const vh = window.innerHeight

        if (el) {
            const r = el.getBoundingClientRect()
            const sx = r.left + r.width / 2 - size / 2
            const sy = r.top + r.height / 2 - size / 2
            const ex = vw / 2 - size / 2
            const ey = vh / 2 - size / 2 - 40
            setFly({ sx, sy, ex, ey })
        } else {
            setFly({
                sx: vw / 2 - size / 2,
                sy: vh - 140,
                ex: vw / 2 - size / 2,
                ey: vh / 2 - size / 2 - 40,
            })
        }

        setUi('flying')
        setTimeout(() => setUi('open'), OPEN_AFTER_MS)
    }

    const submit = () => {
        if (!canSubmit) return
        const cleanTitle = title.trim()
        const e = emoji ? `${emoji} ` : ''

        onCreate?.({
            kind,
            title: `${e}${cleanTitle}`.trim(),
            comment: comment.trim(),
            reminderTime: reminderEnabled ? (reminderTime || '') : '',
            tag: '',
            completed: kind === 'task' ? false : undefined,
        })

        close()
    }

    const showOrb = ui === 'flying'
    const showSheet = ui === 'open'
    const fabBottom = `calc(${bottomOffsetPx}px + 22px + env(safe-area-inset-bottom))`

    return (
        <>
            {!open ? (
                <button
                    ref={fabRef}
                    type="button"
                    onClick={startOpen}
                    className="fixed left-1/2 -translate-x-1/2 z-[180]"
                    style={{ bottom: fabBottom }}
                    aria-label="create"
                >
                    <div className="press grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-soft">
                        <span className="text-2xl leading-none">+</span>
                    </div>
                </button>
            ) : null}

            <div
                className={['fixed inset-0 z-[220]', open ? 'pointer-events-auto' : 'pointer-events-none'].join(' ')}
                aria-hidden={!open}
            >
                <button
                    type="button"
                    onClick={close}
                    className={['absolute inset-0 scrim-smooth', open ? 'scrim-smooth-on' : 'scrim-smooth-off'].join(' ')}
                    aria-label="close"
                />

                {showOrb ? (
                    <div
                        className="fab-fly-orb fab-fly-orb-fly-smooth"
                        style={{
                            '--sx': `${fly.sx}px`,
                            '--sy': `${fly.sy}px`,
                            '--ex': `${fly.ex}px`,
                            '--ey': `${fly.ey}px`,
                            '--flyMs': `${FLY_MS}ms`,
                            '--burstMs': `${BURST_MS}ms`,
                        }}
                    >
                        <div className="fab-fly-orb-inner">+</div>
                    </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom))]">
                    <div className="w-full max-w-md">
                        {showSheet ? (
                            <div className="ios-sheet sheet-pop-smooth">
                                <div className="ios-handle" />

                                <div className="px-5 pb-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-[32px] leading-none font-bold text-text">
                                                Новая {kind === 'habit' ? 'привычка' : 'задача'}
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                {KINDS.map((k) => (
                                                    <button
                                                        key={k.key}
                                                        type="button"
                                                        onClick={() => setKind(k.key)}
                                                        className={[
                                                            'press rounded-full px-3 py-2 text-xs border border-border-subtle',
                                                            kind === k.key ? 'bg-accent text-white' : 'bg-surface-elevated/55 text-text',
                                                        ].join(' ')}
                                                    >
                                                        {k.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={close}
                                            className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                        >
                                            Закрыть
                                        </button>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <div className="text-sm font-semibold text-text">
                                            Название и значок {kind === 'habit' ? 'привычки' : 'задачи'}
                                        </div>

                                        <div className="ios-field">
                                            <input
                                                ref={titleRef}
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder={kind === 'habit' ? 'Название привычки' : 'Название задачи'}
                                                className="w-full bg-transparent outline-none text-[15px] text-text"
                                            />

                                            <input
                                                value={emoji}
                                                onChange={(e) => setEmoji(firstGrapheme(e.target.value) || '✨')}
                                                className="w-12 h-12 rounded-2xl text-xl text-center border border-border-subtle bg-surface/70 outline-none"
                                                aria-label="emoji"
                                            />
                                        </div>

                                        <div className="ios-field">
                                            <div className="ios-field-icon">✎</div>
                                            <input
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="Комментарий (необязательно)"
                                                className="w-full bg-transparent outline-none text-[15px] text-text"
                                            />
                                        </div>

                                        <div className="ios-field">
                                            <div className="ios-field-icon">🔔</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[15px] font-semibold text-text">Ежедневное уведомление</div>
                                                <div className="mt-1 text-xs text-muted">Пока сохраняем только время</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={reminderEnabled}
                                                onChange={(e) => setReminderEnabled(e.target.checked)}
                                                className="h-5 w-5"
                                            />
                                        </div>

                                        {reminderEnabled ? (
                                            <div className="ios-field">
                                                <div className="ios-field-icon">⏰</div>
                                                <input
                                                    type="time"
                                                    value={reminderTime}
                                                    onChange={(e) => setReminderTime(e.target.value)}
                                                    className="w-full bg-transparent outline-none text-[15px] text-text"
                                                />
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            type="button"
                                            onClick={submit}
                                            disabled={!canSubmit}
                                            className={[
                                                'press w-full rounded-2xl py-4 text-sm font-semibold',
                                                canSubmit
                                                    ? 'bg-accent text-white'
                                                    : 'bg-surface-elevated/50 text-muted border border-border-subtle',
                                            ].join(' ')}
                                        >
                                            Сохранить
                                        </button>
                                    </div>

                                    <p className="mt-3 text-center text-[11px] text-muted/80">
                                        Тап по фону — закрыть
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    )
}