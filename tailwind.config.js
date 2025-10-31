/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        brand: 'var(--color-brand)',
        brand600: 'var(--color-brand-600)',
        brand700: 'var(--color-brand-700)',
        surface: 'var(--color-surface)',
        surfaceMuted: 'var(--color-surface-muted)',
        textMuted: 'var(--color-text-muted)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)'
      },
      boxShadow: {
        elev1: 'var(--elev-1)',
        elev2: 'var(--elev-2)',
        elev3: 'var(--elev-3)'
      },
      transitionTimingFunction: {
        standard: 'var(--ease-standard)'
      },
      transitionDuration: {
        150: 'var(--duration-150)',
        300: 'var(--duration-300)'
      },
    },
  },
  plugins: [],
} 