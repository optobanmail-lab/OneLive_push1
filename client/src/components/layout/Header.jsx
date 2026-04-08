function Header({ title, subtitle }) {
    return (
        <div className="mb-5 pt-2">
            <h1 className="text-[28px] font-bold leading-tight text-text">{title}</h1>
            {subtitle ? (
                <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
        </div>
    )
}

export default Header