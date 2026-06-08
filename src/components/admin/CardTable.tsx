'use client'

import Link from 'next/link'
import { formatCurrency, getCardImage } from '@/utils/cards'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import type { AdminCard } from '@/lib/api-admin'

interface CardTableProps {
  cards: AdminCard[]
  onDelete: (id: string) => void
  loading?: boolean
}

export default function CardTable({ cards, onDelete, loading }: CardTableProps) {
  if (loading) {
    return <p className="status-msg">Cargando cartas...</p>
  }

  if (cards.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted text-lg mb-4">No hay cartas registradas</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="p-3 font-semibold text-sm uppercase tracking-wider">Imagen</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider">Nombre</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider hidden md:table-cell">Set</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">Tipo</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider hidden lg:table-cell">Rareza</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider">Precio</th>
            <th className="p-3 font-semibold text-sm uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.id} className="border-b border-black/10 hover:bg-filter transition-colors duration-150">
              <td className="p-3">
                <div className="w-12 h-16 rounded-lg bg-card flex items-center justify-center overflow-hidden">
                  <img
                    src={getCardImage(card)}
                    alt={card.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </td>
              <td className="p-3 font-semibold">{card.name}</td>
              <td className="p-3 text-muted text-sm hidden md:table-cell">{card.set_name || '—'}</td>
              <td className="p-3 text-muted text-sm hidden lg:table-cell">{card.types || '—'}</td>
              <td className="p-3 text-muted text-sm hidden lg:table-cell">{card.rarity || '—'}</td>
              <td className="p-3 font-semibold text-accent">{formatCurrency(card.price)}</td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Link
                    href={`/admin/cards/${card.id}/edit`}
                    className="p-2 rounded-full border-2 border-black bg-white hover:bg-filter transition-colors duration-200"
                    aria-label={`Editar ${card.name}`}
                  >
                    <FiEdit2 size={16} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(card.id)}
                    className="p-2 rounded-full border-2 border-black bg-white hover:bg-[#ffe6e6] hover:border-[#d83000] transition-colors duration-200"
                    aria-label={`Eliminar ${card.name}`}
                  >
                    <FiTrash2 size={16} className="text-accent" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
