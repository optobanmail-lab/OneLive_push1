import { useEffect, useMemo, useState } from 'react'
import BottomNav from './BottomNav.jsx'

import NotesScreen from '../../features/notes/NotesScreen.jsx'
import LifeScreen from '../../features/life/LifeScreen.jsx'
import HabitsScreen from '../../features/habits/HabitsScreen.jsx'
import TimerScreen from '../../features/timer/TimerScreen.jsx'
import ProfileScreen from '../../features/profile/ProfileScreen.jsx'
import MoreScreen from '../../features/more/MoreScreen.jsx'

import { getTelegramColorScheme, initTelegramApp } from '../../app/telegram.js'
import useUserStore from '../../store/useUserStore.js'

const BOTTOM_NAV_H = 96

function AppShell() {
    const [activeTab, setActiveTab] = useState('life')
    const theme = useUserStore((s) => s.user.theme)

    useEffect(() => {
        const tg = initTelegramApp()
        document.documentElement.dataset.tg = tg ? '1' : '0'
    }, [])

    const resolvedTheme = useMemo(() => {
        if (theme === 'dark' || theme === 'light') return theme
        return getTelegramColorScheme() || 'light'
    }, [theme])

    useEffect(() => {
        document.documentElement.dataset.theme = resolvedTheme
    }, [resolvedTheme])

    const renderScreen = () => {
        switch (activeTab) {
            case 'habits':
                return <HabitsScreen />
            case 'timer':
                return <TimerScreen />
            case 'profile':
                return <ProfileScreen />
            case 'notes':
                return <NotesScreen />
            case 'settings':
                return <MoreScreen />
            case 'life':
            default:
                return <LifeScreen />
        }
    }

    return (
        <div
            className="app-bg"
            style={{ minHeight: 'var(--tg-viewport-height, 100dvh)' }}
        >
            <div
                className="mx-auto max-w-md px-4 tg-safe-top pt-1"
                style={{
                    paddingBottom: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom))`,
                }}
            >
                {renderScreen()}
            </div>

            <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        </div>
    )
}

export default AppShell