function SectionTitle({ title, subtitle }) {
    return (
        <div className="mb-4">
            <h2 className="m-0 text-xl font-semibold text-text">{title}</h2>
            {subtitle ? (
                <p className="mt-1 text-sm text-muted">{subtitle}</p>
            ) : null}
        </div>
    )
}

export default SectionTitle