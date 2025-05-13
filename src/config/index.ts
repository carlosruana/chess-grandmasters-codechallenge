export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.chess.com/pub',
    timeout: 5000,
  },
  cache: {
    ttl: 1000 * 60 * 5, // 5 minutes
  },
  features: {
    enableCache: true,
    enableAnalytics: import.meta.env.PROD,
    enableErrorReporting: import.meta.env.PROD,
  },
  routes: {
    home: '/',
    player: '/player/:id',
    search: '/search',
  },
} as const;
