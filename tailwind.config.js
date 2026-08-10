/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: '#0b0f19',
                    card: '#111827',
                    border: '#1f2937',
                    hover: '#1e293b',
                    accent: '#3b82f6',
                    critical: '#ef4444',
                    high: '#f97316',
                    medium: '#eab308',
                    low: '#22c55e',
                    text: '#f3f4f6',
                    muted: '#9ca3af',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace']
            }
        },
    },
    plugins: [],
}
