/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // M3 Surface colors (light theme)
        surface: {
          DEFAULT: '#FEF7FF',
          dim: '#DED8E1',
          bright: '#FEF7FF',
          container: {
            lowest: '#FFFFFF',
            low: '#F7F2FA',
            DEFAULT: '#F3EDF7',
            high: '#ECE6F0',
            highest: '#E6E0E9',
          },
          variant: '#E7E0EC',
        },
        
        // M3 Primary colors (muted green from your brand)
        primary: {
          DEFAULT: '#4A6B5C', // More muted green
          container: '#C8E6D4',
          on: '#FFFFFF',
          'on-container': '#0A2F1F',
        },
        
        // M3 Secondary colors
        secondary: {
          DEFAULT: '#52634F',
          container: '#D5E8CF',
          on: '#FFFFFF',
          'on-container': '#101F0F',
        },
        
        // M3 Tertiary colors
        tertiary: {
          DEFAULT: '#3A6471',
          container: '#BEE9F8',
          on: '#FFFFFF',
          'on-container': '#001F28',
        },
        
        // M3 Error colors
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
          on: '#FFFFFF',
          'on-container': '#410002',
        },
        
        // M3 Text colors
        'on-surface': {
          DEFAULT: '#1C1B1F',
          variant: '#49454F',
        },
        
        // M3 Outline
        outline: {
          DEFAULT: '#79747E',
          variant: '#CAC4D0',
        },
        
        // Legacy support (for gradual migration)
        cream: '#FEF7FF',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Roboto Flex', 'Roboto', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // M3 Type Scale
        'display-large': ['57px', { lineHeight: '64px', fontWeight: '400' }],
        'display-medium': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'display-small': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'headline-large': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-medium': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-small': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'title-large': ['22px', { lineHeight: '28px', fontWeight: '400' }],
        'title-medium': ['16px', { lineHeight: '24px', fontWeight: '500', letterSpacing: '0.15px' }],
        'title-small': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'label-large': ['14px', { lineHeight: '20px', fontWeight: '500', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', fontWeight: '500', letterSpacing: '0.5px' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400', letterSpacing: '0.4px' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        // M3 Elevation levels
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px 0px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px 0px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        // M3 Motion - Emphasized (for important transitions)
        'emphasized-in': 'emphasizedIn 500ms cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        'emphasized-out': 'emphasizedOut 200ms cubic-bezier(0.3, 0.0, 0.8, 0.15)',
        // M3 Motion - Standard (for most transitions)
        'standard-in': 'standardIn 300ms cubic-bezier(0.2, 0.0, 0, 1.0)',
        'standard-out': 'standardOut 200ms cubic-bezier(0.4, 0.0, 1, 1.0)',
        // M3 Motion - Decelerate (for entering elements)
        'decelerate': 'decelerate 250ms cubic-bezier(0.0, 0.0, 0, 1.0)',
        // M3 Motion - Accelerate (for exiting elements)
        'accelerate': 'accelerate 200ms cubic-bezier(0.3, 0.0, 1.0, 1.0)',
        // Background animations (keep existing)
        'drift-slow': 'drift 25s ease-in-out infinite',
        'drift-medium': 'drift 20s ease-in-out infinite',
        'drift-fast': 'drift 15s ease-in-out infinite',
      },
      keyframes: {
        emphasizedIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        emphasizedOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.8)' },
        },
        standardIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        standardOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        decelerate: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        accelerate: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
        },
      },
      transitionTimingFunction: {
        // M3 Easing curves
        'emphasized': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
        'emphasized-accelerate': 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
        'standard': 'cubic-bezier(0.2, 0.0, 0, 1.0)',
        'standard-decelerate': 'cubic-bezier(0, 0, 0, 1)',
        'standard-accelerate': 'cubic-bezier(0.3, 0, 1, 1)',
      },
      borderRadius: {
        // M3 Shape scale
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px',
        'full': '9999px',
      },
      opacity: {
        '8': '0.08',
        '12': '0.12',
        '16': '0.16',
        '38': '0.38',
      },
    },
  },
  plugins: [],
}
