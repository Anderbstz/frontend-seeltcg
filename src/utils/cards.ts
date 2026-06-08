export const FALLBACK_CARD_IMAGE = 'https://images.pokemontcg.io/base1/4.png'

export const formatCurrency = (amount: number | string): string => {
  const value = Number(amount)
  if (Number.isNaN(value) || value <= 0) return 'S/ 0.00'
  return `S/ ${value.toFixed(2)}`
}

interface CardLike {
  price?: number | string
  marketPrice?: number | string
  market_price?: number | string
  tcgplayerPrice?: number | string
  tcgplayer_price?: number | string
  id?: string
  name?: string
  image?: string
  images?: { large?: string; small?: string }
  imageUrl?: string
  set?: string
  set_name?: string
  setId?: string
  set_id?: string
}

export const getCardPrice = (card: CardLike): number => {
  const priceCandidates = [card?.price, card?.marketPrice, card?.market_price, card?.tcgplayerPrice, card?.tcgplayer_price]
  const numeric = priceCandidates.map(Number).find((v) => !Number.isNaN(v) && v > 0)
  if (numeric) return Number(numeric.toFixed(2))

  const seedSource = (card?.id ?? card?.name ?? 'pikacards').toString()
  const hash = seedSource.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0)
  return Number((5 + (hash % 100) / 5).toFixed(2))
}

export const getCardImage = (card: CardLike): string =>
  card?.image ?? card?.images?.large ?? card?.images?.small ?? card?.imageUrl ?? FALLBACK_CARD_IMAGE

export const getCardSetName = (card: CardLike): string =>
  card?.set ?? card?.set_name ?? card?.setId ?? card?.set_id ?? 'Colección secreta'
