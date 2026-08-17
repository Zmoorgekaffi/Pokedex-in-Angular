import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
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
  readonly selectedType = model<string | undefined>(undefined);
  readonly selectedGeneration = model<number | undefined>(undefined);

  readonly filtersExpanded = signal(false);

  onNameInput(value: string): void {
    this.nameQuery.set(value);
  }

  onTypeChange(value: string): void {
    this.selectedType.set(value === '' ? undefined : value);
  }

  toggleFilters(): void {
    this.filtersExpanded.update((expanded) => !expanded);
  }
}
