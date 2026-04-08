export default function Card({ children, className = '', glow = false }) {
    return (
        <div
            className={`rounded-[28px] ${
                glow
                    ? 'shadow-[0_8px_32px_rgba(66,135,245,0.06)]'
                    : 'border border-border-subtle'
            } bg-surface backdrop-blur-sm p-[1px] ${className}`}
        >
            <div className="rounded-[26px] bg-surface h-full p-5">
                {children}
            </div>
        </div>
    )
}