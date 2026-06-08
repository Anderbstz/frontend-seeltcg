import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import LayoutClient from './layout-client'

export const metadata: Metadata = {
  title: 'PikaCards - Tienda de Cartas Pokémon TCG',
  description: 'Compra y vende cartas Pokémon TCG originales. Envíos a todo el Perú.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
        </Providers>
      </body>
    </html>
  )
}
