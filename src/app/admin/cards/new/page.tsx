'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CardForm from '@/components/admin/CardForm'
import { adminApi } from '@/lib/api-admin'
import type { CardFormData } from '@/lib/api-admin'

export default function NewCardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (data: CardFormData) => {
    setLoading(true)
    setError('')
    try {
      await adminApi.createCard(data)
      router.push('/admin/cards')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear carta')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl m-0">Nueva carta</h1>
        <p className="text-muted text-sm m-0 mt-1">Agregar una carta al catálogo</p>
      </div>

      {error && (
        <div
          className="mb-4 p-4 rounded-xl font-semibold border-2"
          style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}
        >
          {error}
        </div>
      )}

      <CardForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
