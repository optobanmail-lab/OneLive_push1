import { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import useTimerStore from '../../store/useTimerStore'
import { hapticLight } from '../../app/telegram'

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n))
}

function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds))
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
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

function CircularTimePicker({
                                valueSeconds,
                                onChangeSeconds,
                                disabled = false,
                                minSeconds = 5 * 60,
                                maxSeconds = 180 * 60,
                                stepSeconds = 60,
                                progress01 = null, // если передать — рисуем прогресс выполнения
                            }) {
    const wrapRef = useRef(null)
    const [dragging, setDragging] = useState(false)

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
        setDragging(true)
        e.currentTarget.setPointerCapture?.(e.pointerId)
        handlePointer(e.clientX, e.clientY)
    }

    const onPointerMove = (e) => {
        if (!dragging || disabled) return
        handlePointer(e.clientX, e.clientY)
    }

    const onPointerUp = () => {
        if (!dragging) return
        setDragging(false)
    }

    // SVG arc helpers
    const size = 280
    const stroke = 14
    const r = (size - stroke) / 2
    const c = size / 2
    const circ = 2 * Math.PI * r

    const selectedRatio = clamp(
        (valueSeconds - minSeconds) / (maxSeconds - minSeconds || 1),
        0,
        1
    )

    const dashSelected = circ * selectedRatio
    const dashRest = circ - dashSelected

    const doneRatio =
        progress01 == null ? null : clamp(progress01, 0, 1)

    const dashDone = doneRatio == null ? 0 : circ * doneRatio
    const dashDoneRest = doneRatio == null ? circ : circ - dashDone

    // knob position
    const rad = ((angle - 90) * Math.PI) / 180
    const knobX = c + r * Math.cos(rad)
    const knobY = c + r * Math.sin(rad)

    return (
        <div className="flex items-center justify-center">
            <div
                ref={wrapRef}
                className="relative select-none"
                style={{ width: size, height: size }}
            >
                <svg
                    width={size}
                    height={size}
                    className="touch-none"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                >
                    {/* base ring */}
                    <circle
                        cx={c}
                        cy={c}
                        r={r}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={stroke}
                        fill="none"
                    />

                    {/* selected ring (когда НЕ идёт таймер) */}
                    {doneRatio == null ? (
                        <circle
                            cx={c}
                            cy={c}
                            r={r}
                            stroke="rgba(94,161,255,0.85)"   /* accent2 */
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${dashSelected} ${dashRest}`}
                            transform={`rotate(-90 ${c} ${c})`}
                            style={{
                                transition: dragging ? 'none' : 'stroke-dasharray 150ms ease-out',
                            }}
                        />
                    ) : (
                        <>
                            {/* progress ring (когда идёт таймер) */}
                            <circle
                                cx={c}
                                cy={c}
                                r={r}
                                stroke="rgba(94,161,255,0.85)"
                                strokeWidth={stroke}
                                strokeLinecap="round"
                                fill="none"
                                strokeDasharray={`${dashDone} ${dashDoneRest}`}
                                transform={`rotate(-90 ${c} ${c})`}
                            />
                        </>
                    )}

                    {/* knob */}
                    <circle
                        cx={knobX}
                        cy={knobY}
                        r="10"
                        fill="rgba(94,161,255,1)"
                        style={{
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.35))',
                            transition: dragging ? 'none' : 'cx 150ms ease-out, cy 150ms ease-out',
                        }}
                    />
                    <circle
                        cx={knobX}
                        cy={knobY}
                        r="18"
                        fill="rgba(94,161,255,0.12)"
                    />
                </svg>

                {/* center content */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-semibold tracking-tight text-text">
                        {formatTime(valueSeconds)}
                    </div>
                    <div className="mt-2 text-xs text-muted">
                        Потяни по кругу, чтобы выбрать время
                    </div>
                </div>

                {/* overlay to make it feel like glass */}
                <div className="pointer-events-none absolute inset-6 rounded-full bg-white/5 blur-2xl opacity-50" />
            </div>
        </div>
    )
}

function TimerScreen() {
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

    // ticking
    useEffect(() => {
        if (!isRunning) return
        const id = setInterval(() => tick(), 1000)
        return () => clearInterval(id)
    }, [isRunning, tick])

    // finish alert
    useEffect(() => {
        if (secondsLeft !== 0) return
        if (!duration) return
        // простой фидбек внутри мини-аппа
        const tg = window.Telegram?.WebApp
        tg?.HapticFeedback?.notificationOccurred?.('success')
        tg?.showAlert?.('Таймер завершён')
    }, [secondsLeft, duration])

    const progress01 = useMemo(() => {
        if (!isRunning || duration <= 0) return null
        return 1 - secondsLeft / duration
    }, [isRunning, duration, secondsLeft])

    const setPomodoro = () => {
        setMode('pomodoro')
        setDuration(25 * 60)
        hapticLight()
    }

    const setCustom = () => {
        setMode('custom')
        hapticLight()
    }

    return (
        <div className="pt-4">
            <Header
                title="Таймер"
                subtitle="Выбирай время вращением по кругу — как нативно"
            />

            <div className="mb-3 flex gap-2">
                <button
                    type="button"
                    onClick={setPomodoro}
                    className={`press rounded-full px-4 py-2 text-sm ${
                        mode === 'pomodoro' ? 'bg-accent text-white' : 'bg-white/5 text-text'
                    }`}
                >
                    Pomodoro 25
                </button>

                <button
                    type="button"
                    onClick={setCustom}
                    className={`press rounded-full px-4 py-2 text-sm ${
                        mode === 'custom' ? 'bg-accent text-white' : 'bg-white/5 text-text'
                    }`}
                >
                    Свой таймер
                </button>
            </div>

            <Card className="mb-4">
                {mode === 'pomodoro' ? (
                    <div className="py-6 text-center">
                        <div className="text-6xl font-semibold tracking-tight">{formatTime(secondsLeft)}</div>
                        <p className="mt-2 text-sm text-muted">Pomodoro фиксированный</p>
                    </div>
                ) : (
                    <div className="py-4">
                        <CircularTimePicker
                            valueSeconds={isRunning ? secondsLeft : duration}
                            onChangeSeconds={(sec) => {
                                if (isRunning) return
                                setDuration(sec)
                            }}
                            disabled={isRunning}
                            minSeconds={5 * 60}
                            maxSeconds={180 * 60}
                            stepSeconds={60}
                            progress01={progress01}
                        />

                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {[
                                { label: '10m', sec: 10 * 60 },
                                { label: '25m', sec: 25 * 60 },
                                { label: '45m', sec: 45 * 60 },
                                { label: '60m', sec: 60 * 60 },
                                { label: '90m', sec: 90 * 60 },
                            ].map((p) => (
                                <button
                                    key={p.label}
                                    type="button"
                                    onClick={() => {
                                        if (isRunning) return
                                        setDuration(p.sec)
                                        hapticLight()
                                    }}
                                    className="press rounded-full bg-white/5 px-3 py-2 text-xs text-text"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {isRunning ? (
                            <p className="mt-3 text-center text-xs text-muted">
                                Во время работы таймера менять длительность нельзя
                            </p>
                        ) : null}
                    </div>
                )}
            </Card>

            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => {
                        start()
                        hapticLight()
                    }}
                    className="press rounded-2xl bg-accent py-3 font-medium text-white"
                >
                    Старт
                </button>

                <button
                    type="button"
                    onClick={() => {
                        pause()
                        hapticLight()
                    }}
                    className="press rounded-2xl bg-white/5 py-3 font-medium text-text"
                >
                    Пауза
                </button>

                <button
                    type="button"
                    onClick={() => {
                        reset()
                        hapticLight()
                    }}
                    className="press rounded-2xl bg-white/5 py-3 font-medium text-text"
                >
                    Сброс
                </button>
            </div>
        </div>
    )
}

export default TimerScreen