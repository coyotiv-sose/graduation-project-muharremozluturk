import axios from 'axios'

axios.defaults.withCredentials = true
const configuredBaseUrl = String(import.meta.env.VITE_BACKEND_URL || '').trim()
const hasExplicitProtocol = /^https?:\/\//i.test(configuredBaseUrl)
const safeBaseUrl = hasExplicitProtocol ? configuredBaseUrl.replace(/\/+$/, '') : ''
axios.defaults.baseURL = safeBaseUrl || 'http://localhost:3000'

export default axios
