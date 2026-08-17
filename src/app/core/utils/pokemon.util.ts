import { NamedApiResource } from '../models';

export interface GridItem {
  id: number;
  name: string;
  spriteUrl: string;
}

export function extractIdFromResourceUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : NaN;
}

/**
 * jsDelivr mirrors the same PokeAPI/sprites GitHub repo but is meant for hotlinking/production
 * use, unlike raw.githubusercontent.com which rate-limits hard under sustained traffic (verified
 * 2026-08-17: raw.githubusercontent.com returned 429 on every request while this jsDelivr URL
 * returned 200) — this is what broke sprite loading across the app.
 */
export function getPokemonSpriteUrl(id: number): string {
  return `https://cdn.jsdelivr.net/gh/PokeAPI/sprites/sprites/pokemon/${id}.png`;
}

export function toGridItem(resource: NamedApiResource): GridItem {
  const id = extractIdFromResourceUrl(resource.url);
  return { id, name: resource.name, spriteUrl: getPokemonSpriteUrl(id) };
}
