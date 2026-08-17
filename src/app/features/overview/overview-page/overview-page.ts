import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { GridItem, toGridItem } from '../../../core/utils/pokemon.util';
import { LoadMoreTrigger } from '../../../shared/components/load-more-trigger/load-more-trigger';
import { PokemonGrid } from '../pokemon-grid/pokemon-grid';
import { SearchFilterBar } from '../search-filter-bar/search-filter-bar';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-overview-page',
  imports: [PokemonGrid, SearchFilterBar, LoadMoreTrigger],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewPage {
  private readonly pokemonApi = inject(PokemonApiService);

  readonly nameQuery = signal('');
  readonly selectedGeneration = signal<number | undefined>(undefined);
  readonly selectedType = signal<string | undefined>(undefined);

  private readonly offset = signal(0);
  private readonly defaultItems = signal<GridItem[]>([]);
  private readonly defaultHasMore = signal(true);
  private readonly revealCount = signal(PAGE_SIZE);

  private readonly pageResource = this.pokemonApi.getPokemonPage(() => ({
    limit: PAGE_SIZE,
    offset: this.offset()
  }));
  private readonly generationResource = this.pokemonApi.getGeneration(() => this.selectedGeneration());
  private readonly typeResource = this.pokemonApi.getType(() => this.selectedType());

  readonly isFiltering = computed(
    () => this.selectedGeneration() !== undefined || this.selectedType() !== undefined
  );

  private readonly generationItems = computed<GridItem[] | undefined>(() =>
    this.generationResource.value()?.pokemon_species.map(toGridItem)
  );

  private readonly typeItems = computed<GridItem[] | undefined>(() =>
    this.typeResource.value()?.pokemon.map((entry) => toGridItem(entry.pokemon))
  );

  private readonly filteredPool = computed<GridItem[]>(() => {
    const generationItems = this.generationItems();
    const typeItems = this.typeItems();
    if (this.selectedGeneration() !== undefined && this.selectedType() !== undefined) {
      if (!generationItems || !typeItems) {
        return [];
      }
      const typeNames = new Set(typeItems.map((item) => item.name));
      return generationItems.filter((item) => typeNames.has(item.name));
    }
    return generationItems ?? typeItems ?? [];
  });

  private readonly queryFilteredPool = computed<GridItem[]>(() => {
    const query = this.nameQuery().trim().toLowerCase();
    const pool = this.filteredPool();
    return query ? pool.filter((item) => item.name.includes(query)) : pool;
  });

  private readonly queryFilteredDefaultItems = computed<GridItem[]>(() => {
    const query = this.nameQuery().trim().toLowerCase();
    const items = this.defaultItems();
    return query ? items.filter((item) => item.name.includes(query)) : items;
  });

  readonly visibleItems = computed<GridItem[]>(() =>
    this.isFiltering()
      ? this.queryFilteredPool().slice(0, this.revealCount())
      : this.queryFilteredDefaultItems()
  );

  readonly hasMore = computed(() =>
    this.isFiltering() ? this.revealCount() < this.queryFilteredPool().length : this.defaultHasMore()
  );

  constructor() {
    effect(() => {
      const page = this.pageResource.value();
      if (!page) {
        return;
      }
      this.defaultItems.update((existing) => [...existing, ...page.results.map(toGridItem)]);
      this.defaultHasMore.set(page.next !== null);
    });

    effect(() => {
      this.selectedGeneration();
      this.selectedType();
      this.revealCount.set(PAGE_SIZE);
    });
  }

  loadMore(): void {
    if (this.isFiltering()) {
      this.revealCount.update((count) => count + PAGE_SIZE);
    } else {
      this.offset.update((value) => value + PAGE_SIZE);
    }
  }
}
