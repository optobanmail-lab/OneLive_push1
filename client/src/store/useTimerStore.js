import { create } from 'zustand'

const useTimerStore = create((set) => ({
    mode: 'pomodoro',
    duration: 25 * 60,
    secondsLeft: 25 * 60,
    isRunning: false,

    setMode: (mode) => set({ mode }),

    setDuration: (seconds) =>
        set({
            duration: seconds,
            secondsLeft: seconds,
            isRunning: false,
        }),

    start: () => set({ isRunning: true }),
    pause: () => set({ isRunning: false }),
    reset: () =>
        set((state) => ({
            secondsLeft: state.duration,
            isRunning: false,
        })),

    tick: () =>
        set((state) => {
            if (state.secondsLeft <= 1) {
                return {
                    secondsLeft: 0,
                    isRunning: false,
                }
            }

            return {
                secondsLeft: state.secondsLeft - 1,
            }
        }),
}))
export default useTimerStore