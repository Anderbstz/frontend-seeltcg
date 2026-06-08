'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Card from '@/components/Card'
import { translateType, translateRarity } from '@/lib/translations'
import { API_URL } from '@/lib/config'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [advancedMode, setAdvancedMode] = useState(false)
  const [name, setName] = useState('')
  const [artist, setArtist] = useState('')
  const [type, setType] = useState('')
  const [rarity, setRarity] = useState('')
  const [selectedSet, setSelectedSet] = useState('')

  const [types, setTypes] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [sets, setSets] = useState<string[]>([])

  useEffect(() => {
    fetchFilterOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const qsQuery = searchParams.get('q') ?? ''
    const qsType = searchParams.get('type') ?? ''
    const qsRarity = searchParams.get('rarity') ?? ''
    const qsSet = searchParams.get('set') ?? ''
    const qsArtist = searchParams.get('artist') ?? ''
    const qsName = searchParams.get('name') ?? ''

    setQuery(qsQuery)
    setName(qsName)
    setArtist(qsArtist)
    setType(qsType)
    setRarity(qsRarity)
    setSelectedSet(qsSet)

    const hasAdvancedParams = qsType || qsRarity || qsSet || qsArtist || qsName

    if (hasAdvancedParams) {
      setAdvancedMode(true)
      handleAdvancedSearch({ name: qsName || qsQuery, artist: qsArtist, type: qsType, rarity: qsRarity, set: qsSet }, false)
    } else if (qsQuery) {
      handleSimpleSearch(qsQuery, false)
    } else {
      setCards([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchFilterOptions = async () => {
    try {
      const [typesRes, raritiesRes, setsRes] = await Promise.all([
        fetch(`${API_URL}/cards/types/`),
        fetch(`${API_URL}/cards/rarities/`),
        fetch(`${API_URL}/cards/sets/`),
      ])
      if (typesRes.ok) {
        const typesData = await typesRes.json()
        setTypes(Array.isArray(typesData) ? typesData : [])
      }
      if (raritiesRes.ok) {
        const raritiesData = await raritiesRes.json()
        setRarities(Array.isArray(raritiesData) ? raritiesData : [])
      }
      if (setsRes.ok) {
        const setsData = await setsRes.json()
        setSets(Array.isArray(setsData) ? setsData : [])
      }
    } catch (fetchError) {
      console.error('Error fetching filter options:', fetchError)
    }
  }

  const handleSimpleSearch = async (searchQuery: string, shouldUpdateParams = true) => {
    if (!searchQuery.trim()) {
      setCards([])
      return
    }
    if (shouldUpdateParams) {
      const params = new URLSearchParams({ q: searchQuery })
      router.push(`/search?${params.toString()}`)
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/cards/search/?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) throw new Error('Error en la búsqueda')
      const data = await response.json()
      setCards(Array.isArray(data) ? data : data.results || [])
    } catch (fetchError: any) {
      setError(fetchError.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleAdvancedSearch = async (overrides: Record<string, string> = {}, shouldUpdateParams = true) => {
    const params = new URLSearchParams()
    const payload = {
      name: overrides.name ?? name,
      artist: overrides.artist ?? artist,
      type: overrides.type ?? type,
      rarity: overrides.rarity ?? rarity,
      set: overrides.set ?? selectedSet,
    }
    Object.entries(payload).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    if (shouldUpdateParams) {
      router.push(`/search?${params.toString()}`)
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/cards/search/advanced/?${params.toString()}`)
      if (!response.ok) throw new Error('Error en la búsqueda avanzada')
      const data = await response.json()
      setCards(Array.isArray(data) ? data : data.results || [])
    } catch (fetchError: any) {
      setError(fetchError.message ?? 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (advancedMode) {
      handleAdvancedSearch()
    } else {
      handleSimpleSearch(query)
    }
  }

  return (
    <div className="px-[5vw] py-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="m-0 text-3xl sm:text-4xl">Búsqueda de Cartas</h1>
        <button
          type="button"
          className="btn-outline w-full sm:w-auto"
          onClick={() => setAdvancedMode(!advancedMode)}
        >
          {advancedMode ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 mb-8">
        {!advancedMode ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="search"
              placeholder="Buscar carta, set o artista..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-2 border-black rounded-full px-6 py-3 text-base w-full"
              style={{ fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }}
            />
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Buscar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm uppercase tracking-wider">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la carta"
                  className="input-field" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm uppercase tracking-wider">Artista</label>
                <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Nombre del artista"
                  className="input-field" />
              </div>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm uppercase tracking-wider">Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="input-field">
                  <option value="">Todos</option>
                  {types.map((t) => <option key={t} value={t}>{translateType(t)}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm uppercase tracking-wider">Rareza</label>
                <select value={rarity} onChange={(e) => setRarity(e.target.value)}
                  className="input-field">
                  <option value="">Todas</option>
                  {rarities.map((r) => <option key={r} value={r}>{translateRarity(r)}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm uppercase tracking-wider">Set</label>
                <select value={selectedSet} onChange={(e) => setSelectedSet(e.target.value)}
                  className="input-field">
                  <option value="">Todos</option>
                  {sets.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary self-start">
              Buscar
            </button>
          </div>
        )}
      </form>

      {loading && <p className="status-msg">Buscando cartas...</p>}
      {error && !loading && <p className="status-msg text-accent">{error}</p>}
      {!loading && !error && cards.length === 0 && (query || advancedMode) && (
        <p className="status-msg">No se encontraron cartas.</p>
      )}

      {cards.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-6 text-2xl">{cards.length} resultados encontrados</h2>
          <div className="grid-cards">
            {cards.map((card: any) => <Card key={card.id} card={card} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="px-[5vw] py-8 max-w-[1400px] mx-auto"><p className="status-msg">Cargando...</p></div>}>
      <SearchContent />
    </Suspense>
  )
}
