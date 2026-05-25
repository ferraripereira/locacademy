/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#050B17',
          elevated: '#0F1424',
          subtle: '#1A2236',
        },
        brand: {
          primary: '#1E40AF',
          hover: '#1E3A8A',
          accent: '#3B82F6',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          muted: '#94A3B8',
        },
        border: {
          subtle: '#1F2937',
          strong: '#334155',
        },
        feedback: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['"General Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['40px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-lg': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'heading-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      maxWidth: {
        container: '1200px',
        narrow: '768px',
      },
    },
  },
  plugins: [],
};
