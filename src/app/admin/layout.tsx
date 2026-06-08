'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AdminGuard } from '@/components/admin/AdminGuard'
import { useAuth } from '@/contexts/AuthContext'
import { FiHome, FiGrid } from 'react-icons/fi'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { auth } = useAuth()

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/cards', label: 'Cartas', icon: FiGrid },
  ]

  return (
    <AdminGuard>
      <div className="flex min-h-[70vh]">
        <aside className="w-[250px] bg-white border-r-[3px] border-black p-6 flex flex-col gap-6 shrink-0">
          <Link href="/admin" className="no-underline">
            <h2 className="text-accent m-0 text-lg font-bold">Admin</h2>
          </Link>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold no-underline transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#2f1904] hover:bg-filter'
                  }`}
                  style={isActive ? { background: '#d83000' } : {}}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-auto pt-4 border-t-2 border-black">
            <p className="text-muted text-sm m-0">{auth?.user?.username}</p>
            <p className="text-muted text-xs m-0">Administrador</p>
          </div>
        </aside>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
