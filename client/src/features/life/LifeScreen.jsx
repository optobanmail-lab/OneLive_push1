import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import useHabitStore from '../../store/useHabitStore'
import useUiStore from '../../store/useUiStore.js'
import { hapticLight } from '../../app/telegram'

const NAV_CLEARANCE_PX = 92
const EMPTY_OBJ = {}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}

function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function addDays(date, delta) {
    const d = new Date(date)
    d.setDate(d.getDate() + delta)
    return d
}

function getLastNDaysKeys(n = 7) {
    const out = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) out.push(getLocalDateKey(addDays(now, -i)))
    return out
}

function MiniCard({ label, value, hint, icon }) {
    return (
        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/55 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-muted">{label}</div>
                {icon ? <div className="text-[12px] text-muted">{icon}</div> : null}
            </div>
            <div className="mt-1 text-[16px] font-semibold text-text">{value}</div>
            {hint ? <div className="mt-1 text-[11px] text-muted">{hint}</div> : null}
        </div>
    )
}

function TodayRow({ title, kind, done, onToggle }) {
    return (
        <div
            className={['panel-row row-clickable', done ? 'panel-row-active' : ''].join(' ')}
            role="button"
            tabIndex={0}
            onClick={onToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onToggle?.()
            }}
            style={{ paddingTop: 12, paddingBottom: 12 }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-muted">
              {kind === 'task' ? 'Задача' : 'Привычка'}
            </span>
                        <span className={done ? 'text-[11px] text-success-fluid' : 'text-[11px] text-muted'}>
              {done ? '✓ выполнено' : 'не выполнено'}
            </span>
                    </div>

                    <div className="mt-2 text-[14px] font-semibold text-text truncate">{title}</div>
                </div>

                <div className="shrink-0 pt-1 pointer-events-none">
                    <div
                        className={[
                            'grid place-items-center rounded-full border border-border-subtle',
                            done ? 'bg-accent text-white' : 'bg-white/5 text-muted',
                        ].join(' ')}
                        style={{ width: 36, height: 36 }}
                    >
                        <span className="text-sm leading-none">{done ? '✓' : '○'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LifeScreen() {
    // ✅ без filter/map в селекторе (важно против “чёрного экрана”)
    const habits = useHabitStore((s) => s.habits)
    const completionsByDate = useHabitStore((s) => s.completionsByDate)

    const toggleHabitToday = useHabitStore((s) => s.toggleHabitToday)
    const toggleTaskDone = useHabitStore((s) => s.toggleTaskDone)

    const focusMinutes = useUiStore((s) => s.focusMinutes ?? 0)

    // no page scroll
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    const items = useMemo(() => (habits || []).filter((h) => !h.archived), [habits])

    const todayKey = getLocalDateKey()
    const doneMapToday = completionsByDate?.[todayKey] || EMPTY_OBJ

    const statsToday = useMemo(() => {
        const total = items.length
        let done = 0

        let habitsTotal = 0
        let tasksTotal = 0
        let habitsDone = 0
        let tasksDone = 0

        for (const it of items) {
            const kind = it.kind || 'habit'
            const isDone = kind === 'task' ? Boolean(it.completed) : Boolean(doneMapToday?.[it.id])

            if (kind === 'task') {
                tasksTotal++
                if (isDone) tasksDone++
            } else {
                habitsTotal++
                if (isDone) habitsDone++
            }

            if (isDone) done++
        }

        const left = Math.max(0, total - done)
        const percent = total > 0 ? Math.round((done / total) * 100) : 0

        return { total, done, left, percent, habitsTotal, tasksTotal, habitsDone, tasksDone }
    }, [items, doneMapToday])

    const streak = useMemo(() => {
        const byDate = completionsByDate || EMPTY_OBJ
        let s = 0
        const now = new Date()
        for (let i = 0; i < 400; i++) {
            const key = getLocalDateKey(addDays(now, -i))
            const day = byDate?.[key] || EMPTY_OBJ
            if (Object.keys(day).length === 0) break
            s++
        }
        return s
    }, [completionsByDate])

    const last7 = useMemo(() => {
        const byDate = completionsByDate || EMPTY_OBJ
        const keys = getLastNDaysKeys(7)
        let daysActive = 0
        let marks = 0
        for (const k of keys) {
            const day = byDate?.[k] || EMPTY_OBJ
            const c = Object.keys(day).length
            if (c > 0) daysActive++
            marks += c
        }
        return { daysActive, marks }
    }, [completionsByDate])

    const todayRows = useMemo(() => {
        const rows = items.map((it) => {
            const kind = it.kind || 'habit'
            const done = kind === 'task' ? Boolean(it.completed) : Boolean(doneMapToday?.[it.id])
            return { id: it.id, title: it.title || '', kind, done }
        })
        rows.sort((a, b) => Number(a.done) - Number(b.done))
        return rows
    }, [items, doneMapToday])

    const toggleFromLife = (row) => {
        if (!row) return
        if (row.kind === 'task') {
            if (typeof toggleTaskDone === 'function') toggleTaskDone(row.id)
            else toggleHabitToday(row.id)
        } else {
            toggleHabitToday(row.id)
        }
        hapticLight()
    }

    // ===== высота панели “как в таймере”: до BottomNav =====
    const panelWrapRef = useRef(null)
    const navSlotRef = useRef(null)
    const [panelH, setPanelH] = useState(0)

    const bottomOffset = NAV_CLEARANCE_PX + 12
    const navSlotBottom = `calc(${bottomOffset}px + env(safe-area-inset-bottom))`

    const recomputePanelH = () => {
        const wrapTop = panelWrapRef.current?.getBoundingClientRect().top
        const slotTop = navSlotRef.current?.getBoundingClientRect().top
        if (wrapTop == null || slotTop == null) return
        const next = slotTop - wrapTop - 12
        setPanelH(clamp(next, 180, 720))
    }

    useEffect(() => {
        setPanelH(0)
        requestAnimationFrame(() => requestAnimationFrame(recomputePanelH))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todayRows.length])

    useEffect(() => {
        const vv = window.visualViewport
        vv?.addEventListener('resize', recomputePanelH)
        window.addEventListener('resize', recomputePanelH)
        return () => {
            vv?.removeEventListener('resize', recomputePanelH)
            window.removeEventListener('resize', recomputePanelH)
        }
    }, [])
    // =======================================================

    return (
        <div
            className="space-y-4"
            style={{ paddingBottom: `calc(${bottomOffset}px + 76px + env(safe-area-inset-bottom))` }}
        >
            <Header title="Жизнь" />

            <section className="hero-card">
                <div className="text-xs text-muted">Сегодня</div>

                <div className="mt-2 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-end gap-2">
                            <div className="brand-time text-[44px] font-bold leading-none tracking-tight">
                                {statsToday.percent}%
                            </div>
                            <div className="pb-1 text-xs text-muted">
                                ритм • {statsToday.done}/{statsToday.total || 0}
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-muted">
                            привычки: {statsToday.habitsDone}/{statsToday.habitsTotal} • задачи: {statsToday.tasksDone}/{statsToday.tasksTotal}
                        </div>
                    </div>

                    <div className="shrink-0 text-right">
                        <div className="text-xs text-muted">Streak</div>
                        <div className="mt-1 text-[18px] font-semibold text-text">🔥 {streak} д.</div>
                        <div className="mt-1 text-[11px] text-muted">7д: {last7.daysActive}/7</div>
                    </div>
                </div>

                <div className="mt-4 h-2 w-full rounded-full bg-white/5 overflow-hidden border border-border-subtle">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${statsToday.percent}%`,
                            background: 'rgb(var(--accent-glow))',
                            boxShadow: '0 10px 26px rgb(var(--accent-glow) / 0.25)',
                        }}
                    />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniCard label="Осталось" value={statsToday.left} hint="на сегодня" icon="◎" />
                    <MiniCard label="Фокус" value={`${focusMinutes}m`} hint="из таймера" icon="⏱" />
                    <MiniCard label="Отметок" value={last7.marks} hint="за 7 дней" icon="✓" />
                    <MiniCard label="Всего" value={statsToday.total} hint="привычки+задачи" icon="∑" />
                </div>
            </section>

            {/* PANEL фиксированной высоты, внутри скролл */}
            <div ref={panelWrapRef} style={{ height: panelH }}>
                <section className="panel-card h-full flex flex-col overflow-hidden">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-text">Сегодня</div>
                            <div className="mt-1 text-xs text-muted">тап по строке — отметить</div>
                        </div>
                        <div className="text-xs text-muted">
                            {statsToday.total ? `${statsToday.done}/${statsToday.total}` : '—'}
                        </div>
                    </div>

                    <div
                        className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 pr-1 pb-2"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            overscrollBehavior: 'contain',
                            touchAction: 'pan-y',
                        }}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {todayRows.length === 0 ? (
                            <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-4 text-sm text-muted text-center">
                                Пока нет привычек/задач. Создай через “+”.
                            </div>
                        ) : (
                            todayRows.map((r) => (
                                <TodayRow
                                    key={r.id}
                                    title={r.title}
                                    kind={r.kind}
                                    done={r.done}
                                    onToggle={() => toggleFromLife(r)}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>

            {/* slot для вычисления высоты до BottomNav */}
            <div
                ref={navSlotRef}
                className="fixed left-0 right-0 pointer-events-none"
                style={{ bottom: navSlotBottom, height: 1, zIndex: 50 }}
            />
        </div>
    )
}