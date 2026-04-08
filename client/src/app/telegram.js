export function getTelegramWebApp() {
    return window.Telegram?.WebApp || null
}

export function initTelegramApp() {
    const tg = getTelegramWebApp()
    if (!tg) return null

    tg.ready()
    tg.expand()

    return tg
}

export function getTelegramUser() {
    const tg = getTelegramWebApp()
    return tg?.initDataUnsafe?.user || null
}

export function getTelegramColorScheme() {
    const tg = getTelegramWebApp()
    return tg?.colorScheme || null // 'dark' | 'light'
}

export function hapticLight() {
    const tg = getTelegramWebApp()
    tg?.HapticFeedback?.impactOccurred?.('light')
}

export function closeTelegramApp() {
    const tg = getTelegramWebApp()
    tg?.close()
}