'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const { auth } = useAuth()

  return (
    <div>
      <h1 className="text-3xl m-0 mb-2">Panel de Administración</h1>
      <p className="text-muted m-0 mb-8">Bienvenido, {auth?.user?.username}</p>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        <Link href="/admin/cards" className="no-underline">
          <div className="card p-6 cursor-pointer transition-transform duration-200 hover:-translate-y-1">
            <h2 className="text-xl m-0 mb-2">Cartas</h2>
            <p className="text-muted text-sm m-0">Gestionar catálogo de cartas Pokémon</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
