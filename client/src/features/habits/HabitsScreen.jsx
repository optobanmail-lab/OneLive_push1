import { useMemo, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import useHabitStore from '../../store/useHabitStore'
import { hapticLight } from '../../app/telegram'
import LiquidButton from '../../components/ui/LiquidButton'
import CreateItemFab from './CreateItemFab.jsx'

function KindPill({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`press rounded-full px-4 py-2 text-sm ${
                active ? 'bg-accent text-white' : 'bg-surface/70 text-muted'
            }`}
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

function HabitsScreen() {
    const habits = useHabitStore((s) => s.habits)

    const filter = useHabitStore((s) => s.filter) // all | active | done
    const setFilter = useHabitStore((s) => s.setFilter)

    const addHabit = useHabitStore((s) => s.addHabit)
    const editHabit = useHabitStore((s) => s.editHabit)
    const deleteHabit = useHabitStore((s) => s.deleteHabit)

    const toggleHabitToday = useHabitStore((s) => s.toggleHabitToday)
    const isHabitDoneToday = useHabitStore((s) => s.isHabitDoneToday)

    // Локальный фильтр по типу: habit/task
    const [kindFilter, setKindFilter] = useState('all') // all | habit | task

    // Редактирование (пока редактируем только title — мета добавим позже)
    const [editingId, setEditingId] = useState(null)
    const [editingValue, setEditingValue] = useState('')

    const activeItems = useMemo(
        () => (habits || []).filter((h) => !h.archived),
        [habits]
    )

    const filteredItems = useMemo(() => {
        let list = activeItems

        // kind filter
        if (kindFilter !== 'all') {
            list = list.filter((x) => (x.kind || 'habit') === kindFilter)
        }

        // status filter (на сегодня)
        if (filter === 'active') list = list.filter((x) => !isHabitDoneToday(x.id))
        if (filter === 'done') list = list.filter((x) => isHabitDoneToday(x.id))

        return list
    }, [activeItems, kindFilter, filter, isHabitDoneToday])

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

    return (
        <div className="pt-4">
            <Header
                title="Привычки / Задачи"
                subtitle="Создавай через «+». Удерживай — чтобы отметить на сегодня."
            />

            {/* Фильтры по типу */}
            <div className="mb-3 flex gap-2">
                <KindPill active={kindFilter === 'all'} onClick={() => setKindFilter('all')}>
                    Все
                </KindPill>
                <KindPill active={kindFilter === 'habit'} onClick={() => setKindFilter('habit')}>
                    Привычки
                </KindPill>
                <KindPill active={kindFilter === 'task'} onClick={() => setKindFilter('task')}>
                    Задачи
                </KindPill>
            </div>

            {/* Фильтры по статусу (на сегодня) */}
            <div className="mb-4 flex gap-2">
                <KindPill active={filter === 'all'} onClick={() => setFilter('all')}>
                    Все
                </KindPill>
                <KindPill active={filter === 'active'} onClick={() => setFilter('active')}>
                    Не сделаны
                </KindPill>
                <KindPill active={filter === 'done'} onClick={() => setFilter('done')}>
                    Сделаны
                </KindPill>
            </div>

            <div className="space-y-3">
                {filteredItems.length === 0 ? (
                    <Card>
                        <p className="text-center text-sm text-muted">
                            Здесь пока пусто. Нажми «+» и создай первую привычку или задачу.
                        </p>
                    </Card>
                ) : (
                    filteredItems.map((item) => {
                        const kind = item.kind || 'habit'
                        const doneToday = isHabitDoneToday(item.id)

                        return (
                            <Card key={item.id} className="glass-card">
                                <div className="flex items-start justify-between gap-3">
                                    {/* left */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                      <span
                          className={`inline-flex h-6 items-center rounded-full px-2 text-[11px] ${
                              kind === 'habit'
                                  ? 'bg-white/5 text-muted'
                                  : 'bg-white/5 text-muted'
                          }`}
                      >
                        {kind === 'habit' ? 'Привычка' : 'Задача'}
                      </span>

                                            {doneToday ? (
                                                <span className="text-[11px] text-success">✓ сегодня</span>
                                            ) : (
                                                <span className="text-[11px] text-muted">не отмечено</span>
                                            )}
                                        </div>

                                        <div className="mt-2">
                                            {editingId === item.id ? (
                                                <input
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    className="input-liquid"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(item.id)
                                                        if (e.key === 'Escape') {
                                                            setEditingId(null)
                                                            setEditingValue('')
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <p
                                                    className={`text-[15px] font-semibold ${
                                                        doneToday ? 'text-tertiary line-through' : 'text-primary'
                                                    }`}
                                                >
                                                    {item.title}
                                                </p>
                                            )}

                                            {item.comment ? (
                                                <p className="mt-1 text-sm text-muted">
                                                    {item.comment}
                                                </p>
                                            ) : null}

                                            {/* meta row */}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {item.reminderTime ? <MetaChip>⏰ {item.reminderTime}</MetaChip> : null}
                                                {item.tag ? <MetaChip>#{item.tag.replace(/^#/, '')}</MetaChip> : null}
                                            </div>
                                        </div>
                                    </div>

                                    {/* right */}
                                    <div className="shrink-0">
                                        {doneToday ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    toggleHabitToday(item.id) // снять отметку
                                                    hapticLight()
                                                }}
                                                className="press rounded-full bg-white/5 px-3 py-2 text-xs text-text"
                                            >
                                                Снять
                                            </button>
                                        ) : (
                                            <div className="w-[120px]">
                                                <LiquidButton
                                                    label="Держите"
                                                    duration={1400}
                                                    completed={false}
                                                    onHoldComplete={() => {
                                                        toggleHabitToday(item.id)
                                                        hapticLight()
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* actions */}
                                <div className="mt-4 flex gap-2">
                                    {editingId === item.id ? (
                                        <button
                                            type="button"
                                            onClick={() => saveEdit(item.id)}
                                            className="press rounded-xl bg-accent px-3 py-2 text-sm text-white"
                                        >
                                            Сохранить
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => startEdit(item)}
                                            className="press rounded-xl bg-white/5 px-3 py-2 text-sm text-text"
                                        >
                                            Изменить
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => deleteHabit(item.id)}
                                        className="press rounded-xl bg-danger/15 px-3 py-2 text-sm text-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>

            {/* FAB (+) */}
            <CreateItemFab onCreate={addHabit} />
        </div>
    )
}

export default HabitsScreen