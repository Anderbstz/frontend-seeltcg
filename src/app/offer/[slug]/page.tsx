'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { CARDS_URL } from '@/lib/config'
import { formatCurrency, getCardImage, getCardPrice } from '@/utils/cards'

const OFFERS = [
  {
    slug: 'rayo-doble',
    title: 'Rayo Doble',
    subtitle: 'Velocidad y presión Lightning',
    combo: 'Zapdos + Wash Rotom',
    priceLabel: 'S/ 31.90',
    cards: ['xy6-23', 'pl2-RT5'],
    includes: ['2 cartas originales', 'Toploader protector incluido', 'Sleeves premium', 'Entrega local 30 min (Lima)'],
  },
  {
    slug: 'golpe-de-agua',
    title: 'Golpe de Agua',
    subtitle: 'Control y defensa con Water',
    combo: 'Floatzel GL + Wash Rotom',
    priceLabel: 'S/ 34.50',
    cards: ['pl2-104', 'pl2-RT5'],
    includes: ['2 cartas originales', 'Toploader protector incluido', 'Sleeves premium', 'Entrega local 30 min (Lima)'],
  },
  {
    slug: 'psiquicos-legendarios',
    title: 'Psíquicos Legendarios',
    subtitle: 'Estrategia y control Psychic',
    combo: 'Deoxys + Clefable',
    priceLabel: 'S/ 33.90',
    cards: ['col1-2', 'col1-1'],
    includes: ['2 cartas originales', 'Toploader protector incluido', 'Sleeves premium', 'Entrega local 30 min (Lima)'],
  },
  {
    slug: 'selva-duo',
    title: 'Selva Dúo',
    subtitle: 'Presión constante desde la hierba',
    combo: 'Cacnea + Caterpie',
    priceLabel: 'S/ 24.50',
    cards: ['ex16-46', 'swsh2-1'],
    includes: ['2 cartas originales', 'Toploader protector incluido', 'Sleeves premium', 'Entrega local 30 min (Lima)'],
  },
  {
    slug: 'golpe-de-arena',
    title: 'Golpe de Arena',
    subtitle: 'Dominio del terreno',
    combo: 'Gliscor + Groudon',
    priceLabel: 'S/ 37.50',
    cards: ['hgss3-4', 'col1-6'],
    includes: ['2 cartas originales', 'Toploader protector incluido', 'Sleeves premium', 'Entrega local 30 min (Lima)'],
  },
]

export default function OfferPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { addToCart } = useCart()
  const offer = useMemo(() => OFFERS.find((o) => o.slug === slug), [slug])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      if (!offer) {
        setError('Oferta no encontrada')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const responses = await Promise.all(offer.cards.map((id) => fetch(`${CARDS_URL}/${id}/`)))
        const failed = responses.find((r) => !r.ok)
        if (failed) throw new Error('No se pudo cargar la oferta')
        const data = await Promise.all(responses.map((r) => r.json()))
        setItems(data)
      } catch (e: any) {
        setError(e.message ?? 'Error al cargar la oferta')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [offer])

  const totalPrice = items.reduce((acc, c) => acc + getCardPrice(c), 0)

  const handleBuy = () => {
    items.forEach((card) => addToCart(card))
    router.push('/cart')
  }

  if (!offer) {
    return (
      <div className="px-[5vw] py-8">
        <p className="py-8 font-semibold text-center" style={{ color: '#d83000' }}>Oferta no encontrada</p>
        <button type="button" className="block mx-auto py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white" style={{ background: '#d83000' }} onClick={() => router.push('/')}>Volver al inicio</button>
      </div>
    )
  }

  return (
    <div className="px-[5vw] py-8">
      <button type="button" className="mb-8 px-5 py-2.5 rounded-full font-semibold cursor-pointer border-2 border-black bg-white hover:bg-[#d83000] hover:text-white transition-colors duration-200" onClick={() => router.back()}>
        ← Volver
      </button>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider m-0" style={{ color: '#d83000' }}>{offer.combo}</p>
        <h1 className="m-2 text-[clamp(1.5rem,2vw,2.2rem)]" style={{ fontFamily: "'Press Start 2P', cursive" }}>{offer.title}</h1>
        <p className="text-base" style={{ color: '#7a4a1b' }}>{offer.subtitle}</p>
        <p className="text-sm" style={{ color: '#7a4a1b' }}>
          Incluye: {(offer.includes || ['2 cartas originales', 'Toploader', 'Sleeves premium']).slice(0, 3).join(', ')}.{' '}
          <strong>Stock limitado — ¡aprovecha el combo ahora!</strong>
        </p>
      </div>

      {loading && <p className="py-8 font-semibold text-center">Cargando oferta...</p>}
      {error && !loading && <p className="py-8 font-semibold text-center" style={{ color: '#d83000' }}>{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 rounded-[28px] border-4 border-black p-6 justify-items-center" style={{ gridTemplateColumns: '1.7fr 0.5fr', background: '#fce3b8' }}>
          <div className="flex items-center justify-center gap-3">
            {items.map((card) => (
              <img key={card.id} src={getCardImage(card)} alt={card.name} className="w-[48%] h-[460px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)]" />
            ))}
          </div>
          <aside className="flex flex-col gap-4">
            <div className="bg-white border-[3px] border-black rounded-[20px] p-4">
              {items.map((card) => (
                <div key={card.id} className="flex justify-between mb-2 last:mb-0">
                  <strong>{card.name}</strong>
                  <span>{formatCurrency(getCardPrice(card))}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center text-white border-[3px] border-black rounded-[20px] px-4 py-3" style={{ background: '#d83000' }}>
              <span>Total</span>
              <strong>{formatCurrency(totalPrice)}</strong>
            </div>
            <button type="button" className="py-2.5 px-5 rounded-[18px] font-bold uppercase cursor-pointer border-[3px] border-black text-white transition-transform duration-200 hover:-translate-y-0.5" style={{ background: '#d83000' }} onClick={handleBuy}>
              Comprar ahora
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
