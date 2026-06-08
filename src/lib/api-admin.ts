import { API_URL } from '@/lib/config'

interface ApiHeaders {
  [key: string]: string
}

export interface CardFormData {
  name: string
  set_name?: string
  types?: string
  rarity?: string
  hp?: string
  artist?: string
  price: number
  image_url?: string
}

export interface AdminCard {
  id: string
  name: string
  set_name?: string
  types?: string
  rarity?: string
  hp?: string
  artist?: string
  price: number
  image_url?: string
  [key: string]: unknown
}

const getHeaders = (): ApiHeaders => {
  try {
    const stored = localStorage.getItem('pikacards_auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.token) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${parsed.token}`,
        }
      }
    }
  } catch {}
  return { 'Content-Type': 'application/json' }
}

export const adminApi = {
  getCards: async (): Promise<AdminCard[]> => {
    const res = await fetch(`${API_URL}/admin/cards/`, { headers: getHeaders() })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err === 'object' && err !== null ? (err as Record<string, string>).error : undefined
      throw new Error(msg || 'Error al cargar cartas')
    }
    const data = await res.json()
    return Array.isArray(data) ? data : data.results || []
  },

  createCard: async (data: CardFormData): Promise<AdminCard> => {
    const res = await fetch(`${API_URL}/admin/cards/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err === 'object' && err !== null ? (err as Record<string, string>).error : undefined
      throw new Error(msg || 'Error al crear carta')
    }
    return res.json()
  },

  updateCard: async (id: string, data: CardFormData): Promise<AdminCard> => {
    const res = await fetch(`${API_URL}/admin/cards/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err === 'object' && err !== null ? (err as Record<string, string>).error : undefined
      throw new Error(msg || 'Error al actualizar carta')
    }
    return res.json()
  },

  deleteCard: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/admin/cards/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = typeof err === 'object' && err !== null ? (err as Record<string, string>).error : undefined
      throw new Error(msg || 'Error al eliminar carta')
    }
  },
}
