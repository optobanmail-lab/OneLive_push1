import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LiquidButton({
                                         onHoldComplete,
                                         duration = 1500,
                                         label = "Удержать",
                                         completed = false
                                     }) {
    const [isHolding, setIsHolding] = useState(false)
    const [progress, setProgress] = useState(0)
    const timerRef = useRef(null)
    const startTimeRef = useRef(null)

    const handleStart = () => {
        if (completed) return
        setIsHolding(true)
        startTimeRef.current = Date.now()

        const loop = () => {
            const elapsed = Date.now() - startTimeRef.current
            const currentProgress = Math.min((elapsed / duration) * 100, 100)

            setProgress(currentProgress)

            if (currentProgress < 100) {
                requestAnimationFrame(loop)
            } else {
                setIsHolding(false)
                setProgress(0)
                onHoldComplete?.()
            }
        }
        requestAnimationFrame(loop)
    }

    const handleCancel = () => {
        setIsHolding(false)
        setProgress(0)
    }

    return (
        <button
            onMouseDown={handleStart}
            onMouseUp={handleCancel}
            onMouseLeave={handleCancel}
            onTouchStart={handleStart}
            onTouchEnd={handleCancel}
            className="relative w-full h-14 rounded-full overflow-hidden active:scale-[0.98] transition-transform"
        >
            {/* Фон */}
            <div className="absolute inset-0 bg-surface-elevated border border-border-subtle" />

            {/* Жидкость */}
            <AnimatePresence>
                {isHolding && !completed ? (
                    <motion.div
                        key="liquid"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: progress / 100 }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.05 }}
                        className="liquid-progress z-10"
                    />
                ) : null}
            </AnimatePresence>

            {/* Граница жидкости */}
            <AnimatePresence>
                {isHolding && !completed ? (
                    <motion.div
                        key="border"
                        initial={{ scale: 0 }}
                        animate={{ scale: progress / 100 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.1 }}
                        className="absolute inset-x-3 bottom-1 h-[calc(100%-6px)] rounded-full border-t-2 border-accent-glow-light pointer-events-none z-20"
                    />
                ) : null}
            </AnimatePresence>

            {/* Текст */}
            <span className={`relative z-30 flex items-center justify-center h-full text-sm font-medium transition-colors ${completed ? 'text-success-fluid' : 'text-text-secondary'}`}>
        {completed ? (
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ) : null}
                {completed ? "Выполнено" : label}
      </span>
        </button>
    )
}