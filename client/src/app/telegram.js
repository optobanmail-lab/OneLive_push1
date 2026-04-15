export function isTelegramEnv() {
    const ua = navigator.userAgent || ''
    return /Telegram/i.test(ua) || typeof window.TelegramWebviewProxy !== 'undefined'
}

export function getTelegramWebApp() {
    if (!isTelegramEnv()) return null
    return window.Telegram?.WebApp || null
}

export function initTelegramApp() {
    const tg = getTelegramWebApp()

    // для стилей (blur только в tg)
    document.documentElement.dataset.tg = tg ? '1' : '0'

    if (!tg) return null

    try {
        tg.ready()

        // просим раскрыть webapp на максимум
        tg.expand()
        setTimeout(() => tg.expand(), 150)

        // чтобы не “съезжало” свайпом вниз (доступно не во всех версиях)
        tg.disableVerticalSwipes?.()

        // если Telegram меняет высоту — снова expand
        const onViewport = () => {
            if (!tg.isExpanded) tg.expand()
        }
        tg.onEvent?.('viewportChanged', onViewport)
    } catch {
        // ignore
    }

    return tg
}

export function getTelegramUser() {
    const tg = getTelegramWebApp()
    return tg?.initDataUnsafe?.user || null
}

export function getTelegramColorScheme() {
    const tg = getTelegramWebApp()
    return tg?.colorScheme || null
}

export function hapticLight() {
    const tg = getTelegramWebApp()
    try {
        tg?.HapticFeedback?.impactOccurred?.('light')
    } catch {}
}

export function closeTelegramApp() {
    const tg = getTelegramWebApp()
    try {
        tg?.close()
    } catch {}
}