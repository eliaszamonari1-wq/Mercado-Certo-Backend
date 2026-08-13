import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const defaultBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://betas-backend.onrender.com/api'

export const apiBaseUrl = configuredBaseUrl || defaultBaseUrl

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api

function getHealthUrl(baseUrl) {
  const normalizedUrl = baseUrl.replace(/\/$/, '')
  return normalizedUrl.endsWith('/api')
    ? `${normalizedUrl.slice(0, -4)}/health`
    : `${normalizedUrl}/health`
}

export async function initApi() {
  if (!import.meta.env.DEV) {
    return {
      base: apiBaseUrl,
      status: null,
      skipped: true,
    }
  }

  const candidates = [apiBaseUrl]

  if (apiBaseUrl !== '/api') {
    candidates.push('/api')
  }

  for (const base of candidates) {
    try {
      const response = await axios.get(getHealthUrl(base), {
        timeout: 5000,
      })

      if (response.status >= 200 && response.status < 300) {
        api.defaults.baseURL = base
        return {
          base,
          status: response.status,
        }
      }
    } catch (error) {
      console.warn(`Backend indisponível em ${base}:`, error.message)
    }
  }

  return null
}
