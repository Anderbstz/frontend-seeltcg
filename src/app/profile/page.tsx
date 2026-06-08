'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL, AUTH_URL } from '@/lib/config'

const PREF_IMG_SIZE_KEY = 'pikacards_pref_history_img_size'
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREF_IMG_SIZE_KEY)
      if (stored && ['small', 'medium', 'large'].includes(stored)) setImgSizePref(stored)
    } catch {}
  }, [])

  // Load saved profile from localStorage
  useEffect(() => {
    try {
      const key = `pikacards_profile_${auth?.user?.username || 'default'}`
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
      const key = `pikacards_profile_${auth?.user?.username || 'default'}`
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
      <div className="px-[5vw] py-8 max-w-[1200px] mx-auto">
        <div className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h1 className="text-3xl m-0 mb-4">Perfil</h1>
          <p className="py-4 font-semibold text-center">Debes iniciar sesión para ver tu perfil.</p>
          <button type="button" className="block mx-auto py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={() => router.push('/login')}>
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
    if (security.next !== security.confirm) {
      setStatusMsg('La nueva contraseña no coincide')
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
    <div className="px-[5vw] py-8 max-w-[1200px] mx-auto">
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-[3px] border-black overflow-hidden" style={{ background: '#fff1c7' }}>
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : '👤'}
            </div>
            <div>
              {fullName && <h2 className="m-0">{fullName}</h2>}
              <p className="m-0 text-sm" style={{ color: '#7a4a1b' }}>@{username}</p>
              {email && <p className="m-0 text-sm" style={{ color: '#7a4a1b' }}>{email}</p>}
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
          {statusMsg && <p className="mt-3 text-sm" style={{ color: '#7a4a1b' }}>{statusMsg}</p>}
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
            <p className="text-sm m-0" style={{ color: '#7a4a1b' }}>Actual: {PREF_IMG_SIZE_MAP[imgSizePref]}px</p>
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
              className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <option value="">Selecciona una provincia</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Dirección</label>
            <input type="text" placeholder="Calle, número, referencia..." value={profileData.address}
              onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
              className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
          </div>
          <div className="flex flex-col gap-2.5 mb-4">
            <label className="font-semibold text-sm uppercase tracking-wider">Imagen de perfil</label>
            <input type="file" accept="image/*" onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
          </div>
          <button type="button" className="py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={saveProfileLocal}>Guardar</button>
        </section>

        {/* Security */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Seguridad</h3>
          <form onSubmit={changePassword} className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Contraseña actual</label>
              <input type="password" value={security.current} onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Nueva contraseña</label>
              <input type="password" value={security.next} onChange={(e) => setSecurity((s) => ({ ...s, next: e.target.value }))}
                className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-sm uppercase tracking-wider">Confirmar nueva contraseña</label>
              <input type="password" value={security.confirm} onChange={(e) => setSecurity((s) => ({ ...s, confirm: e.target.value }))}
                className="border-2 border-black rounded-lg px-3 py-2 text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }} />
            </div>
            <button type="submit" className="py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white self-start" style={{ background: '#d83000' }}>Cambiar contraseña</button>
          </form>
          <hr className="my-4 border-t-2 border-black" />
          <button type="button" className="py-2.5 px-5 rounded-xl font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#ff4d4f' }} onClick={deleteAccount}>Eliminar cuenta</button>
        </section>

        {/* Payment Method */}
        <section className="bg-white border-[3px] border-black rounded-[24px] p-6">
          <h3 className="m-0 mb-4 text-lg">Método de pago</h3>
          <p className="text-sm mb-4" style={{ color: '#7a4a1b' }}>Gestiona tus tarjetas y pagos desde el portal seguro de Stripe.</p>
          <button type="button" className="py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={managePaymentMethod}>Gestionar método de pago</button>
        </section>
      </div>
    </div>
  )
}
