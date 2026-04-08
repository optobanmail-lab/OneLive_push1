import { create } from 'zustand'

const useUiStore = create((set) => ({
    tasks: [],
    focusMinutes: 0,

    addTask: (title) =>
        set((state) => {
            if (!title.trim()) return state

            return {
                tasks: [
                    ...state.tasks,
                    {
                        id: Date.now(),
                        title: title.trim(),
                        done: false,
                    },
                ],
            }
        }),

    toggleTask: (id) =>
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, done: !task.done } : task
            ),
        })),

    removeTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
        })),

    addFocusMinutes: (minutes) =>
        set((state) => ({
            focusMinutes: state.focusMinutes + minutes,
        })),

    resetAll: () =>
        set({
            tasks: [],
            focusMinutes: 0,
        }),
}))

export default useUiStore