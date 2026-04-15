export function isTelegramEnv() {
    const ua = navigator.userAgent || ''
    return /Telegram/i.test(ua) || typeof window.TelegramWebviewProxy !== 'undefined'
}

export function getTelegramWebApp() {
    if (!isTelegramEnv()) return null
    return window.Telegram?.WebApp || null
}

export function initTelegramApp() {
    const tg = window.Telegram?.WebApp
    if (!tg) return null

    tg.ready()

    // раскрыть на весь экран (то, что ты хочешь)
    tg.expand()

    // чтобы свайп вниз не сворачивал обратно (по желанию)
    tg.disableVerticalSwipes?.()

    // если поддерживается (не везде): настоящий fullscreen
    tg.requestFullscreen?.()

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