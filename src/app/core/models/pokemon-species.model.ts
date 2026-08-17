import { ApiResource, FlavorText, Name, NamedApiResource } from './common.model';

export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  is_baby: boolean;
  generation: NamedApiResource;
  evolves_from_species: NamedApiResource | null;
  evolution_chain: ApiResource;
  names: Name[];
  genera: Genus[];
  flavor_text_entries: FlavorText[];
  varieties: PokemonSpeciesVariety[];
}

export interface Genus {
  genus: string;
  language: NamedApiResource;
}

export interface PokemonSpeciesVariety {
  is_default: boolean;
  pokemon: NamedApiResource;
}
