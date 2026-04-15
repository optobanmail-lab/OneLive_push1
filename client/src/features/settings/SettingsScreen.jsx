import { useMemo } from 'react'
import useSettingsStore from '../../store/useSettingsStore'

function ThemeChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'press rounded-full px-3 py-2 text-xs border border-border-subtle whitespace-nowrap',
                active ? 'bg-accent text-white' : 'bg-surface-elevated/55 text-text',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function InfoRow({ label, value }) {
    return (
        <div className="settings-hero-row">
            <div className="text-xs text-muted">{label}</div>
            <div className="text-sm font-semibold text-text">{value}</div>
        </div>
    )
}

export default function SettingsScreen() {
    const theme = useSettingsStore((s) => s.theme)
    const setTheme = useSettingsStore((s) => s.setTheme)
    const creator = useSettingsStore((s) => s.creator)

    const themeLabel = useMemo(() => {
        if (theme === 'auto') return 'Авто'
        if (theme === 'dark') return 'Тёмная'
        return 'Светлая'
    }, [theme])

    const version = import.meta?.env?.VITE_APP_VERSION || 'dev'

    const closeMiniApp = () => {
        const tg = window.Telegram?.WebApp
        if (tg?.close) tg.close()
        else window.close()
    }

    return (
        <div className="space-y-4">
            <section className="hero-card">
                <div className="text-xs text-muted">Профиль интерфейса</div>

                <div className="mt-2 flex items-end gap-2">
                    <div className="text-[28px] font-bold leading-none text-text">Настройки</div>
                    <div className="pb-1 text-xs text-muted">• {themeLabel}</div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    <ThemeChip active={theme === 'auto'} onClick={() => setTheme('auto')}>Авто</ThemeChip>
                    <ThemeChip active={theme === 'dark'} onClick={() => setTheme('dark')}>Тёмная</ThemeChip>
                    <ThemeChip active={theme === 'light'} onClick={() => setTheme('light')}>Светлая</ThemeChip>
                </div>
            </section>

            <section className="hero-card">
                <div className="text-xs text-muted">О приложении</div>

                <div className="mt-3 grid gap-3">
                    <InfoRow label="Версия" value="2.3.0" />
                    <InfoRow label="Создатель" value="VoidHavend | П3Б" />
                </div>

                <button type="button" onClick={closeMiniApp} className="settings-close-miniapp-btn press">
                    Закрыть мини‑приложение
                </button>

                <div className="mt-3 text-[11px] text-muted/80">
                    Кнопка закрывает WebApp в Telegram.
                </div>
            </section>
        </div>
    )
}