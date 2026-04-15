import { useEffect } from 'react'
import Header from '../../components/layout/Header'
import SettingsScreen from '../settings/SettingsScreen'
import useSettingsStore from '../../store/useSettingsStore'

export default function MoreScreen() {
    const applyTheme = useSettingsStore((s) => s.applyTheme)

    useEffect(() => {
        applyTheme()
    }, [applyTheme])

    return (
        <div className="space-y-4">
            <Header title="Настройки" />
            <SettingsScreen />
        </div>
    )
}