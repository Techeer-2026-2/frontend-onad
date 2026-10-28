import { useAuthStore } from '../stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const REFRESH_PATH = '/api/v1/owners/refresh'
const AUTH_PATHS = new Set([
  '/api/v1/owners/login',
  '/api/v1/owners/refresh',
  '/api/v1/owners/logout',
])

let refreshRequest = null

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function buildUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`
}

async function parseResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return response.json()
  return response.text()
}

async function send(path, options, accessToken) {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) {
    const tokenType = useAuthStore.getState().tokenType || 'Bearer'
    headers.set('Authorization', `${tokenType} ${accessToken}`)
  }

  return fetch(buildUrl(path), { ...options, headers })
}

async function refreshSession() {
  if (refreshRequest) return refreshRequest

  refreshRequest = (async () => {
    const { refreshToken, setTokens, clearAuth } = useAuthStore.getState()
    if (!refreshToken) {
      clearAuth()
      throw new ApiError('인증이 만료되었습니다. 다시 로그인해 주세요.', 401)
    }

    try {
      const response = await fetch(buildUrl(REFRESH_PATH), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        clearAuth()
        throw new ApiError('로그인 세션을 갱신하지 못했습니다. 다시 로그인해 주세요.', response.status)
      }

      const tokens = await response.json()
      if (!tokens.accessToken || !tokens.refreshToken) {
        clearAuth()
        throw new ApiError('토큰 갱신 응답이 올바르지 않습니다.', response.status)
      }

      setTokens(tokens)
      return tokens.accessToken
    } catch (error) {
      clearAuth()
      throw error
    }
  })()

  try {
    return await refreshRequest
  } finally {
    refreshRequest = null
  }
}

export async function apiRequest(path, options = {}) {
  const { auth = true, retryOnUnauthorized = true, ...requestOptions } = options
  const isAuthRequest = AUTH_PATHS.has(path)
  const currentToken = auth ? useAuthStore.getState().accessToken : null
  let response = await send(path, requestOptions, currentToken)

  if (response.status === 401 && auth && retryOnUnauthorized && !isAuthRequest) {
    const renewedToken = await refreshSession()
    response = await send(path, requestOptions, renewedToken)
    if (response.status === 401) {
      useAuthStore.getState().clearAuth()
    }
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new ApiError(
      typeof payload === 'string' && payload ? payload : `요청에 실패했습니다. (${response.status})`,
      response.status,
    )
  }

  return payload
}
