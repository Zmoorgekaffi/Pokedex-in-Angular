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

export function getPokemonSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function toGridItem(resource: NamedApiResource): GridItem {
  const id = extractIdFromResourceUrl(resource.url);
  return { id, name: resource.name, spriteUrl: getPokemonSpriteUrl(id) };
}
