import axios from 'axios'

// Axios instance - tüm API çağrıları için
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor - her istekte çalışır
api.interceptors.request.use(
  (config) => {
    // Burada auth token eklenebilir
    // config.headers.Authorization = `Bearer ${token}`
    console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - her yanıtta çalışır
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ [${error.response?.status}] ${error.config?.url}`)
    return Promise.reject(error)
  }
)

export default api

