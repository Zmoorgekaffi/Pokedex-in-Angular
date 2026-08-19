import { NamedApiResource } from './common.model';

export interface LocationAreaEncounter {
  location_area: NamedApiResource;
  version_details: EncounterVersionDetail[];
}

export interface EncounterVersionDetail {
  max_chance: number;
  encounter_details: EncounterDetail[];
  version: NamedApiResource;
}

export interface EncounterDetail {
  min_level: number;
  max_level: number;
  chance: number;
  method: NamedApiResource;
}
