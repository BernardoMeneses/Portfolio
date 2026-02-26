// Configuração da API
// Usa a variável Vite `VITE_API_URL` quando definida (recomendada para Vercel).
// Caso contrário, mantém a lógica antiga: produção -> Fly URL; dev -> localhost.
const DEFAULT_FLY_URL = 'https://portfolio-backend-shy-butterfly-71.fly.dev'
export const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? DEFAULT_FLY_URL : 'http://localhost:8000'
);
