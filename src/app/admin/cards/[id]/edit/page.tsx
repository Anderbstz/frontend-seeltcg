'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CardForm from '@/components/admin/CardForm'
import { adminApi, type CardFormData, type AdminCard } from '@/lib/api-admin'

export default function EditCardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [card, setCard] = useState<AdminCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCard = async () => {
      setLoading(true)
      setError('')
      try {
        const cards = await adminApi.getCards()
        const found = cards.find((c) => c.id === id)
        if (!found) throw new Error('Carta no encontrada')
        setCard(found)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar carta')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCard()
  }, [id])

  const handleSubmit = async (data: CardFormData) => {
    if (!id) return
    setSaving(true)
    setError('')
    try {
      await adminApi.updateCard(id, data)
      router.push('/admin/cards')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar carta')
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="status-msg">Cargando carta...</p>
  }

  if (error && !card) {
    return (
      <div>
        <p className="status-msg text-accent">{error}</p>
        <div className="text-center">
          <button type="button" className="btn-outline" onClick={() => router.push('/admin/cards')}>
            Volver al listado
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl m-0">Editar carta</h1>
        <p className="text-muted text-sm m-0 mt-1">{card?.name}</p>
      </div>

      {error && (
        <div
          className="mb-4 p-4 rounded-xl font-semibold border-2"
          style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}
        >
          {error}
        </div>
      )}

      {card && (
        <CardForm
          key={card.id}
          initialData={{ ...card, id: card.id }}
          onSubmit={handleSubmit}
          loading={saving}
        />
      )}
    </div>
  )
}
