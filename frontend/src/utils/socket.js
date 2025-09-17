import { io } from 'socket.io-client'

export function getSocketBaseUrl() {
  const envUrl = import.meta?.env?.VITE_SOCKET_URL
  if (envUrl) return envUrl
  try {
    const loc = window.location
    if (loc.port === '5173') return 'http://localhost:4000'
    return `${loc.protocol}//${loc.host}`
  } catch {
    return 'http://localhost:4000'
  }
}

export function createSocket(extraOptions = {}) {
  const adminToken = localStorage.getItem('adminToken') || undefined
  const base = getSocketBaseUrl()
  return io(base, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: false,
    auth: { token: adminToken },
    ...extraOptions
  })
}
