import { NamedApiResource } from './common.model';

export interface TypeDetail {
  id: number;
  name: string;
  pokemon: TypeDetailPokemon[];
}

export interface TypeDetailPokemon {
  slot: number;
  pokemon: NamedApiResource;
}
