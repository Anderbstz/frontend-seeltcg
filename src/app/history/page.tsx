'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { API_URL } from '@/lib/config'
import { formatCurrency, FALLBACK_CARD_IMAGE } from '@/utils/cards'

function HistoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { auth, isAuthenticated, getAuthHeaders } = useAuth()
  const { clearCart } = useCart()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessBanner, setShowSuccessBanner] = useState(Boolean(searchParams.get('success')))
  const [filters, setFilters] = useState({ q: '', minTotal: '', maxTotal: '', startDate: '', endDate: '' })
  const [imgSizeVar, setImgSizeVar] = useState('140px')

  useEffect(() => {
    if (!auth?.token) return
    const loadHistory = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${API_URL}/history/`, {
          headers: { Accept: 'application/json', ...getAuthHeaders() },
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
          throw new Error(data.error || 'Error al cargar el historial')
        }
        setOrders(Array.isArray(data) ? data : [])
      } catch (fetchError: any) {
        setError(fetchError.message ?? 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

  // If coming from a successful payment, clear local cart and show banner
  useEffect(() => {
    if (searchParams.get('success') && auth?.token) {
      clearCart()
      const t = setTimeout(() => setShowSuccessBanner(false), 6000)
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/history/`, {
            headers: { Accept: 'application/json', ...getAuthHeaders() },
          })
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data)) setOrders(data)
          }
        } catch (_) {}
      }, 2000)
      const stop = setTimeout(() => clearInterval(interval), 20000)
      return () => {
        clearTimeout(t)
        clearTimeout(stop)
        clearInterval(interval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Read image size preference
  useEffect(() => {
    try {
      const pref = localStorage.getItem('seatcg_pref_history_img_size')
      const map: Record<string, string> = { small: '96px', medium: '140px', large: '180px' }
      if (pref && map[pref]) setImgSizeVar(map[pref])
    } catch {}
  }, [])

  const visibleOrders = orders.filter((order) => {
    const q = filters.q.trim().toLowerCase()
    const total = Number(order.total)
    const created = order.created_at ? new Date(order.created_at) : null

    if (q) {
      const hasMatch = (order.items || []).some((it: any) =>
        (it.product_name || '').toLowerCase().includes(q),
      )
      if (!hasMatch) return false
    }
    if (filters.minTotal) {
      const min = Number(filters.minTotal)
      if (!Number.isNaN(min) && total < min) return false
    }
    if (filters.maxTotal) {
      const max = Number(filters.maxTotal)
      if (!Number.isNaN(max) && total > max) return false
    }
    if (filters.startDate && created) {
      const sd = new Date(filters.startDate)
      if (created < sd) return false
    }
    if (filters.endDate && created) {
      const ed = new Date(filters.endDate)
      ed.setHours(23, 59, 59, 999)
      if (created > ed) return false
    }
    return true
  })

  if (!isAuthenticated()) {
    return (
      <div className="page-container-md">
        <div className="card-sm p-6">
          <h1 className="text-3xl m-0 mb-4">Historial de compras</h1>
          <p className="py-4 font-semibold text-center">Debes iniciar sesión para ver tu historial.</p>
          <button type="button" className="btn-primary block mx-auto" onClick={() => router.push('/login')}>
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container-md" style={{ '--history-img-size': imgSizeVar } as React.CSSProperties}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-3xl">Historial de compras</h1>
        <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.back()}>
          ← Volver
        </button>
      </div>

      <div className="card p-4 mb-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-xs uppercase tracking-wider">Nombre de carta</label>
          <input type="text" placeholder="Buscar dentro del historial..." value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            maxLength={20}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-xs uppercase tracking-wider">Total mín.</label>
          <input type="number" min="0" max="999" value={filters.minTotal}
            onChange={(e) => {
              const val = e.target.value
              if (val === '' || (Number(val) >= 0 && Number(val) <= 999)) {
                setFilters((f) => ({ ...f, minTotal: val }))
              }
            }}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-xs uppercase tracking-wider">Total máx.</label>
          <input type="number" min="0" max="999" value={filters.maxTotal}
            onChange={(e) => {
              const val = e.target.value
              if (val === '' || (Number(val) >= 0 && Number(val) <= 999)) {
                setFilters((f) => ({ ...f, maxTotal: val }))
              }
            }}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-xs uppercase tracking-wider">Desde</label>
          <input type="date" min="2020-01-01" value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-xs uppercase tracking-wider">Hasta</label>
          <input type="date" value={filters.endDate} max="2050-12-31"
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="border-2 border-black rounded-lg px-3 py-2 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
        </div>
      </div>

      {showSuccessBanner && (
        <div className="mb-4 p-3 rounded-xl font-semibold" style={{ background: '#d7ffd9', border: '2px solid #17a34a', color: '#0f5132' }}>
          ¡Pago completado! Tu pedido está siendo procesado.
        </div>
      )}

      {loading && <p className="py-4 font-semibold text-center">Cargando historial...</p>}
      {error && <p className="py-4 font-semibold text-center" style={{ color: '#d83000' }}>{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {visibleOrders.length === 0 ? (
            <div className="bg-white border-[3px] border-black rounded-[20px] p-6">
              <p className="py-4 font-semibold text-center">No tienes compras registradas todavía.</p>
              <button type="button" className="btn-primary block mx-auto" onClick={() => router.push('/')}>Explorar cartas</button>
            </div>
          ) : (
            visibleOrders.map((order) => (
              <div key={order.id} className="bg-white border-[3px] border-black rounded-[20px] p-5">
                <div className="flex justify-between items-baseline">
                  <h2 className="m-0 text-xl">Orden #{order.id}</h2>
                  <span className="text-sm text-muted">
                    {order.created_at ? new Date(order.created_at).toLocaleString() : 'Fecha no disponible'}
                  </span>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  {(order.items || []).map((item: any) => (
                    <div key={`${order.id}-${item.product_id}-${item.product_name}`} className="grid items-center gap-4" style={{ gridTemplateColumns: 'var(--history-img-size, 140px) 1fr auto' }}>
                      <div className="rounded-xl flex items-center justify-center overflow-hidden" style={{ width: 'var(--history-img-size, 140px)', height: 'var(--history-img-size, 140px)', background: '#fef7e7' }}>
                        <img src={item.product_image || FALLBACK_CARD_IMAGE} alt={item.product_name} className="w-full h-full object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.15)]" />
                      </div>
                      <div className="flex gap-2 items-baseline">
                        <strong>{item.product_name}</strong>
                        <span className="text-sm text-muted">Cantidad: {item.quantity}</span>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.price)}</div>
                    </div>
                  ))}
                </div>
                <div className="total-bar mt-4">
                  <span>Total</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="page-container-md"><p className="status-msg">Cargando...</p></div>}>
      <HistoryContent />
    </Suspense>
  )
}
