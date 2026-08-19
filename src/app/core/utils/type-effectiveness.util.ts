import { POKEMON_TYPES } from '../constants/pokemon-type.constants';
import { TypeRelations } from '../models';

export interface TypeEffectivenessResult {
  /** Deals 4x damage (both of this Pokémon's types are weak to it) — "It's super effective!" territory, the more dangerous tier. */
  veryEffective: string[];
  /** Deals 2x damage (one type is weak to it). */
  effective: string[];
  resistant: string[];
  immune: string[];
}

/**
 * Combines damage_relations across 1-2 defending types by multiplying per-type multipliers
 * (matches in-game dual-type behaviour, e.g. 4x weak, 0.25x resistant, and no_damage always wins).
 */
export function computeTypeEffectiveness(relations: TypeRelations[]): TypeEffectivenessResult {
  const multipliers = new Map<string, number>(POKEMON_TYPES.map((type) => [type, 1]));

  for (const relation of relations) {
    for (const type of relation.double_damage_from) {
      multipliers.set(type.name, (multipliers.get(type.name) ?? 1) * 2);
    }
    for (const type of relation.half_damage_from) {
      multipliers.set(type.name, (multipliers.get(type.name) ?? 1) * 0.5);
    }
    for (const type of relation.no_damage_from) {
      multipliers.set(type.name, 0);
    }
  }

  const result: TypeEffectivenessResult = { veryEffective: [], effective: [], resistant: [], immune: [] };
  for (const [type, multiplier] of multipliers) {
    if (multiplier === 0) {
      result.immune.push(type);
    } else if (multiplier >= 4) {
      result.veryEffective.push(type);
    } else if (multiplier > 1) {
      result.effective.push(type);
    } else if (multiplier < 1) {
      result.resistant.push(type);
    }
  }
  return result;
}
