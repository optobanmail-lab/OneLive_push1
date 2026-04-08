import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function getLocalDateKey(d = new Date()) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const useHabitStore = create(
    persist(
        (set, get) => ({
            habits: [],
            filter: 'all', // all | active | done

            // { '2026-04-08': { '123': true, '456': true } }
            completionsByDate: {},

            addHabit: (payload) =>
                set((state) => {
                    const data =
                        typeof payload === 'string'
                            ? { title: payload }
                            : (payload || {})

                    const title = (data.title || '').trim()
                    if (!title) return state

                    return {
                        habits: [
                            ...state.habits,
                            {
                                id: String(Date.now()),
                                kind: data.kind || 'habit',          // 'habit' | 'task'
                                title,
                                comment: data.comment || '',
                                reminderTime: data.reminderTime || '',
                                tag: data.tag || '',
                                archived: false,
                                createdAt: new Date().toISOString(),
                            },
                        ],
                    }
                }),

            editHabit: (id, newTitle) =>
                set((state) => ({
                    habits: state.habits.map((h) =>
                        h.id === id ? { ...h, title: newTitle } : h
                    ),
                })),

            deleteHabit: (id) =>
                set((state) => {
                    // удаляем привычку
                    const habits = state.habits.filter((h) => h.id !== id)

                    // чистим отметки по дням
                    const completionsByDate = { ...state.completionsByDate }
                    for (const dateKey of Object.keys(completionsByDate)) {
                        if (completionsByDate[dateKey]?.[id]) {
                            const copy = { ...completionsByDate[dateKey] }
                            delete copy[id]
                            completionsByDate[dateKey] = copy
                        }
                    }

                    return { habits, completionsByDate }
                }),

            toggleHabitToday: (id) =>
                set((state) => {
                    const dateKey = getLocalDateKey()
                    const day = state.completionsByDate[dateKey] || {}
                    const isDone = !!day[id]

                    const nextDay = { ...day }
                    if (isDone) delete nextDay[id]
                    else nextDay[id] = true

                    return {
                        completionsByDate: {
                            ...state.completionsByDate,
                            [dateKey]: nextDay,
                        },
                    }
                }),

            setFilter: (filter) => set({ filter }),

            // селекторы/хелперы
            isHabitDoneToday: (id) => {
                const dateKey = getLocalDateKey()
                const day = get().completionsByDate?.[dateKey] || {}
                return !!day[id]
            },

            getTodayStats: () => {
                const dateKey = getLocalDateKey()
                const activeHabits = get().habits.filter((h) => !h.archived)
                const day = get().completionsByDate?.[dateKey] || {}
                const done = activeHabits.filter((h) => !!day[h.id]).length
                return { total: activeHabits.length, done }
            },

            getRhythm28Days: () => {
                const activeHabits = get().habits.filter((h) => !h.archived)
                const total = activeHabits.length

                const out = []
                for (let i = 27; i >= 0; i--) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    const key = getLocalDateKey(d)
                    const day = get().completionsByDate?.[key] || {}
                    const done = activeHabits.filter((h) => !!day[h.id]).length
                    out.push({ key, done, total })
                }
                return out
            },
        }),
        {
            name: 'one-live-habits',
            version: 2,
            migrate: (state) => {
                const s = state || {}
                return {
                    habits: Array.isArray(s.habits) ? s.habits : [],
                    filter: s.filter ?? 'all',
                    completionsByDate: s.completionsByDate ?? {},
                }
            },
        }
    )
)

export default useHabitStore