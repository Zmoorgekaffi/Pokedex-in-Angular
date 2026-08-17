import { Injectable, signal } from '@angular/core';
import { Ability, EvolutionChain, Pokemon, PokemonSpecies } from '../models';

function normalizeKey(key: string | number): string {
  return String(key).trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class PokemonCacheService {
  private readonly pokemonMap = signal(new Map<string, Pokemon>());
  private readonly speciesMap = signal(new Map<string, PokemonSpecies>());
  private readonly evolutionChainMap = signal(new Map<string, EvolutionChain>());
  private readonly abilityMap = signal(new Map<string, Ability>());

  hasPokemon(key: string | number): boolean {
    return this.pokemonMap().has(normalizeKey(key));
  }

  getPokemon(key: string | number): Pokemon | undefined {
    return this.pokemonMap().get(normalizeKey(key));
  }

  setPokemon(key: string | number, value: Pokemon): void {
    this.pokemonMap.update((map) => new Map(map).set(normalizeKey(key), value));
  }

  hasSpecies(key: string | number): boolean {
    return this.speciesMap().has(normalizeKey(key));
  }

  getSpecies(key: string | number): PokemonSpecies | undefined {
    return this.speciesMap().get(normalizeKey(key));
  }

  setSpecies(key: string | number, value: PokemonSpecies): void {
    this.speciesMap.update((map) => new Map(map).set(normalizeKey(key), value));
  }

  hasEvolutionChain(key: string | number): boolean {
    return this.evolutionChainMap().has(normalizeKey(key));
  }

  getEvolutionChain(key: string | number): EvolutionChain | undefined {
    return this.evolutionChainMap().get(normalizeKey(key));
  }

  setEvolutionChain(key: string | number, value: EvolutionChain): void {
    this.evolutionChainMap.update((map) => new Map(map).set(normalizeKey(key), value));
  }

  hasAbility(key: string | number): boolean {
    return this.abilityMap().has(normalizeKey(key));
  }

  getAbility(key: string | number): Ability | undefined {
    return this.abilityMap().get(normalizeKey(key));
  }

  setAbility(key: string | number, value: Ability): void {
    this.abilityMap.update((map) => new Map(map).set(normalizeKey(key), value));
  }
}
