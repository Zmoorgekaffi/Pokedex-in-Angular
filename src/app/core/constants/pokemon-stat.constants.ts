export const STAT_LABELS_EN: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed'
};

export const STAT_LABELS_DE: Record<string, string> = {
  hp: 'KP',
  attack: 'Angriff',
  defense: 'Verteidigung',
  'special-attack': 'Sp. Angriff',
  'special-defense': 'Sp. Verteidigung',
  speed: 'Initiative'
};

/** Base stats don't exceed this in practice (e.g. Blissey's 255 HP) — used to scale the bars. */
export const MAX_BASE_STAT = 255;
