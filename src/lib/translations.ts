export const typeMap: Record<string, string> = {
  Grass: 'Planta',
  Fire: 'Fuego',
  Water: 'Agua',
  Lightning: 'Rayo',
  Psychic: 'Psíquico',
  Fighting: 'Lucha',
  Darkness: 'Siniestro',
  Metal: 'Metal',
  Fairy: 'Hada',
  Dragon: 'Dragón',
  Colorless: 'Común',
}

export const rarityMap: Record<string, string> = {
  Common: 'Común',
  Uncommon: 'Poco común',
  Rare: 'Rara',
  'Rare Holo': 'Rara Holo',
  'Rare Ultra': 'Rara Ultra',
  'Rare Prime': 'Rara Prime',
  'Rare ACE': 'Rara ACE',
  'Rare BREAK': 'Rara BREAK',
  'Rare Rainbow': 'Rara Arcoíris',
  'Rare Secret': 'Rara Secreta',
  'Rare Shiny': 'Rara Brillante',
  'Shiny Rare': 'Rara Brillante',
  'Shiny Ultra Rare': 'Rara Ultra Brillante',
  Legend: 'Legendaria',
  Promo: 'Promo',
}

export function translateType(en: string): string {
  return typeMap[en] ?? en
}

export function translateRarity(en: string): string {
  return rarityMap[en] ?? en
}
