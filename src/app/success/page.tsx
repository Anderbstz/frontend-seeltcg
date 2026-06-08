'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

export default function SuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-[5vw] py-8">
      <div className="card p-12 max-w-[560px] w-full text-center">
        <h1 className="m-0 mb-4 text-3xl">¡Pago completado!</h1>
        <p className="m-0 mb-6 text-base text-muted">
          Gracias por tu compra. Tu pedido está siendo procesado.
        </p>
        <div className="flex gap-4 justify-center mb-4">
          <Link href="/">
            <button type="button" className="btn-primary-lg">
              Explorar más cartas
            </button>
          </Link>
          <Link href="/cart">
            <button type="button" className="btn-outline">
              Ver carrito
            </button>
          </Link>
          <Link href="/history">
            <button type="button" className="btn-outline">
              Ver historial
            </button>
          </Link>
        </div>
        <p className="text-sm text-muted">
          Si necesitas ayuda, contáctanos por soporte.
        </p>
      </div>
    </div>
  )
}
