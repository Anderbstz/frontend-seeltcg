'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CardTable from '@/components/admin/CardTable'
import ModalConfirm from '@/components/admin/ModalConfirm'
import { adminApi } from '@/lib/api-admin'
import type { AdminCard } from '@/lib/api-admin'

export default function AdminCardsPage() {
  const router = useRouter()
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const data = await adminApi.getCards()
        if (!cancelled) {
          setCards(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Error al cargar cartas'
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteCard(deleteTarget)
      setCards((prev) => prev.filter((c) => c.id !== deleteTarget))
      setDeleteTarget(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar carta')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl m-0">Cartas</h1>
          <p className="text-muted text-sm m-0 mt-1">Gestionar catálogo de cartas</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => router.push('/admin/cards/new')}>
          + Nueva carta
        </button>
      </div>

      {error && (
        <div
          className="mb-4 p-4 rounded-xl font-semibold border-2"
          style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}
        >
          {error}
          <button
            type="button"
            className="ml-3 underline bg-transparent border-none cursor-pointer font-semibold"
            style={{ color: '#d83000' }}
            onClick={() => setError('')}
          >
            Cerrar
          </button>
        </div>
      )}

      <CardTable cards={cards} onDelete={setDeleteTarget} loading={loading} />

      <ModalConfirm
        isOpen={!!deleteTarget}
        title="Eliminar carta"
        message="¿Estás seguro de eliminar esta carta? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
