import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#DC2626',      // Vermelho Automotivo (Webmotors Inspired)
          primaryHover: '#B91C1C',
          primaryLight: '#FEE2E2',
          secondary: '#2563EB',    // Azul Corporativo (Saga Inspired)
          secondaryHover: '#1D4ED8',
          secondaryLight: '#DBEAFE',
          accent: '#16A34A',       // Verde Estoque / Confiança (Localiza Inspired)
          accentHover: '#15803D',
          accentLight: '#DCFCE7',
        },
        surface: {
          canvas: '#F8FAFC',       // Fundo principal ultra limpo (Slate 50)
          card: '#FFFFFF',         // Cards brancos de alto contraste
          muted: '#F1F5F9',        // Superfícies secundárias (Slate 100)
          border: '#E2E8F0',       // Bordas sutis (Slate 200)
          borderHover: '#CBD5E1',  // Hover em bordas (Slate 300)
        },
        typography: {
          heading: '#0F172A',      // Slate 900
          body: '#334155',         // Slate 700
          muted: '#64748B',        // Slate 500
          subtle: '#94A3B8',       // Slate 400
        },
        status: {
          available: {
            bg: '#DCFCE7',
            text: '#166534',
            border: '#86EFAC',
          },
          sold: {
            bg: '#F1F5F9',
            text: '#475569',
            border: '#CBD5E1',
          },
          syncing: {
            bg: '#FEF3C7',
            text: '#92400E',
            border: '#FCD34D',
          },
          error: {
            bg: '#FEE2E2',
            text: '#991B1B',
            border: '#FCA5A5',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      }
    },
  },
  plugins: [],
};

export default config;
