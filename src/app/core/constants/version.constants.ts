/** Game versions in release order; anything else (unlikely — PokeAPI's version list is stable) sorts after these. */
export const VERSION_ORDER: string[] = [
  'red',
  'blue',
  'yellow',
  'gold',
  'silver',
  'crystal',
  'ruby',
  'sapphire',
  'emerald',
  'firered',
  'leafgreen',
  'diamond',
  'pearl',
  'platinum',
  'heartgold',
  'soulsilver',
  'black',
  'white',
  'black-2',
  'white-2',
  'x',
  'y',
  'omega-ruby',
  'alpha-sapphire',
  'sun',
  'moon',
  'ultra-sun',
  'ultra-moon',
  'lets-go-pikachu',
  'lets-go-eevee',
  'sword',
  'shield',
  'brilliant-diamond',
  'shining-pearl',
  'legends-arceus',
  'scarlet',
  'violet'
];

export const VERSION_LABELS_DE: Record<string, string> = {
  red: 'Rot',
  blue: 'Blau',
  yellow: 'Gelb',
  gold: 'Gold',
  silver: 'Silber',
  crystal: 'Kristall',
  ruby: 'Rubin',
  sapphire: 'Saphir',
  emerald: 'Smaragd',
  firered: 'Feuerrot',
  leafgreen: 'Blattgrün',
  diamond: 'Diamant',
  pearl: 'Perl',
  platinum: 'Platin',
  heartgold: 'HeartGold',
  soulsilver: 'SoulSilver',
  black: 'Schwarz',
  white: 'Weiß',
  'black-2': 'Schwarz 2',
  'white-2': 'Weiß 2',
  x: 'X',
  y: 'Y',
  'omega-ruby': 'Omega Rubin',
  'alpha-sapphire': 'Alpha Saphir',
  sun: 'Sonne',
  moon: 'Mond',
  'ultra-sun': 'Ultrasonne',
  'ultra-moon': 'Ultramond',
  'lets-go-pikachu': "Let's Go, Pikachu!",
  'lets-go-eevee': "Let's Go, Evoli!",
  sword: 'Schwert',
  shield: 'Schild',
  'brilliant-diamond': 'Strahlender Diamant',
  'shining-pearl': 'Leuchtende Perle',
  'legends-arceus': 'Legenden: Arceus',
  scarlet: 'Karmesin',
  violet: 'Purpur'
};

export function capitalizeSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function versionLabel(version: string, language: 'en' | 'de'): string {
  if (language === 'de') {
    return VERSION_LABELS_DE[version] ?? capitalizeSlug(version);
  }
  return capitalizeSlug(version);
}
