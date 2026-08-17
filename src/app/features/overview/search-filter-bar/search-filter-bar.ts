import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
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

@Component({
  selector: 'app-search-filter-bar',
  imports: [GenerationSelector],
  templateUrl: './search-filter-bar.html',
  styleUrl: './search-filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFilterBar {
  readonly types = POKEMON_TYPES;

  readonly nameQuery = model('');
  readonly selectedType1 = model<string | undefined>(undefined);
  readonly selectedType2 = model<string | undefined>(undefined);
  readonly selectedGeneration = model<number | undefined>(undefined);

  readonly filtersExpanded = signal(false);

  /** Excludes the other type select's current value so the same type can't be picked twice. */
  readonly type1Options = computed(() => this.types.filter((type) => type !== this.selectedType2()));
  readonly type2Options = computed(() => this.types.filter((type) => type !== this.selectedType1()));

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
