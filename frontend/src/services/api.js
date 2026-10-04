import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5004/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Intercepteur REQUEST
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Intercepteur RESPONSE
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      if (error.response.status === 403) {
        console.error('Accès refusé')
      }
    }
    return Promise.reject(error)
  }
)

export default api