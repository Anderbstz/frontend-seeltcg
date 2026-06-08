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
      <div className="bg-white border-[3px] border-black rounded-[24px] p-12 max-w-[560px] w-full text-center">
        <h1 className="m-0 mb-4 text-3xl">¡Pago completado!</h1>
        <p className="m-0 mb-6 text-base" style={{ color: '#7a4a1b' }}>
          Gracias por tu compra. Tu pedido está siendo procesado.
        </p>
        <div className="flex gap-4 justify-center mb-4">
          <Link href="/">
            <button type="button" className="py-4 px-8 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white text-lg transition-transform duration-200 hover:-translate-y-0.5" style={{ background: '#d83000' }}>
              Explorar más cartas
            </button>
          </Link>
          <Link href="/cart">
            <button type="button" className="px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200">
              Ver carrito
            </button>
          </Link>
          <Link href="/history">
            <button type="button" className="px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200">
              Ver historial
            </button>
          </Link>
        </div>
        <p className="text-sm" style={{ color: '#7a4a1b' }}>
          Si necesitas ayuda, contáctanos por soporte.
        </p>
      </div>
    </div>
  )
}
