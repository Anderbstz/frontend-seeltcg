'use client'

import { useRouter } from 'next/navigation'

export default function CancelPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-[5vw] py-8">
      <div className="card p-12 max-w-[560px] w-full text-center">
        <h1 className="m-0 mb-4 text-3xl">Pago cancelado</h1>
        <p className="m-0 mb-6 text-base text-muted">
          Has cancelado el proceso de pago. Puedes revisar tu carrito o seguir explorando.
        </p>
        <div className="flex gap-4 justify-center mb-4">
          <button
            type="button"
            className="btn-primary-lg"
            onClick={() => router.push('/cart')}
          >
            Volver al carrito
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => router.push('/')}
          >
            Explorar cartas
          </button>
        </div>
        <p className="text-sm text-muted">
          Si crees que fue un error, intenta nuevamente.
        </p>
      </div>
    </div>
  )
}
