'use client'

import { type ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import ChatBubble from '@/components/ChatBubble'

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell min-h-screen flex flex-col" style={{ background: '#f0d088' }}>
      <header
        className="flex justify-between px-[5vw] py-2 text-xs uppercase tracking-wider"
        style={{ background: '#d83000', color: '#fff' }}
      >
        <p className="m-0">¡ENTRENADOR! ENTREGAMOS ENVÍOS A TODO EL PERÚ, ¿QUÉ ESPERAS?</p>
      </header>
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="px-[5vw] py-8 text-sm text-center" style={{ color: '#7a4a1b' }}>
        <p className="m-0">Pokémon TCG data © Pokémon. PikaCards es un fan store independiente.</p>
      </footer>
      <ChatBubble />
    </div>
  )
}
