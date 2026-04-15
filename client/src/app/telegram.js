export function getTelegramWebApp() {
    return window.Telegram?.WebApp || null
}

export function getTelegramUser() {
    // Важно: initDataUnsafe нельзя “доверять” для безопасности,
    // но для курсового/локального хранения это норм.
    const tg = getTelegramWebApp()
    return tg?.initDataUnsafe?.user || null
}

export function getTelegramColorScheme() {
    const tg = getTelegramWebApp()
    return tg?.colorScheme || null // 'light' | 'dark' | null
}

function safeCall(fn) {
    try {
        return fn()
    } catch (e) {
        console.warn('[tg] method failed:', e?.message || e)
        return null
    }
}

export function initTelegramApp() {
    const tg = getTelegramWebApp()
    if (!tg) return null

    safeCall(() => tg.ready())
    safeCall(() => tg.expand())

    // На версии 6.0 requestFullscreen / disableVerticalSwipes могут быть unsupported.
    // Важно не падать:
    safeCall(() => tg.disableVerticalSwipes?.())
    // safeCall(() => tg.requestFullscreen?.()) // НЕ надо: может бросать ошибку

    return tg
}

export function hapticLight() {
    const tg = getTelegramWebApp()
    safeCall(() => tg?.HapticFeedback?.impactOccurred?.('light'))
}