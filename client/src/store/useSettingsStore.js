import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useSettingsStore = create(
    persist(
        (set, get) => ({
            theme: 'auto', // auto | dark | light
            haptics: true,

            setTheme: (theme) => set({ theme }),
            setHaptics: (haptics) => set({ haptics }),

            // применяем тему к html + Telegram (если доступно)
            applyTheme: () => {
                const theme = get().theme
                const tg = window.Telegram?.WebApp || null

                const tgScheme = tg?.colorScheme // 'dark' | 'light'
                const systemDark =
                    typeof window !== 'undefined' &&
                    window.matchMedia?.('(prefers-color-scheme: dark)')?.matches

                const final =
                    theme === 'auto'
                        ? (tgScheme || (systemDark ? 'dark' : 'light'))
                        : theme

                document.documentElement.dataset.theme = final

                // Опционально: привести хедер/боттом-бар телеги под тему
                // В Telegram WebApp поддерживаются методы setHeaderColor/setBottomBarColor
                try {
                    if (tg?.setHeaderColor) tg.setHeaderColor(final === 'dark' ? '#0b0b0d' : '#ffffff')
                    if (tg?.setBottomBarColor) tg.setBottomBarColor(final === 'dark' ? '#0b0b0d' : '#ffffff')
                } catch (_) {}
            },
        }),
        { name: 'settings-store-v1' }
    )
)

export default useSettingsStore