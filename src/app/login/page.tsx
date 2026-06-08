'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, register, loginWithGoogle } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const initRef = useRef(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let result
      if (isLogin) {
        result = await login(formData.username, formData.password)
      } else {
        result = await register(formData.username, formData.email, formData.password)
        if (result.success) {
          const loginResult = await login(formData.username, formData.password)
          if (loginResult.success) {
            router.push('/')
            return
          }
        }
      }
      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Error al procesar la solicitud')
      }
    } catch (error) {
      console.error('Error en autenticación', error)
      setError('Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  // Load Google Identity Services script and render button
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      setError('Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en el frontend (.env)')
      return
    }

    const onLoad = () => {
      if (!(window as any).google || !googleButtonRef.current) return
      ;(window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (!response.credential) return
          const result = await loginWithGoogle(response.credential)
          if (result.success) {
            router.push('/')
          } else if (result.error) {
            setError(result.error)
          }
        },
      })
      ;(window as any).google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
      })
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')

    if (existingScript) {
      if (existingScript.getAttribute('data-loaded') === 'true') {
        onLoad()
      } else {
        existingScript.addEventListener('load', onLoad)
      }
      return () => {
        existingScript.removeEventListener('load', onLoad)
      }
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      script.setAttribute('data-loaded', 'true')
      onLoad()
    }
    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', onLoad)
    }
  }, [loginWithGoogle, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-[5vw] py-8">
      <div className="card p-12 max-w-[450px] w-full">
        <h1 className="m-0 mb-6 text-3xl text-center">{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h1>

        <button
          type="button"
          className="w-full py-2.5 px-5 rounded-full font-semibold cursor-pointer border-2 mb-6 transition-colors duration-200 hover:text-white"
          style={{ borderColor: '#d83000', color: '#d83000', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#d83000'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#d83000' }}
          onClick={() => {
            setIsLogin(!isLogin)
            setError('')
            setFormData({ username: '', email: '', password: '' })
          }}
        >
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-xl font-semibold text-center border-2" style={{ background: '#ffe6e6', borderColor: '#d83000', color: '#d83000' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="font-semibold text-sm uppercase tracking-wider">Usuario</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="Tu nombre de usuario"
              className="input-field outline-none" />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-sm uppercase tracking-wider">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="tu@email.com"
                className="input-field outline-none" />
          </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-semibold text-sm uppercase tracking-wider">Contraseña</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••"
              className="input-field outline-none" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary-lg disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div ref={googleButtonRef} className="mt-4 flex justify-center" />

        <Link href="/" className="block text-center mt-6 font-semibold no-underline text-muted">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
