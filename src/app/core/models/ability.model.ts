import { Name } from './common.model';
import { VerboseEffect } from './move.model';

export interface Ability {
  id: number;
  name: string;
  names: Name[];
  effect_entries: VerboseEffect[];
}
