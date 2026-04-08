import { useRef } from 'react'

function HoldButton({ onHoldComplete, children = 'Hold to confirm' }) {
    const timerRef = useRef(null)

    const startHold = () => {
        timerRef.current = setTimeout(() => {
            onHoldComplete?.()
        }, 1200)
    }

    const cancelHold = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }

    return (
        <button
            className="secondary-btn"
            onMouseDown={startHold}
            onMouseUp={cancelHold}
            onMouseLeave={cancelHold}
            onTouchStart={startHold}
            onTouchEnd={cancelHold}
        >
            {children}
        </button>
    )
}

export default HoldButton