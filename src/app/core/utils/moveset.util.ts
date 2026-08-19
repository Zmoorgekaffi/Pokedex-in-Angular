import { LEARN_METHOD_ORDER } from '../constants/move-learn-method.constants';
import { PokemonMove } from '../models';
import { extractIdFromResourceUrl } from './pokemon.util';

export interface MovesetRow {
  id: number;
  name: string;
  method: string;
  /** Every distinct level this move is learned at via this method, ascending. [0] for non-level-up methods (machine/egg/tutor don't have a level). */
  levels: number[];
}

/**
 * Flattens each move's per-version-group learn details into rows, one row per (move, method) —
 * a move learnable at several levels across different games (e.g. Slam at 20/25/30) collapses into
 * a single row listing all of those levels instead of one row per level, since we don't track a
 * "current game" concept.
 */
export function buildMovesetRows(moves: PokemonMove[]): MovesetRow[] {
  const rowByKey = new Map<string, MovesetRow>();

  for (const move of moves) {
    const id = extractIdFromResourceUrl(move.move.url);
    for (const detail of move.version_group_details) {
      const method = detail.move_learn_method.name;
      const level = detail.level_learned_at;
      const key = `${id}|${method}`;
      const row = rowByKey.get(key);
      if (row) {
        if (!row.levels.includes(level)) {
          row.levels.push(level);
        }
      } else {
        rowByKey.set(key, { id, name: move.move.name, method, levels: [level] });
      }
    }
  }

  const rows = [...rowByKey.values()];
  for (const row of rows) {
    row.levels.sort((a, b) => a - b);
  }

  return rows.sort((a, b) => {
    const orderA = orderIndex(a.method);
    const orderB = orderIndex(b.method);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    if (a.levels[0] !== b.levels[0]) {
      return a.levels[0] - b.levels[0];
    }
    return a.name.localeCompare(b.name);
  });
}

function orderIndex(method: string): number {
  const index = LEARN_METHOD_ORDER.indexOf(method);
  return index === -1 ? LEARN_METHOD_ORDER.length : index;
}
