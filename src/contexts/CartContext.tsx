'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getCardImage, getCardPrice } from '@/utils/cards'
import { useAuth } from './AuthContext'
import { API_URL } from '@/lib/config'

interface CartItem {
  id: string
  name: string
  image: string
  qty: number
  price: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (card: any) => Promise<void>
  removeFromCart: (cardId: string) => Promise<void>
  updateQuantity: (cardId: string, qty: number) => Promise<void>
  clearCart: () => void
  cartTotal: () => number
  cartCount: () => number
}

const CartContext = createContext<CartContextType | null>(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}

const CART_STORAGE_KEY = 'pikacards_cart'

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const { isAuthenticated, getAuthHeaders } = useAuth()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      setCart(stored ? JSON.parse(stored) : [])
    } catch { setCart([]) }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart, hydrated])

  const addToCart = async (card: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === card.id)
      if (existing) return prev.map((i) => i.id === card.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: card.id, name: card.name, image: getCardImage(card), qty: 1, price: getCardPrice(card) }]
    })
    try {
      if (isAuthenticated()) {
        await fetch(`${API_URL}/cart/add/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ card_id: card.id }),
        })
      }
    } catch {}
  }

  const removeFromCart = async (cardId: string) => {
    const current = cart.find((i) => i.id === cardId)
    setCart((prev) => prev.filter((i) => i.id !== cardId))
    try {
      if (isAuthenticated() && current) {
        const res = await fetch(`${API_URL}/cart/`, { headers: { ...getAuthHeaders() } })
        const items = await res.json()
        const backendItem = items.find((it: any) => it.card_name === current.name)
        if (backendItem?.id) {
          await fetch(`${API_URL}/cart/remove/${backendItem.id}/`, { method: 'DELETE', headers: { ...getAuthHeaders() } })
        }
      }
    } catch {}
  }

  const updateQuantity = async (cardId: string, qty: number) => {
    const current = cart.find((i) => i.id === cardId)
    if (qty <= 0) { await removeFromCart(cardId); return }
    setCart((prev) => prev.map((i) => i.id === cardId ? { ...i, qty } : i))
    try {
      if (isAuthenticated() && current) {
        const currentQty = current.qty
        if (qty > currentQty) {
          for (let i = 0; i < qty - currentQty; i++) {
            await fetch(`${API_URL}/cart/add/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ card_id: cardId }) })
          }
        } else if (qty < currentQty) {
          const res = await fetch(`${API_URL}/cart/`, { headers: { ...getAuthHeaders() } })
          const items = await res.json()
          const backendItem = items.find((it: any) => it.card_name === current.name)
          if (backendItem?.id) {
            await fetch(`${API_URL}/cart/remove/${backendItem.id}/`, { method: 'DELETE', headers: { ...getAuthHeaders() } })
            for (let i = 0; i < qty; i++) {
              await fetch(`${API_URL}/cart/add/`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ card_id: cardId }) })
            }
          }
        }
      }
    } catch {}
  }

  const clearCart = () => setCart([])
  const cartTotal = () => cart.reduce((t, i) => t + Number(i.price) * i.qty, 0)
  const cartCount = () => cart.reduce((c, i) => c + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}
