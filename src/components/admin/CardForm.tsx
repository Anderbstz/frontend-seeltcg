'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CardFormData } from '@/lib/api-admin'

interface CardFormProps {
  initialData?: CardFormData & { id?: string }
  onSubmit: (data: CardFormData) => Promise<void>
  loading?: boolean
}

function buildInitialForm(data: CardFormProps['initialData']): CardFormData {
  return {
    name: data?.name || '',
    set_name: data?.set_name || '',
    types: data?.types || '',
    rarity: data?.rarity || '',
    hp: data?.hp || '',
    artist: data?.artist || '',
    price: data?.price || 0,
    image_url: data?.image_url || '',
  }
}

export default function CardForm({ initialData, onSubmit, loading: externalLoading }: CardFormProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [form, setForm] = useState<CardFormData>(() => buildInitialForm(initialData))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [internalLoading, setInternalLoading] = useState(false)

  const loading = externalLoading ?? internalLoading

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!form.price || form.price <= 0) newErrors.price = 'El precio debe ser mayor a 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setInternalLoading(true)
    try {
      await onSubmit(form)
    } catch {
      setInternalLoading(false)
    }
  }

  const handleChange = (field: keyof CardFormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8 max-w-[600px]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-sm uppercase tracking-wider">
            Nombre <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Nombre de la carta"
          />
          {errors.name && <p className="text-accent text-sm m-0">{errors.name}</p>}
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">Set</label>
            <input
              type="text"
              value={form.set_name || ''}
              onChange={(e) => handleChange('set_name', e.target.value)}
              className="input-field"
              placeholder="Ej: Sword &amp; Shield"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">Tipo(s)</label>
            <input
              type="text"
              value={form.types || ''}
              onChange={(e) => handleChange('types', e.target.value)}
              className="input-field"
              placeholder="Ej: Fire, Water"
            />
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">Rareza</label>
            <input
              type="text"
              value={form.rarity || ''}
              onChange={(e) => handleChange('rarity', e.target.value)}
              className="input-field"
              placeholder="Ej: Rare Holo"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">HP</label>
            <input
              type="text"
              value={form.hp || ''}
              onChange={(e) => handleChange('hp', e.target.value)}
              className="input-field"
              placeholder="Ej: 120"
            />
          </div>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">Artista</label>
            <input
              type="text"
              value={form.artist || ''}
              onChange={(e) => handleChange('artist', e.target.value)}
              className="input-field"
              placeholder="Nombre del artista"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-sm uppercase tracking-wider">
              Precio <span className="text-accent">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price || ''}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className={`input-field ${errors.price ? 'border-red-500' : ''}`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-accent text-sm m-0">{errors.price}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-sm uppercase tracking-wider">URL de imagen</label>
          <input
            type="url"
            value={form.image_url || ''}
            onChange={(e) => handleChange('image_url', e.target.value)}
            className="input-field"
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar carta' : 'Crear carta'}
          </button>
          <button type="button" className="btn-outline" onClick={() => router.push('/admin/cards')}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
