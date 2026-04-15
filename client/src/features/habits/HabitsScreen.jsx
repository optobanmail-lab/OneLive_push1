import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import useHabitStore from '../../store/useHabitStore'
import { hapticLight } from '../../app/telegram'
import CreateItemFab from './CreateItemFab.jsx'

const NAV_CLEARANCE_PX = 92
const FAB_SLOT_H = 56 + 18

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}

function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'press rounded-full px-3 py-2 text-xs border border-border-subtle whitespace-nowrap',
                active ? 'bg-accent text-white' : 'bg-surface-elevated/55 text-text',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function MetaChip({ children }) {
    return (
        <span className="rounded-full bg-surface-elevated/60 px-3 py-1 text-[11px] text-muted">
      {children}
    </span>
    )
}

function DonePill({ done }) {
    return (
        <div className={['done-pill', done ? 'done-pill--on' : 'done-pill--off'].join(' ')}>
            <span className="text-lg leading-none">{done ? '✓' : '○'}</span>
        </div>
    )
}

/** как в TimerScreen: без translate */
function Scene({ active, children }) {
    return (
        <div
            className={[
                'absolute inset-0 transition-opacity duration-200 ease-out',
                active ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
        >
            {children}
        </div>
    )
}

export default function HabitsScreen() {
    const habits = useHabitStore((s) => s.habits)
    const completionsByDate = useHabitStore((s) => s.completionsByDate)

    const addHabit = useHabitStore((s) => s.addHabit)
    const editHabit = useHabitStore((s) => s.editHabit)
    const deleteHabit = useHabitStore((s) => s.deleteHabit)

    const toggleHabitToday = useHabitStore((s) => s.toggleHabitToday)
    const toggleTaskDone = useHabitStore((s) => s.toggleTaskDone)

    const [kindFilter, setKindFilter] = useState('all') // all | habit | task
    const [panel, setPanel] = useState('none') // none | list

    const [editingId, setEditingId] = useState(null)
    const [editingValue, setEditingValue] = useState('')

    const todayKey = getLocalDateKey()
    const doneMapToday = completionsByDate?.[todayKey] || {}

    // no page scroll (как TimerScreen)
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    const itemsAll = useMemo(
        () => (habits || []).filter((h) => !h.archived),
        [habits]
    )

    const items = useMemo(() => {
        if (kindFilter === 'all') return itemsAll
        return itemsAll.filter((x) => (x.kind || 'habit') === kindFilter)
    }, [itemsAll, kindFilter])

    useEffect(() => {
        setPanel(itemsAll.length > 0 ? 'list' : 'none')
    }, [itemsAll.length])

    const doneCountToday = useMemo(() => {
        let done = 0
        for (const it of itemsAll) {
            const kind = it.kind || 'habit'
            if (kind === 'task') {
                if (Boolean(it.completed)) done += 1
            } else {
                if (Boolean(doneMapToday?.[it.id])) done += 1
            }
        }
        return done
    }, [itemsAll, doneMapToday])

    const startEdit = (item) => {
        setEditingId(item.id)
        setEditingValue(item.title || '')
    }

    const saveEdit = (id) => {
        const t = editingValue.trim()
        if (!t) return
        editHabit(id, t)
        setEditingId(null)
        setEditingValue('')
    }

    const toggleDone = (item) => {
        if (editingId === item.id) return
        const kind = item.kind || 'habit'
        if (kind === 'task') {
            if (typeof toggleTaskDone === 'function') toggleTaskDone(item.id)
            else toggleHabitToday(item.id)
        } else {
            toggleHabitToday(item.id)
        }
        hapticLight()
    }

    // panel height like TimerScreen (до "слота" FAB)
    const panelWrapRef = useRef(null)
    const fabSlotRef = useRef(null)
    const [panelH, setPanelH] = useState(0)

    const recomputeTargetH = () => {
        const wrapTop = panelWrapRef.current?.getBoundingClientRect().top
        const slotTop = fabSlotRef.current?.getBoundingClientRect().top
        if (wrapTop == null || slotTop == null) return
        const next = slotTop - wrapTop - 12
        setPanelH(clamp(next, 140, 680))
    }

    useEffect(() => {
        if (panel === 'none') {
            setPanelH(0)
            return
        }
        setPanelH(0)
        requestAnimationFrame(() => requestAnimationFrame(recomputeTargetH))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panel, kindFilter, items.length])

    useEffect(() => {
        const vv = window.visualViewport
        vv?.addEventListener('resize', recomputeTargetH)
        window.addEventListener('resize', recomputeTargetH)
        return () => {
            vv?.removeEventListener('resize', recomputeTargetH)
            window.removeEventListener('resize', recomputeTargetH)
        }
    }, [])

    const panelOpen = panel !== 'none'

    const bottomOffset = NAV_CLEARANCE_PX + 12
    const fabBottomOffsetPx = NAV_CLEARANCE_PX + 14
    const fabSlotBottom = `calc(${fabBottomOffsetPx}px + 22px + env(safe-area-inset-bottom))`

    return (
        <div
            className="space-y-4"
            style={{ paddingBottom: `calc(${bottomOffset}px + 76px + env(safe-area-inset-bottom))` }}
        >
            {/* как в TimerScreen */}
            <Header
                title="Привычки"

            />

            {/* HERO CARD как в таймере */}
            <section className="hero-card">
                <div className="text-xs text-muted">{itemsAll.length ? 'Сегодня' : 'Пока пусто'}</div>

                <div className="mt-2 flex items-end gap-2">
                    <div className="brand-time text-[44px] font-bold leading-none tracking-tight">
                        {doneCountToday}/{itemsAll.length || 0}
                    </div>
                    <div className="pb-1 text-xs text-muted">выполнено</div>
                </div>

                <div className="mt-1 text-xs text-muted">
                    Тап по карточке — отметить/снять • “+” — создать
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    <Chip active={panel === 'list'} onClick={() => setPanel((p) => (p === 'list' ? 'none' : 'list'))}>
                        Список
                    </Chip>
                    <Chip active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>Все</Chip>
                    <Chip active={kindFilter === 'habit'} onClick={() => setKindFilter('habit')}>Привычки</Chip>
                    <Chip active={kindFilter === 'task'} onClick={() => setKindFilter('task')}>Задачи</Chip>
                </div>
            </section>

            {/* Expandable panel like TimerScreen */}
            <div
                ref={panelWrapRef}
                className={[
                    'relative overflow-hidden transition-[height,opacity] duration-200 ease-out',
                    panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                style={{ height: panelOpen ? panelH : 0, willChange: 'height' }}
            >
                <div className="absolute inset-0">
                    <Scene active={panel === 'list'}>
                        <section className="panel-card relative h-full flex flex-col overflow-hidden">
                            <div className="relative mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-text">Список</div>
                                    <div className="mt-1 text-xs text-muted">{items.length} шт. • {todayKey}</div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPanel('none')}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Скрыть
                                </button>
                            </div>

                            <div
                                className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 pr-1 pb-2"
                                style={{
                                    WebkitOverflowScrolling: 'touch',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'pan-y',
                                }}
                            >
                                {items.length === 0 ? (
                                    <div className="h-full grid place-items-center text-center">
                                        <div className="max-w-[320px]">
                                            <div className="text-xl font-semibold text-text">Нет элементов</div>
                                            <div className="mt-2 text-sm text-muted">Нажми “+”, чтобы создать.</div>
                                        </div>
                                    </div>
                                ) : (
                                    items.map((item) => {
                                        const kind = item.kind || 'habit'
                                        const isEditing = editingId === item.id

                                        const done =
                                            kind === 'task'
                                                ? Boolean(item.completed)
                                                : Boolean(doneMapToday?.[item.id])

                                        return (
                                            <div
                                                key={item.id}
                                                className={done ? 'panel-row panel-row-active row-clickable' : 'panel-row row-clickable'}
                                                onClick={() => toggleDone(item)}
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted">
                                {kind === 'habit' ? 'Привычка' : 'Задача'}
                              </span>
                                                            <span className={done ? 'text-[11px] text-success-fluid' : 'text-[11px] text-muted'}>
                                {done ? '✓ выполнено' : 'не выполнено'}
                              </span>
                                                        </div>

                                                        <div className="mt-2">
                                                            {isEditing ? (
                                                                <input
                                                                    value={editingValue}
                                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                                    className="input-liquid"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') saveEdit(item.id)
                                                                        if (e.key === 'Escape') {
                                                                            setEditingId(null)
                                                                            setEditingValue('')
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <p className={['text-[15px] font-semibold', done ? 'text-tertiary line-through' : 'text-text'].join(' ')}>
                                                                    {item.title}
                                                                </p>
                                                            )}

                                                            {item.comment ? <p className="mt-1 text-sm text-muted">{item.comment}</p> : null}

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {item.reminderTime ? <MetaChip>⏰ {item.reminderTime}</MetaChip> : null}
                                                                {item.tag ? <MetaChip>#{item.tag.replace(/^#/, '')}</MetaChip> : null}
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex gap-2">
                                                            {isEditing ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        saveEdit(item.id)
                                                                    }}
                                                                    className="press rounded-xl bg-accent px-3 py-2 text-sm text-white"
                                                                >
                                                                    Сохранить
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        startEdit(item)
                                                                    }}
                                                                    className="press rounded-xl bg-white/5 px-3 py-2 text-sm text-text"
                                                                >
                                                                    Изменить
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    deleteHabit(item.id)
                                                                }}
                                                                className="press rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 pt-1 pointer-events-none">
                                                        <DonePill done={done} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </section>
                    </Scene>
                </div>
            </div>

            {/* slot to compute panel height until FAB */}
            <div
                ref={fabSlotRef}
                className="fixed left-0 right-0 pointer-events-none"
                style={{
                    bottom: fabSlotBottom,
                    height: FAB_SLOT_H,
                    zIndex: 100,
                }}
            />

            <CreateItemFab onCreate={addHabit} bottomOffsetPx={fabBottomOffsetPx} />
        </div>
    )
}