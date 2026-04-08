/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                // base surfaces (используют <alpha-value>, чтобы работали /80, /50 и т.п.)
                bg: "rgb(var(--bg) / <alpha-value>)",
                surface: "rgb(var(--surface) / <alpha-value>)",
                "surface-elevated": "rgb(var(--surface-elevated) / <alpha-value>)",

                // legacy aliases (чтобы старые компоненты не ломались)
                surface2: "rgb(var(--surface-elevated) / <alpha-value>)",

                // text
                text: "rgb(var(--text-primary) / <alpha-value>)",
                muted: "rgb(var(--text-secondary) / <alpha-value>)",
                "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
                "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
                "text-tertiary": "rgb(var(--text-tertiary) / <alpha-value>)",

                // borders/dividers
                // ВАЖНО: эти переменные у тебя с альфой (вида "255 255 255 / 0.04"),
                // поэтому здесь без <alpha-value>
                border: "rgb(var(--divider))",
                divider: "rgb(var(--divider))",
                "border-subtle": "rgb(var(--border-subtle))",

                // accents
                accent: "rgb(var(--accent-glow) / <alpha-value>)",
                accent2: "rgb(var(--accent-glow-light) / <alpha-value>)",
                "accent-glow": "rgb(var(--accent-glow) / <alpha-value>)",
                "accent-glow-light": "rgb(var(--accent-glow-light) / <alpha-value>)",

                // statuses
                success: "rgb(var(--success-fluid) / <alpha-value>)",
                "success-fluid": "rgb(var(--success-fluid) / <alpha-value>)",
                danger: "rgb(var(--danger) / <alpha-value>)",
            },
            boxShadow: {
                soft: "0 10px 30px rgba(0,0,0,0.25)",
            },
        },
    },
    plugins: [],
}