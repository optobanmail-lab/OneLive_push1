import { useEffect, useMemo, useState } from 'react'
import BottomNav from './BottomNav.jsx'

import NotesScreen from '../../features/notes/NotesScreen.jsx'
import LifeScreen from '../../features/life/LifeScreen.jsx'
import HabitsScreen from '../../features/habits/HabitsScreen.jsx'
import TimerScreen from '../../features/timer/TimerScreen.jsx'
import ProfileScreen from '../../features/profile/ProfileScreen.jsx'
import MoreScreen from '../../features/more/MoreScreen.jsx'

import { getTelegramColorScheme, initTelegramApp } from '../../app/telegram.js'
import useSettingsStore from '../../store/useSettingsStore.js'

const BOTTOM_NAV_H = 96

function AppShell() {
    const [activeTab, setActiveTab] = useState('life')

    const theme = useSettingsStore((s) => s.theme)

    useEffect(() => {
        const tg = initTelegramApp()
        document.documentElement.dataset.tg = tg ? '1' : '0'

        if (tg) {
            setTimeout(() => tg.expand(), 50)
            tg.onEvent?.('viewportChanged', () => {
                if (!tg.isExpanded) tg.expand()
            })
        }
    }, [])

    const resolvedTheme = useMemo(() => {
        if (theme === 'light' || theme === 'dark') return theme
        return getTelegramColorScheme() || 'light'
    }, [theme])

    useEffect(() => {
        // root variables = dark by default, а light включается через data-theme='light'
        document.documentElement.dataset.theme = resolvedTheme

        // опционально подкрашиваем панели Telegram
        const tg = window.Telegram?.WebApp
        try {
            if (tg?.setHeaderColor) tg.setHeaderColor(resolvedTheme === 'light' ? '#ffffff' : '#0b0b0d')
            if (tg?.setBottomBarColor) tg.setBottomBarColor(resolvedTheme === 'light' ? '#ffffff' : '#0b0b0d')
        } catch (_) {}
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
        <div className="app-bg min-h-[100dvh]">
            <div
                className="mx-auto max-w-md px-4 tg-safe-top"
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