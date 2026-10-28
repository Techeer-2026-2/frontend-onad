import { apiRequest } from './client'
import { useAuthStore } from '../stores/authStore'

export async function signup({ email, password, businessName }) {
  return apiRequest('/api/v1/owners/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, businessName }),
    auth: false,
    retryOnUnauthorized: false,
  })
}

export async function login({ email, password }) {
  const tokens = await apiRequest('/api/v1/owners/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  })

  if (!tokens?.accessToken || !tokens?.refreshToken) {
    throw new Error('로그인 응답에 인증 토큰이 없습니다.')
  }

  useAuthStore.getState().setTokens(tokens)
  return tokens
}

export async function logout() {
  const { refreshToken, clearAuth } = useAuthStore.getState()

  try {
    if (refreshToken) {
      await apiRequest('/api/v1/owners/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        auth: false,
        retryOnUnauthorized: false,
      })
    }
  } finally {
    clearAuth()
  }
}
