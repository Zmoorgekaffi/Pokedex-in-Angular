export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

/** Light backgrounds read better with dark text than the white used for the rest. */
const LIGHT_BACKGROUND_TYPES = new Set(['electric', 'ice', 'ground', 'fairy', 'normal', 'steel']);

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#9CA3AF';
}

export function typeTextColor(type: string): string {
  return LIGHT_BACKGROUND_TYPES.has(type) ? '#1f2937' : '#ffffff';
}
