function Header({ title, subtitle = null, compact = false, right = null }) {
    return (
        <div className={[compact ? 'mb-3 pt-1' : 'mb-5 pt-2'].join(' ')}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-[28px] font-bold leading-tight text-text truncate">
                        {title}
                    </h1>

                    {subtitle ? (
                        <p className="mt-1 text-sm text-muted">
                            {subtitle}
                        </p>
                    ) : null}
                </div>

                {right ? <div className="shrink-0">{right}</div> : null}
            </div>
        </div>
    )
}

export default Header