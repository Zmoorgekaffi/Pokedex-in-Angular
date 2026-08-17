import { NamedApiResource } from './common.model';

export interface Generation {
  id: number;
  name: string;
  pokemon_species: NamedApiResource[];
}
