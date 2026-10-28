import { create } from 'zustand'

const STORAGE_KEY = 'onad-auth-session'

function readStoredSession() {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY)
    if (!value) return null

    const session = JSON.parse(value)
    if (!session.accessToken || !session.refreshToken) return null

    return session
  } catch {
    return null
  }
}

function persistSession(session) {
  try {
    if (session) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Keep the in-memory session usable when browser storage is unavailable.
  }
}

export const useAuthStore = create((set) => ({
  ...readStoredSession(),
  setTokens: ({ accessToken, refreshToken, tokenType, expiresIn }) => {
    const session = {
      accessToken,
      refreshToken,
      tokenType: tokenType || 'Bearer',
      expiresAt: Date.now() + Number(expiresIn) * 1000,
    }

    persistSession(session)
    set(session)
  },
  clearAuth: () => {
    persistSession(null)
    set({ accessToken: null, refreshToken: null, tokenType: null, expiresAt: null })
  },
}))
