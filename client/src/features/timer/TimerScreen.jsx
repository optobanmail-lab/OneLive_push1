import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import useTimerStore from '../../store/useTimerStore'
import useUiStore from '../../store/useUiStore.js'
import { hapticLight, getTelegramWebApp } from '../../app/telegram'
import Header from '../../components/layout/Header'

const NAV_CLEARANCE_PX = 92

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}
function pad2(n) {
    return String(n).padStart(2, '0')
}

function formatHumanHM(seconds) {
    const s = Math.max(0, Math.floor(seconds))
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h <= 0) return { main: `${m}:${pad2(sec)}`, sub: 'мин:сек' }
    return { main: `${h}ч ${pad2(m)}м`, sub: `${pad2(sec)}с` }
}

function formatPresetLabelMinutes(mins) {
    if (mins < 60) return `${mins} мин`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (m === 0) return `${h} ч`
    return `${h} ч ${m} мин`
}

// 0° = top, clockwise
function pointToAngleDeg(x, y, cx, cy) {
    const dx = x - cx
    const dy = y - cy
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    if (deg < 0) deg += 360
    return deg
}
function secondsToAngleDeg(seconds, minSeconds, maxSeconds) {
    const t = clamp(seconds, minSeconds, maxSeconds)
    const ratio = (t - minSeconds) / (maxSeconds - minSeconds || 1)
    return ratio * 360
}
function angleDegToSeconds(angleDeg, minSeconds, maxSeconds, stepSeconds) {
    const ratio = clamp(angleDeg, 0, 360) / 360
    const raw = minSeconds + ratio * (maxSeconds - minSeconds)
    const snapped = Math.round(raw / stepSeconds) * stepSeconds
    return clamp(snapped, minSeconds, maxSeconds)
}

function Chip({ active, onClick, children }) {
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

function PrimaryBtn({ onClick, children, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                'press rounded-2xl px-4 py-3 text-sm font-semibold',
                disabled
                    ? 'bg-surface-elevated/50 text-muted border border-border-subtle'
                    : 'bg-accent text-white',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function GlassBtn({ onClick, children, disabled = false }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={[
                'press rounded-2xl px-4 py-3 text-sm font-semibold border border-border-subtle',
                disabled ? 'bg-surface-elevated/40 text-muted' : 'bg-surface/75 text-text',
            ].join(' ')}
        >
            {children}
        </button>
    )
}

function PresetRowCompact({ title, subtitle, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={active ? 'panel-row panel-row-active' : 'panel-row'}
            style={{ paddingTop: 10, paddingBottom: 10 }}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className={['text-sm font-semibold leading-none truncate', active ? 'text-white' : 'text-text'].join(' ')}>
                        {title}
                    </div>
                    <div className={['mt-1 text-[11px]', active ? 'text-white/80' : 'text-muted'].join(' ')}>
                        {subtitle}
                    </div>
                </div>
                <div className={active ? 'text-white/90 text-sm font-semibold' : 'text-muted'}>
                    {active ? '✓' : ''}
                </div>
            </div>
        </button>
    )
}

/** ВАЖНО: без translate-анимаций, чтобы iOS/Telegram нормально скроллил список */
function Scene({ active, children }) {
    return (
        <div
            className={[
                'absolute inset-0 transition-opacity duration-200 ease-out',
                active ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
        >
            {children}
        </div>
    )
}

function CircularTimePicker({
                                valueSeconds,
                                onChangeSeconds,
                                disabled = false,
                                minSeconds = 5 * 60,
                                maxSeconds = 180 * 60,
                                stepSeconds = 60,
                                progress01 = null,
                            }) {
    const wrapRef = useRef(null)
    const [dragging, setDragging] = useState(false)
    const [size, setSize] = useState(248)

    useLayoutEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth
            const next = clamp(w - 24, 210, 288)
            setSize(next)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        if (!dragging) return
        const prevOverflow = document.body.style.overflow
        const prevOverscroll = document.body.style.overscrollBehavior
        document.body.style.overflow = 'hidden'
        document.body.style.overscrollBehavior = 'none'
        const prevent = (e) => e.preventDefault()
        window.addEventListener('touchmove', prevent, { passive: false })
        return () => {
            document.body.style.overflow = prevOverflow
            document.body.style.overscrollBehavior = prevOverscroll
            window.removeEventListener('touchmove', prevent)
        }
    }, [dragging])

    const angle = useMemo(
        () => secondsToAngleDeg(valueSeconds, minSeconds, maxSeconds),
        [valueSeconds, minSeconds, maxSeconds]
    )

    const handlePointer = (clientX, clientY) => {
        const el = wrapRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const deg = pointToAngleDeg(clientX, clientY, cx, cy)
        const next = angleDegToSeconds(deg, minSeconds, maxSeconds, stepSeconds)
        onChangeSeconds(next)
    }

    const onPointerDown = (e) => {
        if (disabled) return
        e.preventDefault()
        setDragging(true)
        e.currentTarget.setPointerCapture?.(e.pointerId)
        handlePointer(e.clientX, e.clientY)
    }
    const onPointerMove = (e) => {
        if (!dragging || disabled) return
        e.preventDefault()
        handlePointer(e.clientX, e.clientY)
    }
    const onPointerUp = (e) => {
        if (!dragging) return
        e.preventDefault()
        setDragging(false)
    }

    const stroke = 14
    const knobOuter = 18
    const safe = knobOuter + 2

    const r = size / 2 - stroke / 2 - safe
    const c = size / 2
    const circ = 2 * Math.PI * r

    const selectedRatio = clamp(
        (valueSeconds - minSeconds) / (maxSeconds - minSeconds || 1),
        0,
        1
    )
    const dashSelected = circ * selectedRatio
    const dashRest = circ - dashSelected

    const doneRatio = progress01 == null ? null : clamp(progress01, 0, 1)
    const dashDone = doneRatio == null ? 0 : circ * doneRatio
    const dashDoneRest = doneRatio == null ? circ : circ - dashDone

    const rad = ((angle - 90) * Math.PI) / 180
    const knobX = c + r * Math.cos(rad)
    const knobY = c + r * Math.sin(rad)

    const accent = 'rgb(var(--accent-glow) / 0.92)'
    const track = 'rgb(var(--divider))'
    const label = formatHumanHM(valueSeconds)

    return (
        <div ref={wrapRef} className="w-full">
            <div className="mx-auto relative select-none" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    style={{ touchAction: 'none' }}
                    className="touch-none"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    <circle cx={c} cy={c} r={r} stroke={track} strokeWidth={stroke} fill="none" />

                    {doneRatio == null ? (
                        <circle
                            cx={c}
                            cy={c}
                            r={r}
                            stroke={accent}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${dashSelected} ${dashRest}`}
                            transform={`rotate(-90 ${c} ${c})`}
                            style={{ transition: dragging ? 'none' : 'stroke-dasharray 140ms ease-out' }}
                        />
                    ) : (
                        <circle
                            cx={c}
                            cy={c}
                            r={r}
                            stroke={accent}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${dashDone} ${dashDoneRest}`}
                            transform={`rotate(-90 ${c} ${c})`}
                        />
                    )}

                    <circle cx={knobX} cy={knobY} r="10" fill={'rgb(var(--accent-glow))'} />
                    <circle cx={knobX} cy={knobY} r={knobOuter} fill={'rgb(var(--accent-glow) / 0.10)'} />
                </svg>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="brand-time text-5xl font-semibold tracking-tight">{label.main}</div>
                    <div className="mt-2 text-xs text-muted">{label.sub}</div>
                </div>
            </div>
        </div>
    )
}

export default function TimerScreen() {
    const focusMinutes = useUiStore((s) => s.focusMinutes)

    const mode = useTimerStore((s) => s.mode)
    const duration = useTimerStore((s) => s.duration)
    const secondsLeft = useTimerStore((s) => s.secondsLeft)
    const isRunning = useTimerStore((s) => s.isRunning)

    const setMode = useTimerStore((s) => s.setMode)
    const setDuration = useTimerStore((s) => s.setDuration)

    const start = useTimerStore((s) => s.start)
    const pause = useTimerStore((s) => s.pause)
    const reset = useTimerStore((s) => s.reset)
    const tick = useTimerStore((s) => s.tick)

    const [panel, setPanel] = useState('none') // none | templates | custom

    // no page scroll on timer screen
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = prev
        }
    }, [])

    // default Pomodoro on enter
    useEffect(() => {
        if (isRunning) return
        setMode('pomodoro')
        setDuration(25 * 60)
        setPanel('none')
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        const tg = getTelegramWebApp?.() || null
        tg?.expand?.()
    }, [])

    useEffect(() => {
        if (!isRunning) return
        const id = setInterval(() => tick(), 1000)
        return () => clearInterval(id)
    }, [isRunning, tick])

    const progress01 = useMemo(() => {
        if (!isRunning || duration <= 0) return null
        return 1 - secondsLeft / duration
    }, [isRunning, duration, secondsLeft])

    const heroSeconds = mode === 'custom' ? (isRunning ? secondsLeft : duration) : secondsLeft
    const heroLabel = formatHumanHM(heroSeconds)

    const presetsCompact = [
        { mins: 5, name: 'Быстро' },
        { mins: 10, name: 'Разогрев' },
        { mins: 15, name: 'Коротко' },
        { mins: 25, name: 'Pomodoro' },
        { mins: 30, name: 'Сессия' },
        { mins: 45, name: 'Глубоко' },
    ]

    const choosePreset = (mins) => {
        setMode('custom')
        setDuration(mins * 60)
        hapticLight()
    }

    const setPomodoro = () => {
        setMode('pomodoro')
        setDuration(25 * 60)
        setPanel('none')
        hapticLight()
    }

    const openTemplates = () => {
        setPanel((p) => (p === 'templates' ? 'none' : 'templates')) // toggle
        hapticLight()
    }

    const openCustom = () => {
        setMode('custom')
        setPanel((p) => (p === 'custom' ? 'none' : 'custom')) // toggle
        hapticLight()
    }

    // fixed actions above BottomNav
    const bottomOffset = NAV_CLEARANCE_PX + 12
    const actionsFixedBottom = `calc(${bottomOffset}px + env(safe-area-inset-bottom))`

    // compute height from panel top to actions top; animate to it
    const panelWrapRef = useRef(null)
    const actionsRef = useRef(null)
    const [panelH, setPanelH] = useState(0)

    const recomputeTargetH = () => {
        const wrapTop = panelWrapRef.current?.getBoundingClientRect().top
        const actionsTop = actionsRef.current?.getBoundingClientRect().top
        if (wrapTop == null || actionsTop == null) return
        const next = actionsTop - wrapTop - 12
        setPanelH(clamp(next, 140, 560))
    }

    useEffect(() => {
        if (panel === 'none') {
            setPanelH(0)
            return
        }
        setPanelH(0)
        requestAnimationFrame(() => requestAnimationFrame(recomputeTargetH))
    }, [panel])

    useEffect(() => {
        const vv = window.visualViewport
        vv?.addEventListener('resize', recomputeTargetH)
        window.addEventListener('resize', recomputeTargetH)
        return () => {
            vv?.removeEventListener('resize', recomputeTargetH)
            window.removeEventListener('resize', recomputeTargetH)
        }
    }, [])

    const panelOpen = panel !== 'none'

    return (
        <div className="space-y-4" style={{ paddingBottom: `calc(${bottomOffset}px + 76px + env(safe-area-inset-bottom))` }}>
            <Header title="Таймер" />

            <section className="hero-card">
                <div className="text-xs text-muted">{isRunning ? 'Сессия идёт' : 'Готов к старту'}</div>

                <div className="mt-2 flex items-end gap-2">
                    <div className="brand-time text-[44px] font-bold leading-none tracking-tight">
                        {heroLabel.main}
                    </div>
                    <div className="pb-1 text-xs text-muted">
                        {mode === 'pomodoro' ? 'Pomodoro' : heroLabel.sub}
                    </div>
                </div>

                <div className="mt-1 text-xs text-muted">
                    длительность: {formatHumanHM(duration).main} • фокус: {focusMinutes}m
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar">
                    <Chip active={mode === 'pomodoro'} onClick={setPomodoro}>Pomodoro 25</Chip>
                    <Chip active={panel === 'custom'} onClick={openCustom}>Свой таймер</Chip>
                    <Chip active={panel === 'templates'} onClick={openTemplates}>Шаблоны</Chip>
                </div>
            </section>

            {/* Expandable panel with scrollable list */}
            <div
                ref={panelWrapRef}
                className={[
                    'relative overflow-hidden transition-[height,opacity] duration-200 ease-out',
                    panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                ].join(' ')}
                style={{ height: panelOpen ? panelH : 0, willChange: 'height' }}
            >
                <div className="absolute inset-0">
                    <Scene active={panel === 'templates'}>
                        <section className="panel-card relative h-full flex flex-col overflow-hidden">
                            <div className="relative mb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-semibold text-text">Шаблоны</div>
                                    <div className="mt-1 text-xs text-muted">скролл внутри</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={openCustom}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    К кругу
                                </button>
                            </div>

                            {/* IMPORTANT: scroll container */}
                            <div
                                className="flex-1 min-h-0 overflow-y-auto hide-scrollbar space-y-2 pr-1 pb-2"
                                style={{
                                    WebkitOverflowScrolling: 'touch',
                                    overscrollBehavior: 'contain',
                                    touchAction: 'pan-y',
                                }}
                                onTouchMove={(e) => e.stopPropagation()}
                            >
                                {presetsCompact.map((p) => {
                                    const active = duration === p.mins * 60
                                    return (
                                        <PresetRowCompact
                                            key={p.mins}
                                            title={formatPresetLabelMinutes(p.mins)}
                                            subtitle={p.name}
                                            active={active}
                                            onClick={() => choosePreset(p.mins)}
                                        />
                                    )
                                })}
                            </div>
                        </section>
                    </Scene>

                    <Scene active={panel === 'custom'}>
                        <section className="panel-card relative h-full flex flex-col overflow-hidden">
                            <div className="relative mb-3 flex items-center justify-between">
                                <div className="text-sm font-semibold text-text">Свой таймер</div>
                                <button
                                    type="button"
                                    onClick={openTemplates}
                                    className="press rounded-full px-3 py-2 text-xs border border-border-subtle bg-surface/75 text-text"
                                >
                                    Шаблоны
                                </button>
                            </div>

                            <div className="flex-1 min-h-0 overflow-hidden">
                                <CircularTimePicker
                                    valueSeconds={isRunning ? secondsLeft : duration}
                                    onChangeSeconds={(sec) => {
                                        if (isRunning) return
                                        setMode('custom')
                                        setDuration(sec)
                                    }}
                                    disabled={isRunning}
                                    minSeconds={5 * 60}
                                    maxSeconds={180 * 60}
                                    stepSeconds={60}
                                    progress01={progress01}
                                />
                            </div>
                        </section>
                    </Scene>
                </div>
            </div>

            {/* Fixed actions above BottomNav */}
            <div
                ref={actionsRef}
                className="fixed left-0 right-0 z-[120] px-4"
                style={{ bottom: actionsFixedBottom }}
            >
                <div className="mx-auto max-w-md grid grid-cols-3 gap-3">
                    <PrimaryBtn onClick={() => { start(); hapticLight() }} disabled={isRunning}>
                        Старт
                    </PrimaryBtn>
                    <GlassBtn onClick={() => { pause(); hapticLight() }} disabled={!isRunning}>
                        Стоп
                    </GlassBtn>
                    <GlassBtn onClick={() => { reset(); hapticLight() }}>
                        Сброс
                    </GlassBtn>
                </div>
            </div>

            <div className="h-2" />
        </div>
    )
}