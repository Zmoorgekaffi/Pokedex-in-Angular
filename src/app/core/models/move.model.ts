import { Name, NamedApiResource } from './common.model';

export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  pp: number;
  priority: number;
  power: number | null;
  damage_class: NamedApiResource;
  type: NamedApiResource;
  target: NamedApiResource;
  effect_entries: VerboseEffect[];
  flavor_text_entries: MoveFlavorText[];
  names: Name[];
  meta: MoveMetaData;
}

export interface VerboseEffect {
  effect: string;
  short_effect: string;
  language: NamedApiResource;
}

export interface MoveFlavorText {
  flavor_text: string;
  language: NamedApiResource;
  version_group: NamedApiResource;
}

export interface MoveMetaData {
  ailment: NamedApiResource;
  category: NamedApiResource;
  drain: number;
  healing: number;
  crit_rate: number;
  ailment_chance: number;
  flinch_chance: number;
  stat_chance: number;
}
