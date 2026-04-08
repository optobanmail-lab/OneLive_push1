import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'

const KINDS = [
    { key: 'habit', title: 'Привычка', subtitle: 'Ежедневная отметка', icon: '◉' },
    { key: 'task', title: 'Задача', subtitle: 'Список дел', icon: '✓' },
]

function useViewport() {
    const [vp, setVp] = useState(() => ({
        w: typeof window !== 'undefined' ? window.innerWidth : 390,
        h: typeof window !== 'undefined' ? window.innerHeight : 844,
    }))

    useEffect(() => {
        const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    return vp
}

function FieldLabel({ children }) {
    return <p className="mb-2 text-xs text-muted">{children}</p>
}

export default function CreateItemFab({ onCreate }) {
    const { w, h } = useViewport()

    const [open, setOpen] = useState(false)
    const [step, setStep] = useState('menu') // menu | form
    const [kind, setKind] = useState('habit')

    const [title, setTitle] = useState('')
    const [comment, setComment] = useState('')
    const [reminderTime, setReminderTime] = useState('')
    const [tag, setTag] = useState('')

    const canSubmit = useMemo(() => title.trim().length > 0, [title])

    // Адаптивный размер модалки (rounded-card)
    const sheetW = useMemo(() => Math.min(380, w - 32), [w])
    const sheetH = useMemo(() => Math.min(520, h - 220), [h])

    const close = () => {
        setOpen(false)
        setTimeout(() => {
            setStep('menu')
            setKind('habit')
            setTitle('')
            setComment('')
            setReminderTime('')
            setTag('')
        }, 200)
    }

    const submit = () => {
        if (!canSubmit) return
        onCreate?.({
            kind,
            title: title.trim(),
            comment: comment.trim(),
            reminderTime: reminderTime || '',
            tag: tag.trim(),
        })
        close()
    }

    return (
        <LayoutGroup>
            {/* FAB (только когда закрыто, чтобы layoutId был в 1 экземпляре) */}
            {!open ? (
                <motion.button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="fixed right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50"
                    aria-label="create"
                >
                    <motion.div
                        layoutId="onelive-create"
                        className="press relative grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-soft"
                        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
                    >
                        <span className="text-2xl leading-none">+</span>
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 blur-xl opacity-40" />
                    </motion.div>
                </motion.button>
            ) : null}

            {/* Overlay + sheet */}
            <AnimatePresence>
                {open ? (
                    <motion.div
                        className="fixed inset-0 z-[60]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* scrim */}
                        <motion.button
                            type="button"
                            className="absolute inset-0 bg-black/45"
                            onClick={close}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            aria-label="close overlay"
                        />

                        {/* center wrapper */}
                        <div className="absolute inset-0 flex items-center justify-center px-4 py-[calc(16px+env(safe-area-inset-top))]">
                            <motion.div
                                layoutId="onelive-create"
                                className="relative overflow-hidden rounded-[28px] border border-border-subtle bg-surface/70 backdrop-blur-2xl shadow-soft"
                                style={{ width: sheetW, height: sheetH }}
                                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                            >
                                {/* premium highlights */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                                <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent2/20 blur-3xl" />
                                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

                                {/* content */}
                                <div className="relative flex h-full flex-col p-5">
                                    {/* header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-text">
                                                {step === 'menu' ? 'Создать' : 'Новая запись'}
                                            </p>
                                            <p className="mt-1 text-xs text-muted">
                                                {step === 'menu'
                                                    ? 'Выбери тип'
                                                    : kind === 'habit'
                                                        ? 'Привычка'
                                                        : 'Задача'}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={close}
                                            className="press rounded-full bg-white/5 px-3 py-2 text-xs text-text"
                                        >
                                            Закрыть
                                        </button>
                                    </div>

                                    {/* body */}
                                    <div className="mt-4 flex-1 overflow-auto hide-scrollbar pr-1">
                                        <AnimatePresence mode="wait" initial={false}>
                                            {step === 'menu' ? (
                                                <motion.div
                                                    key="menu"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                                    className="grid gap-3"
                                                >
                                                    {KINDS.map((k) => (
                                                        <button
                                                            key={k.key}
                                                            type="button"
                                                            onClick={() => {
                                                                setKind(k.key)
                                                                setStep('form')
                                                            }}
                                                            className="press w-full rounded-2xl bg-white/6 px-4 py-4 text-left"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-text">
                                                                    <span className="text-lg">{k.icon}</span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-base font-semibold text-text">
                                                                        {k.title}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-muted">
                                                                        {k.subtitle}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="form"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                                    className="space-y-3"
                                                >
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setStep('menu')}
                                                            className="press rounded-full bg-white/5 px-3 py-2 text-xs text-text"
                                                        >
                                                            ← Тип
                                                        </button>
                                                    </div>

                                                    <div>
                                                        <FieldLabel>Название *</FieldLabel>
                                                        <input
                                                            value={title}
                                                            onChange={(e) => setTitle(e.target.value)}
                                                            placeholder={kind === 'habit' ? 'Например: Вода' : 'Например: Сделать дз'}
                                                            className="input-liquid"
                                                        />
                                                    </div>

                                                    <div>
                                                        <FieldLabel>Комментарий</FieldLabel>
                                                        <input
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            placeholder="Коротко (необязательно)"
                                                            className="input-liquid"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <FieldLabel>Время</FieldLabel>
                                                            <input
                                                                type="time"
                                                                value={reminderTime}
                                                                onChange={(e) => setReminderTime(e.target.value)}
                                                                className="input-liquid"
                                                            />
                                                        </div>

                                                        <div>
                                                            <FieldLabel>Тег</FieldLabel>
                                                            <input
                                                                value={tag}
                                                                onChange={(e) => setTag(e.target.value)}
                                                                placeholder="#учёба"
                                                                className="input-liquid"
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={submit}
                                                        disabled={!canSubmit}
                                                        className={`press w-full rounded-2xl py-3 text-sm font-semibold ${
                                                            canSubmit ? 'bg-accent text-white' : 'bg-white/5 text-muted'
                                                        }`}
                                                    >
                                                        Создать
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <p className="mt-3 text-center text-[11px] text-muted/80">
                                        Тап по фону — закрыть
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* маленькая кнопка закрытия внизу справа (по желанию) */}
                        <motion.button
                            type="button"
                            onClick={close}
                            className="fixed right-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-[70]"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            aria-label="close"
                        >
                            <div className="press grid h-12 w-12 place-items-center rounded-full bg-white/8 text-text backdrop-blur-xl">
                                ×
                            </div>
                        </motion.button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </LayoutGroup>
    )
}