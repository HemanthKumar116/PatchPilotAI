/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Pure Yellow Cyber-Brutalist Palette
                canvas: '#FFE600',
                'canvas-subtle': '#FFF04B',
                'canvas-dark': '#000000',
                
                plum: {
                    DEFAULT: '#000000',
                    light: '#18181B',
                    border: '#27272A',
                },
                ink: '#000000',
                slate: '#3F3F46',
                
                // Status mappings
                critical: '#000000',
                high: '#27272A',
                medium: '#52525B',
                low: '#71717A',

                lime: {
                    DEFAULT: '#000000',
                    bright: '#18181B',
                },
                coral: '#000000',
                pink: '#000000',
                cyan: '#000000',
                purple: '#000000',
                orange: '#27272A',
                gold: '#FFE600',
            },
            fontFamily: {
                display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
                outfit: ['Outfit', 'sans-serif'],
                jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
                space: ['"Space Grotesk"', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace']
            },
            borderRadius: {
                '3xl': '1.75rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
            },
            boxShadow: {
                'brutalist': '5px 5px 0px 0px #000000',
                'brutalist-lg': '8px 8px 0px 0px #000000',
                'brutalist-white': '5px 5px 0px 0px #FFFFFF',
            }
        },
    },
    plugins: [],
}
