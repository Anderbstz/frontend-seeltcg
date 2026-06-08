'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { formatCurrency, getCardImage, getCardPrice, getCardSetName } from '@/utils/cards'

interface CardProps {
  card: any
}

export default function Card({ card }: CardProps) {
  const { addToCart } = useCart()
  const price = formatCurrency(getCardPrice(card))

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(card)
  }

  return (
    <article className="card overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/card/${card.id}`} className="no-underline text-inherit flex flex-col flex-1">
        <div className="relative p-6 min-h-[260px] flex items-center justify-center bg-card">
          <img
            src={getCardImage(card)}
            alt={`Carta de ${card.name}`}
            loading="lazy"
            className="w-4/5 h-auto object-contain"
          />
          {card.rarity && (
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-xs font-semibold border-2 border-black" style={{ background: '#d83000', color: '#fff' }}>
              {card.rarity}
            </span>
          )}
        </div>
        <div className="p-6 flex flex-col gap-2 flex-1">
          <p className="uppercase text-xs tracking-wider m-0 text-muted">{getCardSetName(card)}</p>
          <h3 className="m-0 text-lg font-bold">{card.name}</h3>
          <div className="flex items-baseline gap-2 mt-auto">
            <p className="text-xl font-bold m-0">{price}</p>
            <span className="text-xs text-muted">Precio mercado</span>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className="btn-primary mx-6 mb-6"
        onClick={handleAddToCart}
      >
        Añadir al carrito
      </button>
    </article>
  )
}
