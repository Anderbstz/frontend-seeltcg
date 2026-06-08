'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { auth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth) {
      router.push('/login')
    } else if (auth.user?.role !== 'ROLE_ADMIN') {
      router.push('/')
    }
  }, [auth, router])

  if (!auth || auth.user?.role !== 'ROLE_ADMIN') return null
  return <>{children}</>
}
