export function getTelegramWebApp() {
    return window.Telegram?.WebApp || null
}

export function getTelegramUser() {
    const tg = getTelegramWebApp()
    return tg?.initDataUnsafe?.user || null
}

export function getTelegramColorScheme() {
    const tg = getTelegramWebApp()
    return tg?.colorScheme || null
}

function safeCall(fn) {
    try {
        return fn()
    } catch (e) {
        console.warn('[tg] method failed:', e?.message || e)
        return null
    }
}

function applyViewportVars(tg) {
    if (!tg) return
    // Telegram рекомендует обновлять viewportHeight в CSS-переменную
    const h = tg.viewportHeight
    if (h) document.documentElement.style.setProperty('--tg-viewport-height', `${h}px`)
}

export function initTelegramApp() {
    const tg = getTelegramWebApp()
    if (!tg) {
        document.documentElement.dataset.tg = '0'
        return null
    }

    document.documentElement.dataset.tg = '1'

    safeCall(() => tg.ready())
    safeCall(() => tg.expand())

    // выставим высоту сразу
    applyViewportVars(tg)

    // и обновляем при изменениях (клавиатура, сворачивание, и т.д.)
    safeCall(() =>
        tg.onEvent?.('viewportChanged', () => {
            applyViewportVars(tg)
            if (!tg.isExpanded) safeCall(() => tg.expand())
        })
    )

    // НЕ вызываем requestFullscreen/disableVerticalSwipes — на v6.0 они могут кидать ошибку
    return tg
}

export function hapticLight() {
    const tg = getTelegramWebApp()
    safeCall(() => tg?.HapticFeedback?.impactOccurred?.('light'))
}