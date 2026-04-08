import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import useUserStore from '../../store/useUserStore'
import { closeTelegramApp } from '../../app/telegram'

function SettingsScreen() {
    const theme = useUserStore((s) => s.user.theme)
    const setTheme = useUserStore((s) => s.setTheme)

    const buttonClass = (value) =>
        `rounded-xl px-4 py-2 text-sm ${
            theme === value ? 'bg-accent text-white' : 'bg-surface2 text-text'
        }`

    return (
        <div className="pt-4">
            <Header title="Настройки" subtitle="Тема, ссылки и управление приложением" />

            <Card className="mb-4">
                <p className="mb-3 text-sm text-muted">Тема</p>

                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setTheme('system')} className={buttonClass('system')}>
                        Системная (Telegram)
                    </button>
                    <button onClick={() => setTheme('dark')} className={buttonClass('dark')}>
                        Тёмная
                    </button>
                    <button onClick={() => setTheme('light')} className={buttonClass('light')}>
                        Светлая
                    </button>
                </div>

                <p className="mt-3 text-xs text-muted">
                    “Системная” берёт цветовую схему из Telegram, если доступно.
                </p>
            </Card>

            <Card className="mb-4">
                <p className="mb-3 text-sm text-muted">Ссылки</p>
                <div className="space-y-2">
                    <a href="#" className="block text-sm text-accent2">Автор</a>
                    <a href="#" className="block text-sm text-accent2">Поддержка</a>
                    <a href="#" className="block text-sm text-accent2">Telegram канал</a>
                </div>
            </Card>

            <button
                onClick={closeTelegramApp}
                className="w-full rounded-2xl bg-danger/15 py-4 font-medium text-danger"
            >
                Закрыть мини-приложение
            </button>
        </div>
    )
}

export default SettingsScreen