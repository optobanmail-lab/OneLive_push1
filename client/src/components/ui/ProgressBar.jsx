function ProgressBar({ value = 0 }) {
    return (
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface2">
            <div
                className="h-full rounded-full bg-gradient-to-r from-accent2 to-accent transition-all duration-300"
                style={{ width: `${value}%` }}
            />
        </div>
    )
}

export default ProgressBar