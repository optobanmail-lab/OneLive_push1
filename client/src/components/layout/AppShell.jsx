import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import BottomNav from './BottomNav.jsx'

import NotesScreen from '../../features/notes/NotesScreen.jsx'

import LifeScreen from '../../features/life/LifeScreen.jsx'
import HabitsScreen from '../../features/habits/HabitsScreen.jsx'
import TimerScreen from '../../features/timer/TimerScreen.jsx'
import ProfileScreen from '../../features/profile/ProfileScreen.jsx'
import SettingsScreen from '../../features/settings/SettingsScreen.jsx'

import MoreScreen from '../../features/more/MoreScreen.jsx'

import { getTelegramColorScheme, initTelegramApp } from '../../app/telegram.js'
import useUserStore from '../../store/useUserStore.js'

function AppShell() {
    const [activeTab, setActiveTab] = useState('life')
    const theme = useUserStore((s) => s.user.theme)

    useEffect(() => {
        initTelegramApp()
    }, [])

    const resolvedTheme = useMemo(() => {
        if (theme === 'dark' || theme === 'light') return theme
        return getTelegramColorScheme() || 'dark'
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
        <div className="mx-auto min-h-screen max-w-md bg-bg px-4 pb-[calc(96px+env(safe-area-inset-bottom))]">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    {renderScreen()}
                </motion.div>
            </AnimatePresence>

            <BottomNav activeTab={activeTab} onChange={setActiveTab} />
        </div>
    )
}

export default AppShell