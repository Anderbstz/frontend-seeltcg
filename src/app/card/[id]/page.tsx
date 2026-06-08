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
      <div className="px-[5vw] py-8 max-w-[1200px] mx-auto">
        <p className="py-8 font-semibold text-center">Cargando carta...</p>
      </div>
    )
  }

  if (error || !card) {
    return (
      <div className="px-[5vw] py-8 max-w-[1200px] mx-auto">
        <p className="py-8 font-semibold text-center" style={{ color: '#d83000' }}>{error || 'Carta no encontrada'}</p>
        <button type="button" className="block mx-auto py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={() => router.push('/')}>
          Volver al inicio
        </button>
      </div>
    )
  }

  const price = formatCurrency(getCardPrice(card))

  return (
    <div className="px-[5vw] py-8 max-w-[1200px] mx-auto">
      <button
        type="button"
        className="mb-8 px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200"
        onClick={() => router.back()}
      >
        ← Volver
      </button>

      <div className="grid gap-12 bg-white border-[3px] border-black rounded-[28px] p-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="flex items-center justify-center rounded-[20px] p-8" style={{ background: '#fef7e7' }}>
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

          <div className="flex flex-col gap-2 p-6 rounded-[16px] border-2 border-black" style={{ background: '#fef7e7' }}>
            <span className="text-xs uppercase tracking-wider" style={{ color: '#7a4a1b' }}>Precio de mercado</span>
            <span className="text-3xl font-bold" style={{ color: '#d83000' }}>{price ?? 'Consultar'}</span>
          </div>

          <button
            type="button"
            className="py-4 px-8 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white text-lg transition-transform duration-200 hover:-translate-y-0.5"
            style={{ background: '#d83000' }}
            onClick={handleAddToCart}
          >
            Añadir al carrito
          </button>

          {card.attacks && card.attacks.length > 0 && (
            <div className="mt-4 pt-6 border-t-2 border-black">
              <h3 className="m-0 mb-4 text-xl">Ataques</h3>
              <ul className="list-none p-0 m-0 flex flex-col gap-3">
                {card.attacks.map((attack: any, index: number) => (
                  <li key={index} className="p-3 rounded-lg border-2 border-black" style={{ background: '#fef7e7' }}>
                    <strong>{attack.name}</strong>
                    {attack.damage && <span> - {attack.damage}</span>}
                    {attack.cost && (
                      <span className="text-sm" style={{ color: '#7a4a1b' }}> Costo: {attack.cost.join(', ')}</span>
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
