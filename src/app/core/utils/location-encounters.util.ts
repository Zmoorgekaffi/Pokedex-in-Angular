import { LocationAreaEncounter } from '../models';

export interface LocationEncounterRow {
  areaName: string;
  minLevel: number;
  maxLevel: number;
  chance: number;
}

/** Distinct version slugs across every location area's version_details, in first-seen order. */
export function extractAvailableVersions(encounters: LocationAreaEncounter[]): string[] {
  const versions = new Set<string>();
  for (const encounter of encounters) {
    for (const detail of encounter.version_details) {
      versions.add(detail.version.name);
    }
  }
  return [...versions];
}

/** One row per location area that has this Pokémon in the given version, levels/chance merged across that area's encounter methods (walking, surfing, fishing, ...). */
export function buildLocationRows(encounters: LocationAreaEncounter[], version: string): LocationEncounterRow[] {
  const rows: LocationEncounterRow[] = [];
  for (const encounter of encounters) {
    const detail = encounter.version_details.find((d) => d.version.name === version);
    if (!detail || detail.encounter_details.length === 0) {
      continue;
    }
    const minLevel = Math.min(...detail.encounter_details.map((d) => d.min_level));
    const maxLevel = Math.max(...detail.encounter_details.map((d) => d.max_level));
    rows.push({
      areaName: encounter.location_area.name,
      minLevel,
      maxLevel,
      chance: detail.max_chance
    });
  }
  return rows;
}
