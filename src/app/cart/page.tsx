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
      const authKey = `pikacards_profile_${(JSON.parse(localStorage.getItem('pikacards_auth') || '{}')?.user?.username) || 'default'}`
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
      // Sync cart with backend
      try {
        const res = await fetch(`${API_URL}/cart/`, { headers: { ...getAuthHeaders() } })
        const serverItems = res.ok ? await res.json() : []
        if ((!Array.isArray(serverItems) || serverItems.length === 0) && cart.length > 0) {
          for (const item of cart) {
            for (let i = 0; i < item.qty; i++) {
              await fetch(`${API_URL}/cart/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ card_id: item.id }),
              })
            }
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
        <div className="text-center py-16 px-8 bg-white border-[3px] border-black rounded-[24px]">
          <p className="text-lg mb-8" style={{ color: '#7a4a1b' }}>Tu carrito está vacío</p>
          <button type="button" className="py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={() => router.push('/')}>
            Explorar Cartas
          </button>
        </div>
      </div>
    )
  }

  // Check if address is filled (for inline hint)
  let addressHint = null
  try {
    const authKey = `pikacards_profile_${(JSON.parse(localStorage.getItem('pikacards_auth') || '{}')?.user?.username) || 'default'}`
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

      <div className="grid gap-8" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="flex flex-col gap-4">
          {cart.map((item) => (
            <div key={item.id} className="grid gap-6 items-center bg-white border-[3px] border-black rounded-[20px] p-6" style={{ gridTemplateColumns: '120px 1fr auto auto' }}>
              <div className="w-[120px] h-[120px] rounded-xl flex items-center justify-center overflow-hidden" style={{ background: '#fef7e7' }}>
                <img
                  src={item.image || FALLBACK_CARD_IMAGE}
                  alt={item.name}
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_CARD_IMAGE }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="m-0 text-xl">{item.name}</h3>
                <p className="m-0 text-sm" style={{ color: '#7a4a1b' }}>{formatCurrency(item.price)}</p>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center gap-3 rounded-full border-2 border-black p-1.5" style={{ background: '#fef7e7' }}>
                  <button type="button" onClick={() => updateQuantity(item.id, item.qty - 1)} className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold cursor-pointer hover:bg-[#d83000] hover:text-white transition-colors duration-200">−</button>
                  <span className="font-bold min-w-[30px] text-center">{item.qty}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.qty + 1)} className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-bold cursor-pointer hover:bg-[#d83000] hover:text-white transition-colors duration-200">+</button>
                </div>
                <button type="button" onClick={() => removeFromCart(item.id)} className="px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer border-2 transition-colors duration-200 hover:text-white" style={{ borderColor: '#d83000', color: '#d83000', background: '#fff' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#d83000'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#d83000' }}
                >
                  Eliminar
                </button>
              </div>
              <div className="text-xl font-bold text-right" style={{ color: '#d83000' }}>
                {formatCurrency(parseFloat(String(item.price)) * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky top-8 h-fit">
          <div className="bg-white border-[3px] border-black rounded-[24px] p-8">
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
            <div className="flex justify-between mb-4 text-2xl font-bold" style={{ color: '#d83000' }}>
              <span>Total</span>
              <span>{formatCurrency(cartTotal())}</span>
            </div>
            <button
              type="button"
              className="w-full mt-6 py-4 px-8 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white text-lg transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#d83000' }}
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? 'Procesando...' : 'Pagar ahora'}
            </button>
            {!isAuthenticated() && (
              <p className="mt-4 text-sm text-center" style={{ color: '#7a4a1b' }}>
                Debes iniciar sesión para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
