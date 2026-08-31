/**
 * Tokens do Design System Automotivo Light ("Auto Clean Pro" - Opção 2 Saga/Localiza Tech)
 * - Primária: Azul Cobalto Saga (#1D4ED8)
 * - Destaque de Preços: Vermelho Automotivo (#DC2626)
 * - Status de Estoque & Confiança: Verde Localiza (#16A34A)
 */

export const colors = {
  brand: {
    primary: '#1D4ED8',      // Azul Cobalto (Identidade, CTAs, Navegação)
    primaryHover: '#1E40AF',
    primaryLight: '#EFF6FF',
    primaryBorder: '#BFDBFE',
    
    price: '#DC2626',        // Vermelho Automotivo (Preços e Ofertas)
    priceHover: '#B91C1C',
    priceLight: '#FEF2F2',
    priceBorder: '#FECACA',
    
    accent: '#16A34A',       // Verde Localiza (Disponível / Garantia / Procedência)
    accentHover: '#15803D',
    accentLight: '#DCFCE7',
    accentBorder: '#86EFAC',
  },
  surface: {
    canvas: '#F8FAFC',       // Fundo limpo (Slate 50)
    card: '#FFFFFF',         // Cards brancos com borda
    muted: '#F1F5F9',        // Slate 100
    border: '#E2E8F0',       // Slate 200
    borderHover: '#CBD5E1',  // Slate 300
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
      label: 'Em Estoque',
    },
    sold: {
      bg: '#F1F5F9',
      text: '#475569',
      border: '#CBD5E1',
      label: 'Vendido',
    },
    syncing: {
      bg: '#FEF3C7',
      text: '#92400E',
      border: '#FCD34D',
      label: 'Sincronizando',
    },
    error: {
      bg: '#FEF2F2',
      text: '#991B1B',
      border: '#FECACA',
      label: 'Rejeitado / Erro',
    },
  },
} as const;

export const typography = {
  fonts: {
    sans: 'Inter, Plus Jakarta Sans, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
} as const;
