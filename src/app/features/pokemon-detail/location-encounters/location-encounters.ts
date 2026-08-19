import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { capitalizeSlug, VERSION_ORDER, versionLabel as getVersionLabel } from '../../../core/constants/version.constants';
import { LocationArea } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { pick } from '../../../core/utils/i18n.util';
import { buildLocationRows, extractAvailableVersions, LocationEncounterRow } from '../../../core/utils/location-encounters.util';
import { ComponentTitle } from '../../../shared/components/component-title/component-title';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-location-encounters',
  imports: [ComponentTitle, LoadingSpinner],
  templateUrl: './location-encounters.html',
  styleUrl: './location-encounters.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationEncounters {
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly languageService = inject(LanguageService);

  readonly pokemonId = input.required<number>();

  private readonly encountersResource = this.pokemonApi.getEncounters(() => this.pokemonId());
  private readonly encounters = computed(() => this.encountersResource.value() ?? []);

  readonly language = this.languageService.language;
  readonly isLoading = this.encountersResource.isLoading;
  readonly title = computed(() => pick(this.language(), 'Locations', 'Fundorte'));
  readonly noVersionsLabel = computed(() =>
    pick(this.language(), 'No location data available for this Pokémon.', 'Für dieses Pokémon sind keine Fundort-Daten verfügbar.')
  );
  readonly noEncountersLabel = computed(() =>
    pick(this.language(), 'Not found in the wild in this game.', 'In diesem Spiel nicht wild auffindbar.')
  );

  readonly availableVersions = computed<string[]>(() => {
    const present = new Set(extractAvailableVersions(this.encounters()));
    return VERSION_ORDER.filter((version) => present.has(version)).concat(
      [...present].filter((version) => !VERSION_ORDER.includes(version))
    );
  });

  /** Defaults to the first available game once the encounter data loads — seeded once, see the effect below. */
  readonly selectedVersion = signal<string | undefined>(undefined);

  readonly rows = computed<LocationEncounterRow[]>(() => {
    const version = this.selectedVersion();
    return version ? buildLocationRows(this.encounters(), version) : [];
  });

  /** Bulk-fetches (concurrency-capped) every distinct location area across all games at once, so rows can show localized names instead of just the EN slug — fetched once regardless of which game is selected, so switching games never re-fetches. */
  private readonly areaNames = computed<string[]>(() => [...new Set(this.encounters().map((e) => e.location_area.name))]);
  private readonly locationAreasResource = this.pokemonApi.getLocationAreas(() => this.areaNames());
  private readonly locationAreaByName = computed<Map<string, LocationArea>>(
    () => new Map((this.locationAreasResource.value() ?? []).map((area) => [area.name, area]))
  );

  private readonly versionSelect = viewChild<ElementRef<HTMLSelectElement>>('versionSelect');

  constructor() {
    effect(() => {
      const versions = this.availableVersions();
      if (versions.length > 0 && !this.selectedVersion()) {
        this.selectedVersion.set(versions[0]);
      }
    });

    /**
     * Same fix as MovesetTable's methodSelect: a native <select>'s [value] binding is a no-op if
     * applied before its matching <option> (rendered by the @for below) exists as a real DOM
     * child, and Angular only re-applies the binding when the bound value itself changes — so the
     * default selection silently failed to show without this. Re-applying imperatively whenever
     * the options list changes, in a separate macrotask so it isn't stomped back by Angular's own
     * binding re-running later in the same change-detection pass.
     */
    effect(() => {
      this.availableVersions();
      const select = this.versionSelect()?.nativeElement;
      const value = this.selectedVersion() ?? '';
      if (select) {
        setTimeout(() => {
          select.value = value;
        });
      }
    });
  }

  versionLabel(version: string): string {
    return getVersionLabel(version, this.language());
  }

  /** Falls back to the capitalized EN slug until the bulk area-name fetch resolves that row's entry. */
  areaLabel(row: LocationEncounterRow): string {
    const area = this.locationAreaByName().get(row.areaName);
    if (!area) {
      return capitalizeSlug(row.areaName);
    }
    const language = this.language();
    const entry =
      area.names.find((name) => name.language.name === language) ??
      area.names.find((name) => name.language.name === 'en');
    return entry?.name ?? capitalizeSlug(area.name);
  }

  onVersionChange(value: string): void {
    this.selectedVersion.set(value === '' ? undefined : value);
  }
}
