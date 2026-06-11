'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AUTH_URL } from '@/lib/config'

export default function ResetPasswordPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setStatus('error')
      setMessage('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      setStatus('error')
      setMessage('Mínimo 6 caracteres')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${AUTH_URL}/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setStatus('success')
      setMessage('Contraseña actualizada correctamente')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl font-bold">Enlace inválido</p>
          <Link href="/forgot-password" className="underline mt-4 block">Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-[3px] border-black rounded-[24px] p-8">
        <h1 className="text-3xl font-bold mb-6">Nueva contraseña</h1>

        {status === 'success' ? (
          <div className="space-y-4">
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 text-green-800 font-medium">
              {message}
            </div>
            <button onClick={() => router.push('/login')}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:opacity-80 transition">
              Iniciar sesión
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block font-bold mb-1">Nueva contraseña</label>
              <input id="password" type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-[2px] border-black rounded-xl text-base"
                placeholder="••••••" />
            </div>
            <div>
              <label htmlFor="confirm" className="block font-bold mb-1">Confirmar contraseña</label>
              <input id="confirm" type="password" required
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="w-full p-3 border-[2px] border-black rounded-xl text-base"
                placeholder="••••••" />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-3 text-red-700 font-medium text-sm">
                {message}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:opacity-80 transition disabled:opacity-50">
              {loading ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
