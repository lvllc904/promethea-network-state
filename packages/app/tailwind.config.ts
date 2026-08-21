import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    '../ui/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../components/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      fontFamily: {
        body: ['var(--font-label)'],
        headline: ['var(--font-command)'],
        code: ['var(--font-data)'],
        data: ['var(--font-data)'],
        label: ['var(--font-label)'],
        command: ['var(--font-command)'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        guildhall: {
          bg: 'rgb(var(--guildhall-bg-rgb) / <alpha-value>)',
          panel: 'rgb(var(--guildhall-panel-rgb) / <alpha-value>)',
          'panel-raised': 'rgb(var(--guildhall-panel-raised-rgb) / <alpha-value>)',
          line: 'rgb(var(--guildhall-line-rgb) / <alpha-value>)',
          text: 'rgb(var(--guildhall-text-rgb) / <alpha-value>)',
          muted: 'rgb(var(--guildhall-muted-rgb) / <alpha-value>)',
          subtle: 'rgb(var(--guildhall-subtle-rgb) / <alpha-value>)',
          identity: 'rgb(var(--guildhall-identity-rgb) / <alpha-value>)',
          treasury: 'rgb(var(--guildhall-treasury-rgb) / <alpha-value>)',
          consensus: 'rgb(var(--guildhall-consensus-rgb) / <alpha-value>)',
          danger: 'rgb(var(--guildhall-danger-rgb) / <alpha-value>)',
        },
        economics: { DEFAULT: '#10b981' },
        governance: { DEFAULT: '#06b6d4' },
        narrative: { DEFAULT: '#a855f7' },
        diplomatic: { DEFAULT: '#f59e0b' },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;

export default config;
