'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { CHECKOUT_URL, API_URL } from '@/lib/config'
import { FALLBACK_CARD_IMAGE, formatCurrency } from '@/utils/cards'

export default function CartPage() {
  const router = useRouter()
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const { isAuthenticated, getAuthHeaders } = useAuth()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      setError('Debes iniciar sesión para continuar con el pago')
      setTimeout(() => router.push('/login'), 2000)
      return
    }

    if (cart.length === 0) {
      setError('El carrito está vacío')
      return
    }

    // Validate shipping address
    try {
      const authKey = `seatcg_profile_${(JSON.parse(localStorage.getItem('seatcg_auth') || '{}')?.user?.username) || 'default'}`
      const savedProfile = localStorage.getItem(authKey)
      const parsed = savedProfile ? JSON.parse(savedProfile) : {}
      const hasAddress = Boolean((parsed.address || '').trim())
      const hasProvince = Boolean((parsed.province || '').trim())
      if (!hasAddress || !hasProvince) {
        setError('Necesitas completar tu dirección de envío (provincia y dirección) en tu Perfil antes de pagar.')
        setTimeout(() => router.push('/profile'), 1500)
        return
      }
    } catch (_) {
      setError('No pudimos verificar tu dirección. Actualiza tu Perfil antes de pagar.')
      setTimeout(() => router.push('/profile'), 1500)
      return
    }

    setProcessing(true)
    setError('')

    try {
      // Sync cart with backend: limpia el backend y agrega las cartas del frontend
      try {
        // Obtener items actuales del backend para eliminarlos
        const res = await fetch(`${API_URL}/cart/`, { headers: { ...getAuthHeaders() } })
        if (res.ok) {
          const serverItems = await res.json()
          // Eliminar todos los items del backend
          for (const item of serverItems) {
            await fetch(`${API_URL}/cart/remove/${item.id}/`, { method: 'DELETE', headers: { ...getAuthHeaders() } })
          }
        }
        // Agregar todos los items del frontend al backend
        for (const item of cart) {
          for (let i = 0; i < item.qty; i++) {
            await fetch(`${API_URL}/cart/add/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
              body: JSON.stringify({ card_id: item.id }),
            })
          }
        }
      } catch (syncError) {
        console.error('Error sincronizando carrito con backend:', syncError)
      }

      // Request checkout
      const response = await fetch(CHECKOUT_URL, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
      })

      const contentType = response.headers.get('content-type') || ''
      let data
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = { error: text }
      }

      if (!response.ok) {
        if (response.status === 401) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibió URL de pago')
      }
    } catch (fetchError: any) {
      setError(fetchError.message ?? 'Error al procesar el pago')
      setProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="px-[5vw] py-8 max-w-[1400px] mx-auto">
        <h1 className="m-0 mb-8 text-4xl">Carrito de Compras</h1>
        <div className="card text-center py-16 px-8">
          <p className="text-lg mb-8 text-muted">Tu carrito está vacío</p>
          <button type="button" className="btn-primary" onClick={() => router.push('/')}>
            Explorar Cartas
          </button>
        </div>
      </div>
    )
  }

  // Check if address is filled (for inline hint)
  let addressHint = null
  try {
    const authKey = `seatcg_profile_${(JSON.parse(localStorage.getItem('seatcg_auth') || '{}')?.user?.username) || 'default'}`
    const savedProfile = localStorage.getItem(authKey)
    const parsed = savedProfile ? JSON.parse(savedProfile) : {}
    const hasAddress = Boolean((parsed.address || '').trim())
    const hasProvince = Boolean((parsed.province || '').trim())
    if (!hasAddress || !hasProvince) {
      addressHint = (
        <div className="mb-3 p-4 rounded-xl font-semibold border-2" style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}>
          Completa tu dirección de envío en{' '}
          <button type="button" className="bg-transparent border-none underline cursor-pointer font-semibold" style={{ color: '#ff4d4f' }} onClick={() => router.push('/profile')}>Perfil</button>.
        </div>
      )
    }
  } catch {}

  return (
    <div className="px-[5vw] py-8 max-w-[1400px] mx-auto">
      <h1 className="m-0 mb-8 text-4xl">Carrito de Compras</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl font-semibold border-2" style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}>
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.id} className="card-sm p-4 md:p-6">
              {/* Top row: image + info */}
              <div className="flex gap-4 items-start mb-4">
                <div className="w-[80px] md:w-[120px] h-[80px] md:h-[120px] rounded-xl flex items-center justify-center overflow-hidden shrink-0 bg-card">
                  <img
                    src={item.image || FALLBACK_CARD_IMAGE}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CARD_IMAGE }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="m-0 text-lg md:text-xl font-bold truncate">{item.name}</h3>
                  <p className="m-0 mt-1 text-sm text-muted">{formatCurrency(item.price)}</p>
                </div>
                {/* Desktop subtotal */}
                <div className="hidden md:block text-xl font-bold text-accent shrink-0">
                  {formatCurrency(parseFloat(String(item.price)) * item.qty)}
                </div>
              </div>

              {/* Bottom row: quantity + actions */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-black/10">
                <div className="flex items-center gap-3 rounded-full border-2 border-black p-1.5 bg-card">
                  <button type="button" onClick={() => updateQuantity(item.id, item.qty - 1)} className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold cursor-pointer hover:bg-[#d83000] hover:text-white transition-colors duration-200">−</button>
                  <span className="font-bold min-w-[30px] text-center">{item.qty}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.qty + 1)} className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold cursor-pointer hover:bg-[#d83000] hover:text-white transition-colors duration-200">+</button>
                </div>
                {/* Mobile subtotal */}
                <span className="md:hidden text-lg font-bold text-accent">
                  {formatCurrency(parseFloat(String(item.price)) * item.qty)}
                </span>
                <button type="button" onClick={() => removeFromCart(item.id)} className="btn-danger-soft shrink-0">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky top-8 h-fit">
          <div className="card p-8">
            <h2 className="m-0 mb-6 text-2xl">Resumen</h2>
            {addressHint}
            <div className="flex justify-between mb-4 text-base">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal())}</span>
            </div>
            <div className="flex justify-between mb-4 text-base">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <div className="h-0.5 bg-black my-4"></div>
            <div className="flex justify-between mb-4 text-2xl font-bold text-accent">
              <span>Total</span>
              <span>{formatCurrency(cartTotal())}</span>
            </div>
            <button
              type="button"
              className="btn-primary-lg w-full mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Pagar ahora'}
            </button>
            {!isAuthenticated() && (
              <p className="mt-4 text-sm text-center text-muted">
                Debes iniciar sesión para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
