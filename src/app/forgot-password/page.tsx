'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AUTH_URL } from '@/lib/config'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${AUTH_URL}/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setStatus('sent')
      setMessage(data.message || 'Revisá tu correo')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[24px] p-8">
        <h1 className="text-3xl font-bold mb-2">Recuperar contraseña</h1>
        <p className="text-gray-600 mb-6">Te enviaremos un enlace para restablecer tu contraseña.</p>

        {status === 'sent' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-green-800 font-medium">
              {message}
            </div>
            <Link href="/login" className="block text-center font-bold underline">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-bold mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-[2px] border-black rounded-xl text-base"
                placeholder="tu@email.com"
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 text-red-700 font-medium text-sm">
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:opacity-80 transition disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <Link href="/login" className="block text-center text-sm underline">
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
