import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTelegramUser } from '../app/telegram'

const telegramUser = getTelegramUser()

const useUserStore = create(
    persist(
        (set) => ({
            user: {
                username: telegramUser?.username || 'guest',
                firstName: telegramUser?.first_name || 'Guest',
                avatar: telegramUser?.photo_url || '',
                age: '',
                theme: 'system',
            },

            setAge: (age) =>
                set((state) => ({
                    user: { ...state.user, age },
                })),

            setTheme: (theme) =>
                set((state) => ({
                    user: { ...state.user, theme },
                })),

            setAvatar: (avatar) =>
                set((state) => ({
                    user: { ...state.user, avatar },
                })),
        }),
        {
            name: 'one-live-user',
            version: 2,
        }
    )
)

export default useUserStore   // ←←← ЭТО САМАЯ ВАЖНАЯ СТРОКА