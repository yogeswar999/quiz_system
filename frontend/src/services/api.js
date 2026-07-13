import axios from 'axios'

// In dev, falls back to localhost:8080. In production (Railway), set VITE_API_URL
// to your deployed backend's URL, e.g. https://your-backend.up.railway.app/api
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('username')
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
