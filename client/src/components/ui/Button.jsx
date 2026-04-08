function Button({
                    children,
                    variant = 'primary', // primary | glass | ghost | danger
                    className = '',
                    ...props
                }) {
    const base =
        'press fade inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium'

    const styles = {
        primary: 'bg-accent text-white shadow-soft',
        glass: 'glass text-text',
        ghost: 'bg-transparent text-text hover:bg-white/5',
        danger: 'bg-danger/15 text-danger',
    }

    return (
        <button className={`${base} ${styles[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}

export default Button