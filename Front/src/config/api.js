// API configuration
// Normalize the configured base URL so fetches do not end up as `//api/...`.
const normalizeApiBase = (url = '') => url.trim().replace(/\/+$/, '')

const DEFAULT_FLY_URL = normalizeApiBase('https://portfolio-backend-shy-butterfly-71.fly.dev')
const ENV_API_URL = normalizeApiBase(import.meta.env.VITE_API_URL || '')

export const API_URL = ENV_API_URL || (
  import.meta.env.PROD ? DEFAULT_FLY_URL : 'http://localhost:3001'
)
