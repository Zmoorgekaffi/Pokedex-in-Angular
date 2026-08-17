import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { POKEMON_TYPES, typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';
import { GenerationSelector } from '../generation-selector/generation-selector';

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
    return getTypeLabel(type, this.language());
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
