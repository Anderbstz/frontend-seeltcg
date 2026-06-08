'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Card from '@/components/Card'
import HeroSlide from '@/components/HeroSlide'
import { CARDS_URL, API_URL } from '@/lib/config'

const heroSlides = [
  {
    id: 'slide-1',
    title: 'Rayo Doble',
    subtitle: 'Velocidad y presión Lightning',
    combo: 'Zapdos + Wash Rotom',
    priceLabel: 'S/ 31.90',
    offerSlug: 'rayo-doble',
    cards: ['xy6-23', 'pl2-RT5'],
    images: ['https://images.pokemontcg.io/xy6/23.png', 'https://images.pokemontcg.io/pl2/RT5.png'],
    includes: ['2 cartas originales', 'Toploader', 'Sleeves premium'],
  },
  {
    id: 'slide-2',
    title: 'Golpe de Agua',
    subtitle: 'Control y defensa con Water',
    combo: 'Floatzel GL + Wash Rotom',
    priceLabel: 'S/ 34.50',
    offerSlug: 'golpe-de-agua',
    cards: ['pl2-104', 'pl2-RT5'],
    images: ['https://images.pokemontcg.io/pl2/104.png', 'https://images.pokemontcg.io/pl2/RT5.png'],
    includes: ['2 cartas originales', 'Toploader', 'Sleeves premium'],
  },
  {
    id: 'slide-3',
    title: 'Psíquicos Legend',
    subtitle: 'Estrategia y control Psychic',
    combo: 'Deoxys + Clefable',
    priceLabel: 'S/ 33.90',
    offerSlug: 'psiquicos-legendarios',
    cards: ['col1-2', 'col1-1'],
    images: ['https://images.pokemontcg.io/col1/2.png', 'https://images.pokemontcg.io/col1/1.png'],
    includes: ['2 cartas originales', 'Toploader', 'Sleeves premium'],
  },
  {
    id: 'slide-4',
    title: 'Selva Dúo',
    subtitle: 'Presión constante desde la hierba',
    combo: 'Cacnea + Caterpie',
    priceLabel: 'S/ 24.50',
    offerSlug: 'selva-duo',
    cards: ['ex16-46', 'swsh2-1'],
    images: ['https://images.pokemontcg.io/ex16/46.png', 'https://images.pokemontcg.io/swsh2/1.png'],
    includes: ['2 cartas originales', 'Toploader', 'Sleeves premium'],
  },
  {
    id: 'slide-5',
    title: 'Golpe de Arena',
    subtitle: 'Dominio del terreno',
    combo: 'Gliscor + Groudon',
    priceLabel: 'S/ 37.50',
    offerSlug: 'golpe-de-arena',
    cards: ['hgss3-4', 'col1-6'],
    images: ['https://images.pokemontcg.io/hgss3/4.png', 'https://images.pokemontcg.io/col1/6.png'],
    includes: ['2 cartas originales', 'Toploader', 'Sleeves premium'],
  },
]

export default function Home() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSlide, setActiveSlide] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20
  const [typeFilters, setTypeFilters] = useState<string[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const fetchCards = useCallback(async (page = 1) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${CARDS_URL}/?page=${page}&pageSize=${pageSize}`)
      if (!response.ok) throw new Error('No pudimos cargar las cartas, intenta de nuevo.')
      const data = await response.json()
      if (Array.isArray(data)) {
        setCards(data)
        setTotalPages(1)
      } else {
        setCards(data.results ?? [])
        const totalCount = data.total ?? data.count ?? data.results?.length ?? 0
        setTotalPages(Math.max(1, Math.ceil(totalCount / pageSize)))
      }
    } catch (fetchError: any) {
      setError(fetchError.message ?? 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchCards(currentPage)
  }, [currentPage, fetchCards])

  useEffect(() => {
    let ignore = false
    const loadTypes = async () => {
      try {
        const res = await fetch(`${API_URL}/cards/types/`)
        if (res.ok) {
          const data = await res.json()
          if (!ignore) setTypeFilters(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Error cargando tipos:', err)
      }
    }
    loadTypes()
    return () => { ignore = true }
  }, [])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <section className="grid gap-3 px-[5vw] py-3 md:grid-cols-[3fr_1fr]">
        <div className="relative overflow-hidden rounded-[28px] border-4 border-black p-3 min-h-[400px]" style={{ background: '#fce3b8' }}>
          {heroSlides.map((slide, index) => (
            <HeroSlide key={slide.id} slide={slide} isActive={index === activeSlide} />
          ))}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 flex gap-1">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className={`w-2.5 h-2.5 rounded-full border-none cursor-pointer ${index === activeSlide ? 'opacity-100' : 'opacity-40'}`}
                style={{ background: index === activeSlide ? '#d83000' : '#fff' }}
                onClick={() => setActiveSlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <aside className="hidden md:flex flex-col gap-4">
          <div className="bg-white border-[3px] border-black rounded-[20px] p-6">
            <p className="m-0 text-sm text-muted">Entrega promedio</p>
            <strong className="block text-2xl my-1 text-accent">30 min</strong>
            <small className="block text-xs text-muted">Solo Lima</small>
          </div>
          <div className="bg-white border-[3px] border-black rounded-[20px] p-6">
            <p className="m-0 text-sm text-muted">Cartas activas</p>
            <strong className="block text-2xl my-1 text-accent">{cards.length || '—'}</strong>
            <small className="block text-xs text-muted">Actualizado en vivo</small>
          </div>
          <div className="bg-white border-[3px] border-black rounded-[20px] p-6">
            <p className="m-0 text-sm text-muted">Protección</p>
            <strong className="block text-2xl my-1 text-accent">Toploader</strong>
            <small className="block text-xs text-muted">Incluida en combos</small>
          </div>
        </aside>
      </section>

      <section className="grid gap-3 px-[5vw] py-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {(typeFilters.length
          ? typeFilters
          : ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Fairy', 'Dragon', 'Colorless']
        ).map((label) => (
          <Link key={label} href={`/search?type=${encodeURIComponent(label)}`} className="no-underline">
            <button type="button" className="w-full py-3 rounded-full font-semibold uppercase cursor-pointer border-2 border-black transition-colors duration-200 hover:text-white" style={{ background: '#fff1c7' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#d83000'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1c7'; e.currentTarget.style.color = 'inherit' }}
            >
              {label}
            </button>
          </Link>
        ))}
      </section>

      <section className="px-[5vw] pb-8">
        <div className="flex justify-between items-baseline mb-6">
          <div>
            <h2 className="m-0 text-3xl">Cartas destacadas</h2>
            <p className="m-1 mt-1 text-sm text-muted">Basado en datos locales de Seatcg</p>
          </div>
          <span className="text-sm text-muted">{cards.length} resultados</span>
        </div>

        {loading && <p className="status-msg">Cargando cartas...</p>}
        {error && !loading && <p className="status-msg text-accent">{error}</p>}
        {!loading && !error && cards.length === 0 && (
          <p className="status-msg">No encontramos cartas.</p>
        )}

        <div className="grid-cards mb-8">
          {!loading && !error && cards.map((card: any) => <Card key={card.id} card={card} />)}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <span className="font-semibold">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        )}
      </section>
    </>
  )
}
