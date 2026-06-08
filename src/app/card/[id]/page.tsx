'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { CARDS_URL } from '@/lib/config'
import { formatCurrency, getCardImage, getCardPrice, getCardSetName } from '@/utils/cards'

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const [card, setCard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`${CARDS_URL}/${id}/`)
        if (!response.ok) throw new Error('Carta no encontrada')
        const data = await response.json()
        setCard(data)
      } catch (fetchError: any) {
        setError(fetchError.message ?? 'Error al cargar la carta')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCard()
  }, [id])

  const handleAddToCart = () => {
    if (card) addToCart(card)
  }

  if (loading) {
    return (
      <div className="page-container-md">
        <p className="status-msg">Cargando carta...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="page-container-md">
        <p className="status-msg text-accent">{error || 'Carta no encontrada'}</p>
        <button type="button" className="btn-primary block mx-auto" onClick={() => router.push('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  const price = formatCurrency(getCardPrice(card))

  return (
    <div className="page-container-md">
      <button
        type="button"
        className="btn-outline mb-8"
        onClick={() => router.back()}
      >
        ← Volver
      </button>

      <div className="card-lg grid gap-8 p-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-[20px] p-8 bg-card">
          <img src={getCardImage(card)} alt={card.name} className="max-w-full h-auto object-contain" />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="m-0 text-3xl font-bold">{card.name}</h1>
            {card.rarity && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold border-2 border-black" style={{ background: '#d83000', color: '#fff' }}>{card.rarity}</span>
            )}
          </div>

          <p className="m-0 text-base"><strong>Set:</strong> {getCardSetName(card)}</p>
          {card.types && card.types.length > 0 && (
            <p className="m-0 text-base"><strong>Tipo:</strong> {card.types.join(', ')}</p>
          )}
          {card.hp && <p className="m-0 text-base"><strong>HP:</strong> {card.hp}</p>}
          {card.artist && <p className="m-0 text-base"><strong>Artista:</strong> {card.artist}</p>}

          <div className="flex flex-col gap-2 p-6 rounded-[16px] border-2 border-black bg-card">
            <span className="text-xs uppercase tracking-wider text-muted">Precio de mercado</span>
            <span className="text-3xl font-bold text-accent">{price ?? 'Consultar'}</span>
          </div>

          <button
            type="button"
            className="btn-primary-lg"
            onClick={handleAddToCart}
          >
            Añadir al carrito
          </button>

          {card.attacks && card.attacks.length > 0 && (
            <div className="mt-4 pt-6 border-t-2 border-black">
              <h3 className="m-0 mb-4 text-xl">Ataques</h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {card.attacks.map((attack: any, index: number) => (
                  <li key={index} className="p-3 rounded-lg border-2 border-black bg-card">
                    <strong>{attack.name}</strong>
                    {attack.damage && <span> - {attack.damage}</span>}
                    {attack.cost && (
                      <span className="text-sm text-muted"> Costo: {attack.cost.join(', ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
