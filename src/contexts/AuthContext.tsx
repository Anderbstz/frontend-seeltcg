'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { AUTH_URL } from '@/lib/config'

interface User {
  username: string
  email?: string
  first_name?: string
  last_name?: string
  avatar?: string
  role?: string
}

interface AuthData {
  user: User | null
  token: string
  refresh: string
}

interface AuthContextType {
  auth: AuthData | null
  loading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>
  logout: () => void
  isAuthenticated: () => boolean
  getAuthHeaders: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

const AUTH_STORAGE_KEY = 'seatcg_auth'

const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1]))
    return !payload.exp || payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}

const loadAuth = (): AuthData | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    if (!parsed?.token || isTokenExpired(parsed.token)) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setAuth(loadAuth())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) {
      if (auth) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth))
      else localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [auth, hydrated])

  const extractError = (payload: any, fallback: string): string => {
    if (!payload) return fallback
    if (typeof payload === 'string') return payload
    if (payload.error) return payload.error
    if (payload.message) return payload.message
    const firstKey = Object.keys(payload)[0]
    const firstValue = payload[firstKey]
    if (Array.isArray(firstValue)) return firstValue[0]
    if (typeof firstValue === 'string') return firstValue
    return fallback
  }

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(extractError(data, 'Error al iniciar sesión'))
      setAuth({ user: data.user || { username }, token: data.access, refresh: data.refresh })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(extractError(data, 'Error al iniciar con Google'))

      const authData = { user: data.user || null, token: data.access, refresh: data.refresh }

      // Save avatar
      if (data.user?.username && data.user?.avatar) {
        try {
          const key = `seatcg_profile_${data.user.username}`
          const existing = localStorage.getItem(key)
          if (!existing) {
            localStorage.setItem(key, JSON.stringify({ avatar: data.user.avatar }))
          } else {
            const parsed = JSON.parse(existing)
            if (!parsed.avatar) localStorage.setItem(key, JSON.stringify({ ...parsed, avatar: data.user.avatar }))
          }
        } catch {}
      }

      setAuth(authData)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      const res = await fetch(`${AUTH_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(extractError(data, 'Error al registrar'))
      return { success: true, message: data.message }
    } catch (err: any) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => setAuth(null)

  // Auto-clear expired token
  useEffect(() => {
    if (auth?.token && isTokenExpired(auth.token)) {
      setAuth(null)
    }
  }, [auth?.token])

  const isAuthenticated = () => {
    return !!(auth?.token && !isTokenExpired(auth.token))
  }

  const getAuthHeaders = (): Record<string, string> => {
    if (!auth?.token) return {} as Record<string, string>
    return { Authorization: `Bearer ${auth.token}` }
  }

  return (
    <AuthContext.Provider value={{ auth, loading, login, loginWithGoogle, register, logout, isAuthenticated, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  )
}
