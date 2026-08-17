import { NamedApiResource } from './common.model';

export interface TypeDetail {
  id: number;
  name: string;
  pokemon: TypeDetailPokemon[];
  damage_relations: TypeRelations;
}

export interface TypeDetailPokemon {
  slot: number;
  pokemon: NamedApiResource;
}

export interface TypeRelations {
  double_damage_from: NamedApiResource[];
  double_damage_to: NamedApiResource[];
  half_damage_from: NamedApiResource[];
  half_damage_to: NamedApiResource[];
  no_damage_from: NamedApiResource[];
  no_damage_to: NamedApiResource[];
}
