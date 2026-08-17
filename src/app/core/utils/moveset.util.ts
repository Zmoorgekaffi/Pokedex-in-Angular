import { LEARN_METHOD_ORDER } from '../constants/move-learn-method.constants';
import { PokemonMove } from '../models';
import { extractIdFromResourceUrl } from './pokemon.util';

export interface MovesetRow {
  id: number;
  name: string;
  method: string;
  /** 0 for non-level-up methods (machine/egg/tutor don't have a level). */
  level: number;
}

/**
 * Flattens each move's per-version-group learn details into rows, deduped by (move, method, level)
 * since the same requirement repeats across many games — we don't track a "current game" concept.
 */
export function buildMovesetRows(moves: PokemonMove[]): MovesetRow[] {
  const rows: MovesetRow[] = [];
  const seen = new Set<string>();

  for (const move of moves) {
    const id = extractIdFromResourceUrl(move.move.url);
    for (const detail of move.version_group_details) {
      const method = detail.move_learn_method.name;
      const level = detail.level_learned_at;
      const key = `${id}|${method}|${level}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      rows.push({ id, name: move.move.name, method, level });
    }
  }

  return rows.sort((a, b) => {
    const orderA = orderIndex(a.method);
    const orderB = orderIndex(b.method);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name);
  });
}

function orderIndex(method: string): number {
  const index = LEARN_METHOD_ORDER.indexOf(method);
  return index === -1 ? LEARN_METHOD_ORDER.length : index;
}
