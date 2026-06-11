'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API_URL } from '@/lib/config'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, getCardImage, getCardPrice, getCardSetName } from '@/utils/cards'
import { translateType, translateRarity } from '@/lib/translations'
import { FiSearch, FiShoppingCart, FiUser, FiChevronDown, FiGrid } from 'react-icons/fi'

export default function Navbar() {
  const router = useRouter()
  const { cartCount } = useCart()
  const { isAuthenticated, logout, auth } = useAuth()

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showSearchPanel, setShowSearchPanel] = useState(false)

  const [menuOpen, setMenuOpen] = useState(false)
  const [types, setTypes] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [showLoginDropdown, setShowLoginDropdown] = useState(false)
  const [avatar, setAvatar] = useState('')

  const searchRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const loginDropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [typesRes, raritiesRes] = await Promise.all([
          fetch(`${API_URL}/cards/types/`),
          fetch(`${API_URL}/cards/rarities/`),
        ])
        if (typesRes.ok) {
          const data = await typesRes.json()
          setTypes(Array.isArray(data) ? data : [])
        }
        if (raritiesRes.ok) {
          const data = await raritiesRes.json()
          setRarities(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('No se pudieron cargar los filtros', error)
      }
    }
    fetchFilters()
  }, [])

  // Load avatar from localStorage
  useEffect(() => {
    const refreshAvatar = () => {
      try {
        const username = auth?.user?.username
        let nextAvatar = ''
        if (username) {
          const key = `seatcg_profile_${username}`
          const saved = localStorage.getItem(key)
          if (saved) {
            const parsed = JSON.parse(saved)
            nextAvatar = parsed?.avatar || ''
          }
        }
        if (!nextAvatar) {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (k && k.startsWith('seatcg_profile_')) {
              try {
                const val = JSON.parse(localStorage.getItem(k) || '{}')
                if (val?.avatar) {
                  nextAvatar = val.avatar
                  break
                }
              } catch {}
            }
          }
        }
        setAvatar(nextAvatar)
      } catch {
        setAvatar('')
      }
    }
    refreshAvatar()
    const onFocus = () => refreshAvatar()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [auth?.user?.username])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchPanel(false)
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfilePanel(false)
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) setShowLoginDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleGoProfile = () => {
    router.push('/profile')
    setShowProfilePanel(false)
  }

  const handleGoHistory = () => {
    router.push('/history')
    setShowProfilePanel(false)
  }

  const runSearch = async (value: string) => {
    if (value.trim().length < 2) {
      setSearchResults([])
      setSearchError('')
      return
    }
    setSearchLoading(true)
    setSearchError('')
    try {
      const response = await fetch(`${API_URL}/cards/search/?q=${encodeURIComponent(value.trim())}`)
      if (!response.ok) throw new Error('No pudimos buscar cartas')
      const data = await response.json()
      setSearchResults(Array.isArray(data) ? data.slice(0, 5) : [])
    } catch (error: any) {
      setSearchError(error.message)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    setShowSearchPanel(true)
    setSearchError('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(value), 350)
  }

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    runSearch(searchTerm)
  }

  const handleNavigateFilter = (filterKey: string, value: string) => {
    const params = new URLSearchParams({ [filterKey]: value })
    router.push(`/search?${params.toString()}`)
    setMenuOpen(false)
  }

  const handleGoToSearchPage = () => {
    if (!searchTerm.trim()) return
    const params = new URLSearchParams({ q: searchTerm.trim() })
    router.push(`/search?${params.toString()}`)
    setShowSearchPanel(false)
  }

  const handleResultClick = (cardId: string) => {
    router.push(`/card/${cardId}`)
    setShowSearchPanel(false)
    setSearchTerm('')
  }

  return (
    <nav className="flex flex-wrap gap-3 items-center px-[5vw] py-7 min-h-[7rem]" style={{ background: '#f0d088' }}>
      <div className="w-full sm:w-auto min-w-[180px] shrink-0">
        <Link href="/" className="flex flex-row items-center gap-1 no-underline text-accent" style={{ fontFamily: "'Press Start 2P', cursive", fontSize: '1.15rem' }}>
          <img src="/Icon_Seatcg.png" alt="Seatcg Logo" className="w-11 h-11 rounded-md object-contain" />
          <div className="flex flex-col gap-0.5">
            <span>Seatcg</span>
            <small className="text-xs tracking-wider text-muted" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>TCG Retro Store</small>
          </div>
        </Link>
      </div>

      <div className="flex-1 grid items-center gap-1.5" style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto' }}>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center justify-center w-[52px] h-[52px] p-0 rounded-full font-bold cursor-pointer border-2"
            style={{ background: '#d83000', color: '#fff', borderColor: '#000', boxShadow: '4px 4px 0 #00000030' }}
            aria-label="Categorías"
            title="Categorías"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <FiGrid size={26} />
          </button>
          {menuOpen && (
            <div className="absolute z-30 top-full left-0 mt-2 bg-white border-[3px] border-black rounded-[20px] p-4 sm:p-6 shadow-[10px_10px_0_#00000020] grid grid-cols-2 gap-4 sm:gap-6 min-w-[260px] sm:min-w-[320px]">
              <div>
                <p className="uppercase text-xs tracking-wider mb-1 text-muted">Tipos</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1">
                  {types.map((type) => (
                    <li key={type}>
                      <button
                        type="button"
                        className="w-full border-2 border-black rounded-xl px-2.5 py-1 cursor-pointer text-left font-semibold text-sm sm:text-base"
                        style={{ background: '#fff1c7' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#d83000'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1c7'; e.currentTarget.style.color = 'inherit' }}
                        onClick={() => handleNavigateFilter('type', type)}
                      >
                        {translateType(type)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="uppercase text-xs tracking-wider mb-1 text-muted">Rarezas</p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1">
                  {rarities.map((rarity) => (
                    <li key={rarity}>
                      <button
                        type="button"
                        className="w-full border-2 border-black rounded-xl px-2.5 py-1 cursor-pointer text-left font-semibold text-sm sm:text-base bg-filter"
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#d83000'; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff1c7'; e.currentTarget.style.color = 'inherit' }}
                        onClick={() => handleNavigateFilter('rarity', rarity)}
                      >
                        {translateRarity(rarity)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="w-full relative min-w-0" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex border-[3px] border-black rounded-full overflow-hidden bg-white">
            <input
              type="search"
              placeholder="Buscar carta, set o artista"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchPanel(true)}
              maxLength={20}
              className="flex-1 border-none px-4 py-3 text-base bg-transparent min-w-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }}
            />
            <button type="submit" className="flex items-center justify-center w-[52px] h-[52px] p-0 bg-transparent border-none cursor-pointer shrink-0" aria-label="Buscar">
              <FiSearch size={26} />
            </button>
          </form>

          {showSearchPanel && (
            <div className="absolute top-full mt-2 left-0 min-w-[280px] sm:min-w-[350px] max-w-[95vw] bg-white border-[3px] border-black rounded-[20px] shadow-[12px_12px_0_#00000025] z-40 p-4">
              {searchLoading && <p className="font-semibold mb-3">Buscando...</p>}
              {searchError && <p className="font-semibold mb-3 text-accent">{searchError}</p>}
              {!searchLoading && !searchError && searchResults.length === 0 && searchTerm.length > 1 && (
                <p className="font-semibold mb-3">Sin resultados</p>
              )}
              <ul className="list-none m-0 p-0 flex flex-col">
                {searchResults.map((card) => (
                  <li
                    key={card.id}
                    className="grid gap-3 items-center py-2.5 cursor-pointer border-b border-[#f0d7ad] last:border-b-0"
                    style={{ gridTemplateColumns: '48px 1fr auto' }}
                    onClick={() => handleResultClick(card.id)}
                  >
                    <img src={getCardImage(card)} alt={card.name} className="w-12 h-16 object-contain" />
                    <div>
                      <strong className="block text-sm">{card.name}</strong>
                      <span className="text-xs text-muted">{getCardSetName(card)}</span>
                    </div>
                    <span className="font-bold text-sm text-accent">{formatCurrency(getCardPrice(card))}</span>
                  </li>
                ))}
              </ul>
              {searchResults.length > 0 && (
                <button
                  type="button"
                  className="btn-primary w-full mt-4"
                  style={{ boxShadow: '0 4px 12px rgba(216,48,0,0.3)' }}
                  onClick={handleGoToSearchPage}
                >
                  Ver todos los resultados
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          <Link href="/cart" className="no-underline">
            <button type="button" className="relative flex items-center justify-center w-[52px] h-[52px] p-0 rounded-full cursor-pointer border-2 border-black bg-white" aria-label="Carrito">
              <FiShoppingCart size={26} />
              {cartCount() > 0 && (
                <span className="absolute -top-[7px] -right-[7px] w-[22px] h-[22px] flex items-center justify-center text-xs font-bold rounded-full border-2 border-black" style={{ background: '#d83000', color: '#fff' }}>
                  {cartCount()}
                </span>
              )}
            </button>
          </Link>
          {isAuthenticated() && auth?.user?.role === 'ROLE_ADMIN' && (
            <Link href="/admin" className="no-underline">
              <button type="button" className="rounded-full cursor-pointer border-2 border-black bg-white px-3 py-2 text-base font-semibold" aria-label="Admin">
                Admin
              </button>
            </Link>
          )}
          <div className="relative" ref={profileRef}>
            {isAuthenticated() ? (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full cursor-pointer border-2 border-black bg-white px-3 py-2 text-base font-semibold"
                  onClick={() => setShowProfilePanel((prev) => !prev)}
                  aria-label="Perfil"
                  title={auth?.user?.username ? `Perfil de ${auth.user.username}` : 'Perfil'}
                >
                  {avatar ? (
                    <span className="w-9 h-9 rounded-full border-2 border-black overflow-hidden inline-flex items-center justify-center bg-filter">
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    </span>
                  ) : (
                    <FiUser size={26} aria-hidden="true" />
                  )}
                  <FiChevronDown size={20} aria-hidden="true" />
                </button>
                {showProfilePanel && (
                  <div className="absolute z-30 top-full right-0 mt-2 bg-white border-[3px] border-black rounded-[20px] p-3 min-w-[220px] shadow-[10px_10px_0_#00000020] flex flex-col gap-1">
                    <button type="button" className="w-full border-2 border-black rounded-xl px-3 py-2 bg-filter cursor-pointer text-left font-semibold hover:bg-[#d83000] hover:text-white" onClick={handleGoProfile}>Mi Perfil</button>
                    <button type="button" className="w-full border-2 border-black rounded-xl px-3 py-2 bg-filter cursor-pointer text-left font-semibold hover:bg-[#d83000] hover:text-white" onClick={handleGoHistory}>Historial</button>
                    <button type="button" className="w-full border-2 border-black rounded-xl px-3 py-2 bg-filter cursor-pointer text-left font-semibold hover:bg-[#d83000] hover:text-white" onClick={handleLogout}>Cerrar sesión</button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Desktop: text button */}
                <Link href="/login" className="hidden sm:inline-flex">
                  <button type="button" className="rounded-full cursor-pointer border-2 border-black bg-white px-3 py-2 text-base font-semibold" aria-label="Ingresar">
                    Login / Register
                  </button>
                </Link>
                {/* Mobile: user icon with dropdown */}
                <div className="relative sm:hidden">
                  <button
                    type="button"
                    className="flex items-center justify-center w-[52px] h-[52px] rounded-full border-2 border-black bg-white"
                    onClick={(e) => { e.stopPropagation(); setShowLoginDropdown((prev) => !prev) }}
                    aria-label="Ingresar"
                  >
                    <FiUser size={26} />
                  </button>
                  {showLoginDropdown && (
                    <div ref={loginDropdownRef} className="absolute z-30 right-0 top-full mt-2 bg-white border-[3px] border-black rounded-[20px] p-3 min-w-[180px] shadow-[10px_10px_0_#00000020] flex flex-col gap-1">
                      <button
                        type="button"
                        className="w-full border-2 border-black rounded-xl px-3 py-2 bg-filter text-left font-semibold hover:bg-[#d83000] hover:text-white cursor-pointer"
                        onClick={() => { setShowLoginDropdown(false); router.push('/login') }}
                      >
                        Iniciar sesión
                      </button>
                      <button
                        type="button"
                        className="w-full border-2 border-black rounded-xl px-3 py-2 bg-filter text-left font-semibold hover:bg-[#d83000] hover:text-white cursor-pointer"
                        onClick={() => { setShowLoginDropdown(false); router.push('/login') }}
                      >
                        Registrarse
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
