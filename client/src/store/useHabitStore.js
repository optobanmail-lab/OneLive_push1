import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function getLocalDateKey(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

const useHabitStore = create(
    persist(
        (set, get) => ({
            // items: habits + tasks live together
            habits: [],
            // per-day completions for HABITS only
            completionsByDate: {}, // { 'YYYY-MM-DD': { [habitId]: true } }

            // kept for compatibility (если где-то в проекте используешь)
            filter: 'all',
            setFilter: (filter) => set({ filter }),

            addHabit: (payload) => {
                const kind = payload?.kind === 'task' ? 'task' : 'habit'
                const item = {
                    id: uid(),
                    kind,
                    title: String(payload?.title || '').trim(),
                    comment: String(payload?.comment || '').trim(),
                    reminderTime: String(payload?.reminderTime || '').trim(),
                    tag: String(payload?.tag || '').trim(),
                    archived: false,
                    createdAt: Date.now(),

                    // IMPORTANT: tasks are persistent completion
                    completed: kind === 'task' ? Boolean(payload?.completed) : undefined,
                }

                if (!item.title) return

                set((s) => ({
                    habits: [item, ...(s.habits || [])],
                }))
            },

            editHabit: (id, nextTitle) => {
                const t = String(nextTitle || '').trim()
                if (!t) return
                set((s) => ({
                    habits: (s.habits || []).map((h) => (h.id === id ? { ...h, title: t } : h)),
                }))
            },

            deleteHabit: (id) => {
                set((s) => {
                    const nextHabits = (s.habits || []).filter((h) => h.id !== id)

                    // remove from all completions
                    const nextCompletions = { ...(s.completionsByDate || {}) }
                    for (const dayKey of Object.keys(nextCompletions)) {
                        if (nextCompletions[dayKey]?.[id]) {
                            const d = { ...(nextCompletions[dayKey] || {}) }
                            delete d[id]
                            nextCompletions[dayKey] = d
                        }
                    }

                    return { habits: nextHabits, completionsByDate: nextCompletions }
                })
            },

            // HABITS: toggle "done today"
            toggleHabitToday: (id) => {
                const todayKey = getLocalDateKey()
                set((s) => {
                    const byDate = { ...(s.completionsByDate || {}) }
                    const day = { ...(byDate[todayKey] || {}) }

                    if (day[id]) delete day[id]
                    else day[id] = true

                    byDate[todayKey] = day
                    return { completionsByDate: byDate }
                })
            },

            isHabitDoneToday: (id) => {
                const todayKey = getLocalDateKey()
                const day = get().completionsByDate?.[todayKey] || {}
                return Boolean(day?.[id])
            },

            // TASKS: persistent done flag
            toggleTaskDone: (id) => {
                set((s) => ({
                    habits: (s.habits || []).map((h) =>
                        h.id === id ? { ...h, completed: !Boolean(h.completed) } : h
                    ),
                }))
            },
        }),
        {
            name: 'habits-store-v2',
            version: 2,
            migrate: (state, version) => {
                // migrate older versions safely
                const s = state || {}
                const habits = Array.isArray(s.habits) ? s.habits : []
                const completionsByDate = s.completionsByDate || {}

                // Ensure tasks have "completed" field
                const nextHabits = habits.map((h) => {
                    if ((h.kind || 'habit') === 'task') {
                        return { ...h, completed: Boolean(h.completed) }
                    }
                    return h
                })

                return {
                    ...s,
                    habits: nextHabits,
                    completionsByDate,
                    filter: s.filter || 'all',
                }
            },
        }
    )
)

export default useHabitStore