import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';
import { GenerationSelector } from '../generation-selector/generation-selector';

export const POKEMON_TYPES: string[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
];

const TYPE_LABELS_DE: Record<string, string> = {
  normal: 'Normal',
  fire: 'Feuer',
  water: 'Wasser',
  electric: 'Elektro',
  grass: 'Pflanze',
  ice: 'Eis',
  fighting: 'Kampf',
  poison: 'Gift',
  ground: 'Boden',
  flying: 'Flug',
  psychic: 'Psycho',
  bug: 'Käfer',
  rock: 'Gestein',
  ghost: 'Geist',
  dragon: 'Drache',
  dark: 'Unlicht',
  steel: 'Stahl',
  fairy: 'Fee'
};

@Component({
  selector: 'app-search-filter-bar',
  imports: [GenerationSelector],
  templateUrl: './search-filter-bar.html',
  styleUrl: './search-filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilterBar {
  private readonly languageService = inject(LanguageService);

  readonly types = POKEMON_TYPES;
  readonly language = this.languageService.language;

  readonly nameQuery = model('');
  readonly selectedType1 = model<string | undefined>(undefined);
  readonly selectedType2 = model<string | undefined>(undefined);
  readonly selectedGeneration = model<number | undefined>(undefined);

  readonly filtersExpanded = signal(false);

  /** Excludes the other type select's current value so the same type can't be picked twice. */
  readonly type1Options = computed(() => this.types.filter((type) => type !== this.selectedType2()));
  readonly type2Options = computed(() => this.types.filter((type) => type !== this.selectedType1()));

  readonly namePlaceholder = computed(() =>
    pick(this.language(), 'Filter by name (EN/DE) or number…', 'Nach Name (DE/EN) oder Nummer filtern…')
  );
  readonly filterButtonLabel = computed(() => pick(this.language(), 'Filters', 'Filter'));
  readonly type1DefaultLabel = computed(() => pick(this.language(), 'Type 1', 'Typ 1'));
  readonly type2DefaultLabel = computed(() => pick(this.language(), 'Type 2', 'Typ 2'));

  typeLabel(type: string): string {
    return pick(this.language(), type, TYPE_LABELS_DE[type] ?? type);
  }

  onNameInput(value: string): void {
    this.nameQuery.set(value);
  }

  onType1Change(value: string): void {
    this.selectedType1.set(value === '' ? undefined : value);
  }

  onType2Change(value: string): void {
    this.selectedType2.set(value === '' ? undefined : value);
  }

  toggleFilters(): void {
    this.filtersExpanded.update((expanded) => !expanded);
  }
}
