'use client'

import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface ModalConfirmProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export default function ModalConfirm({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  loading = false,
}: ModalConfirmProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="card p-8 max-w-[420px] w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold m-0">{title}</h3>
          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-muted hover:text-accent"
            onClick={onCancel}
          >
            <FiX size={20} />
          </button>
        </div>
        <p className="text-muted mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
