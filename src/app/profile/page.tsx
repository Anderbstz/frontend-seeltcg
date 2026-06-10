'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL, AUTH_URL } from '@/lib/config'
import { FiEye, FiEyeOff } from 'react-icons/fi'

const PREF_IMG_SIZE_KEY = 'seatcg_pref_history_img_size'
const PREF_IMG_SIZE_MAP: Record<string, number> = { small: 96, medium: 140, large: 180 }

const provinces = [
  'Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Junín', 'Lambayeque',
  'Ancash', 'Ica', 'Callao', 'Puno', 'Tacna', 'Ayacucho', 'Cajamarca',
]

export default function ProfilePage() {
  const router = useRouter()
  const { auth, isAuthenticated, logout, getAuthHeaders } = useAuth()
  const [imgSizePref, setImgSizePref] = useState('medium')
  const [profileData, setProfileData] = useState({ province: '', address: '', avatar: '' })
  const [security, setSecurity] = useState({ current: '', next: '', confirm: '' })
  const [statusMsg, setStatusMsg] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_IMG_SIZE_KEY)
      if (stored && ['small', 'medium', 'large'].includes(stored)) setImgSizePref(stored)
    } catch {}
  }, [])

  // Load saved profile from localStorage
  useEffect(() => {
    try {
      const key = `seatcg_profile_${auth?.user?.username || 'default'}`
      const saved = localStorage.getItem(key)
      if (saved) {
        const parsed = JSON.parse(saved)
        setProfileData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [auth?.user?.username])

  useEffect(() => {
    try {
      localStorage.setItem(PREF_IMG_SIZE_KEY, imgSizePref)
    } catch {}
  }, [imgSizePref])

  const saveProfileLocal = () => {
    try {
      const key = `seatcg_profile_${auth?.user?.username || 'default'}`
      localStorage.setItem(key, JSON.stringify(profileData))
      setStatusMsg('Datos de perfil guardados localmente')
      setTimeout(() => setStatusMsg(''), 3000)
    } catch {
      setStatusMsg('No se pudo guardar el perfil')
    }
  }

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setProfileData((p) => ({ ...p, avatar: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated()) {
    return (
      <div className="page-container-md">
        <div className="card p-6">
          <h1 className="text-3xl m-0 mb-4">Perfil</h1>
          <p className="py-4 font-semibold text-center">Debes iniciar sesión para ver tu perfil.</p>
          <button type="button" className="btn-primary block mx-auto" onClick={() => router.push('/login')}>
            Iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  const username = auth?.user?.username ?? 'Entrenador'
  const email = auth?.user?.email ?? ''
  const firstName = auth?.user?.first_name || ''
  const lastName = auth?.user?.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMsg('')
    setPasswordErrors({})

    const errors: Record<string, string> = {}
    if (!security.current) errors.current = 'La contraseña actual es obligatoria'
    if (!security.next) errors.next = 'La nueva contraseña es obligatoria'
    else if (security.next.length < 8) errors.next = 'Mínimo 8 caracteres'
    else if (security.next.length > 20) errors.next = 'Máximo 20 caracteres'
    else if (!/(?=.*[0-9])/.test(security.next)) errors.next = 'Debe tener al menos un número'
    else if (!/(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]])/.test(security.next)) errors.next = 'Debe tener al menos un carácter especial'
    if (security.next !== security.confirm) errors.confirm = 'Las contraseñas no coinciden'

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }
    try {
      const res = await fetch(`${AUTH_URL}/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ current_password: security.current, new_password: security.next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña')
      setStatusMsg('Contraseña actualizada correctamente')
      setSecurity({ current: '', next: '', confirm: '' })
      setTimeout(() => setStatusMsg(''), 4000)
    } catch (err: any) {
      setStatusMsg(err.message)
    }
  }

  const deleteAccount = async () => {
    const confirmText = prompt('Escribe DELETE para confirmar eliminación de tu cuenta:')
    if (!confirmText) return
    const password = prompt('Ingresa tu contraseña para confirmar:')
    if (!password) return
    try {
      const res = await fetch(`${AUTH_URL}/delete-account/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ confirm: confirmText, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar la cuenta')
      logout()
      router.push('/')
    } catch (err: any) {
      setStatusMsg(err.message)
    }
  }

  const managePaymentMethod = async () => {
    try {
      const res = await fetch(`${API_URL}/billing/portal/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo abrir el portal de pagos')
      window.location.href = data.url
    } catch (err: any) {
      setStatusMsg(err.message)
    }
  }

  return (
    <div className="page-container-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="m-0 text-3xl">Mi perfil</h1>
        <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.back()}>
          ← Volver
        </button>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Identity Card */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-[3px] border-black overflow-hidden bg-filter">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : '👤'}
            </div>
            <div>
              {fullName && <h2 className="m-0">{fullName}</h2>}
              <p className="m-0 text-sm text-muted">@{username}</p>
              {email && <p className="m-0 text-sm text-muted">{email}</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.push('/history')}>
              Ver historial
            </button>
            <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
          {statusMsg && <p className="mt-3 text-sm text-muted">{statusMsg}</p>}
        </section>

        {/* Preferences */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Preferencias</h3>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Tamaño de imagen en historial</label>
            <div className="flex gap-2">
              {['small', 'medium', 'large'].map((opt) => (
                <label key={opt} className={`px-3 py-1.5 rounded-full cursor-pointer border-2 border-black ${imgSizePref === opt ? 'text-white' : ''}`}
                  style={imgSizePref === opt ? { background: '#d83000' } : {}}>
                  <input type="radio" name="imgSize" value={opt} checked={imgSizePref === opt}
                    onChange={(e) => setImgSizePref(e.target.value)} className="hidden" />
                  {opt === 'small' ? 'Pequeña' : opt === 'medium' ? 'Mediana' : 'Grande'}
                </label>
              ))}
            </div>
            <p className="text-sm m-0 text-muted">Actual: {PREF_IMG_SIZE_MAP[imgSizePref]}px</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <label className="font-semibold text-sm uppercase tracking-wider">Accesos rápidos</label>
            <div className="flex gap-2">
              <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.push('/search')}>Buscar cartas</button>
              <button type="button" className="px-4 py-2 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.push('/cart')}>Ver carrito</button>
            </div>
          </div>
        </section>

        {/* Shipping Data */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Datos de envío</h3>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Provincia</label>
            <select value={profileData.province} onChange={(e) => setProfileData((p) => ({ ...p, province: e.target.value }))}
              className="input-field">
              <option value="">Selecciona una provincia</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Dirección</label>
            <input type="text" placeholder="Calle, número, referencia..." value={profileData.address}
              onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
              maxLength={50}
              className="input-field" />
          </div>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Imagen de perfil</label>
            <input type="file" accept="image/*" onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              className="input-field" />
          </div>
          <button type="button" className="btn-primary" onClick={saveProfileLocal}>Guardar</button>
        </section>

        {/* Security */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Seguridad</h3>
          <form onSubmit={changePassword} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Contraseña actual</label>
              <div className="relative">
                <input type={showPwd.current ? 'text' : 'password'} value={security.current} onChange={(e) => { setSecurity((s) => ({ ...s, current: e.target.value })); setPasswordErrors((p) => { const c = {...p}; delete c.current; return c }) }} maxLength={20}
                  className={`input-field w-full ${passwordErrors.current ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPwd((prev) => ({ ...prev, current: !prev.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted hover:text-accent p-0" aria-label={showPwd.current ? 'Ocultar' : 'Mostrar'}>
                  {showPwd.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {passwordErrors.current && <p className="text-accent text-xs m-0">{passwordErrors.current}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Nueva contraseña</label>
              <div className="relative">
                <input type={showPwd.next ? 'text' : 'password'} value={security.next} onChange={(e) => { setSecurity((s) => ({ ...s, next: e.target.value })); setPasswordErrors((p) => { const c = {...p}; delete c.next; return c }) }} maxLength={20}
                  className={`input-field w-full ${passwordErrors.next ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPwd((prev) => ({ ...prev, next: !prev.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted hover:text-accent p-0" aria-label={showPwd.next ? 'Ocultar' : 'Mostrar'}>
                  {showPwd.next ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {passwordErrors.next && <p className="text-accent text-xs m-0">{passwordErrors.next}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Confirmar nueva contraseña</label>
              <div className="relative">
                <input type={showPwd.confirm ? 'text' : 'password'} value={security.confirm} onChange={(e) => { setSecurity((s) => ({ ...s, confirm: e.target.value })); setPasswordErrors((p) => { const c = {...p}; delete c.confirm; return c }) }} maxLength={20}
                  className={`input-field w-full ${passwordErrors.confirm ? 'border-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPwd((prev) => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-muted hover:text-accent p-0" aria-label={showPwd.confirm ? 'Ocultar' : 'Mostrar'}>
                  {showPwd.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {passwordErrors.confirm && <p className="text-accent text-xs m-0">{passwordErrors.confirm}</p>}
            </div>
            <button type="submit" className="btn-primary self-start">Cambiar contraseña</button>
          </form>
          <hr className="my-4 border-t-2 border-black" />
          <button type="button" className="btn-danger" onClick={deleteAccount}>Eliminar cuenta</button>
        </section>

        {/* Payment Method */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Método de pago</h3>
          <p className="text-sm mb-4 text-muted">Gestiona tus tarjetas y pagos desde el portal seguro de Stripe.</p>
          <button type="button" className="btn-primary" onClick={managePaymentMethod}>Gestionar método de pago</button>
        </section>
      </div>
    </div>
  )
}
