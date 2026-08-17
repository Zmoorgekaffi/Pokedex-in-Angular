import { NamedApiResource } from './common.model';

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: NamedApiResource;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface PokemonType {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedApiResource;
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface PokemonMove {
  move: NamedApiResource;
  version_group_details: PokemonMoveVersionDetail[];
}

export interface PokemonMoveVersionDetail {
  level_learned_at: number;
  move_learn_method: NamedApiResource;
  version_group: NamedApiResource;
}
