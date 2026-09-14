/** @type {import('tailwindcss').Config} */

// Every color is a CSS variable defined in src/styles/theme.css.
// Components use these token classes only (bg-card, text-muted-foreground, …), never hex values.
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: token('background'),
        surface: token('surface'),
        card: token('card'),
        muted: token('muted'),
        border: token('border'),
        'border-strong': token('border-strong'),
        input: token('input'),
        foreground: token('foreground'),
        'secondary-foreground': token('secondary-foreground'),
        'muted-foreground': token('muted-foreground'),
        'subtle-foreground': token('subtle-foreground'),
        primary: {
          DEFAULT: token('primary'),
          foreground: token('primary-foreground'),
        },
        destructive: {
          DEFAULT: token('destructive'),
          soft: token('destructive-soft'),
        },
        warning: token('warning'),
        success: token('success'),
        severity: {
          high: token('severity-high'),
          medium: token('severity-medium'),
          low: token('severity-low'),
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
