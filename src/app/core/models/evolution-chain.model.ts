import { NamedApiResource } from './common.model';

export interface EvolutionChain {
  id: number;
  chain: ChainLink;
}

export interface ChainLink {
  is_baby: boolean;
  species: NamedApiResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionDetail {
  trigger: NamedApiResource;
  item: NamedApiResource | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  known_move: NamedApiResource | null;
  known_move_type: NamedApiResource | null;
  held_item: NamedApiResource | null;
  time_of_day: string;
  trade_species: NamedApiResource | null;
}
