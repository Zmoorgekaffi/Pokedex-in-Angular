import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { SearchIndexService } from '../../../core/services/search-index.service';
import { GridItem, toGridItem } from '../../../core/utils/pokemon.util';
import { filterSearchIndex } from '../../../core/utils/search.util';
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
  private readonly searchIndex = inject(SearchIndexService);
  private readonly languageService = inject(LanguageService);

  readonly nameQuery = signal('');
  readonly selectedGeneration = signal<number | undefined>(undefined);
  readonly selectedType1 = signal<string | undefined>(undefined);
  readonly selectedType2 = signal<string | undefined>(undefined);

  private readonly offset = signal(0);
  private readonly defaultItems = signal<GridItem[]>([]);
  private readonly defaultHasMore = signal(true);
  private readonly revealCount = signal(PAGE_SIZE);

  private readonly pageResource = this.pokemonApi.getPokemonPage(() => ({
    limit: PAGE_SIZE,
    offset: this.offset()
  }));
  private readonly generationResource = this.pokemonApi.getGeneration(() => this.selectedGeneration());
  private readonly type1Resource = this.pokemonApi.getType(() => this.selectedType1());
  private readonly type2Resource = this.pokemonApi.getType(() => this.selectedType2());

  readonly isFiltering = computed(
    () =>
      this.selectedGeneration() !== undefined ||
      this.selectedType1() !== undefined ||
      this.selectedType2() !== undefined
  );

  private readonly generationItems = computed<GridItem[] | undefined>(() =>
    this.generationResource.value()?.pokemon_species.map(toGridItem)
  );

  private readonly type1Items = computed<GridItem[] | undefined>(() =>
    this.type1Resource.value()?.pokemon.map((entry) => toGridItem(entry.pokemon))
  );

  private readonly type2Items = computed<GridItem[] | undefined>(() =>
    this.type2Resource.value()?.pokemon.map((entry) => toGridItem(entry.pokemon))
  );

  /** Intersects every active filter (generation, type 1, type 2) that's currently selected. */
  private readonly filteredPool = computed<GridItem[]>(() => {
    const activeSets: (GridItem[] | undefined)[] = [];
    if (this.selectedGeneration() !== undefined) {
      activeSets.push(this.generationItems());
    }
    if (this.selectedType1() !== undefined) {
      activeSets.push(this.type1Items());
    }
    if (this.selectedType2() !== undefined) {
      activeSets.push(this.type2Items());
    }

    if (activeSets.length === 0 || activeSets.some((set) => !set)) {
      return [];
    }
    const definedSets = activeSets as GridItem[][];

    return definedSets.reduce((intersection, set) => {
      const names = new Set(set.map((item) => item.name));
      return intersection.filter((item) => names.has(item.name));
    });
  });

  /** DE-name/ID matches from the search index; empty until `ensureLoaded()` resolves — EN slug matching below stays instant regardless. */
  private readonly indexMatchIds = computed<Set<number>>(() => {
    const query = this.nameQuery();
    if (!query.trim()) {
      return new Set();
    }
    return new Set(filterSearchIndex(this.searchIndex.entries(), query).map((entry) => entry.id));
  });

  private readonly deNameById = computed<Map<number, string>>(
    () => new Map(this.searchIndex.entries().map((entry) => [entry.id, entry.nameDe]))
  );

  private matchesQuery(item: GridItem, query: string): boolean {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return true;
    }
    if (/^\d+$/.test(trimmed)) {
      return item.id === Number(trimmed);
    }
    return item.name.includes(trimmed) || this.indexMatchIds().has(item.id);
  }

  /** Falls back to the EN slug per item until the DE name is available from the search index. */
  private localize(items: GridItem[]): GridItem[] {
    if (this.languageService.language() !== 'de') {
      return items;
    }
    const deNames = this.deNameById();
    return items.map((item) => {
      const deName = deNames.get(item.id);
      return deName ? { ...item, name: deName } : item;
    });
  }

  private readonly queryFilteredPool = computed<GridItem[]>(() => {
    const query = this.nameQuery();
    const pool = this.filteredPool();
    return query.trim() ? pool.filter((item) => this.matchesQuery(item, query)) : pool;
  });

  private readonly queryFilteredDefaultItems = computed<GridItem[]>(() => {
    const query = this.nameQuery();
    const items = this.defaultItems();
    return query.trim() ? items.filter((item) => this.matchesQuery(item, query)) : items;
  });

  readonly visibleItems = computed<GridItem[]>(() =>
    this.localize(
      this.isFiltering()
        ? this.queryFilteredPool().slice(0, this.revealCount())
        : this.queryFilteredDefaultItems()
    )
  );

  readonly hasMore = computed(() =>
    this.isFiltering() ? this.revealCount() < this.queryFilteredPool().length : this.defaultHasMore()
  );

  readonly isLoading = computed(() =>
    this.isFiltering()
      ? this.generationResource.isLoading() || this.type1Resource.isLoading() || this.type2Resource.isLoading()
      : this.pageResource.isLoading()
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
      this.selectedType1();
      this.selectedType2();
      this.revealCount.set(PAGE_SIZE);
    });

    effect(() => {
      if (this.nameQuery().trim()) {
        this.searchIndex.ensureLoaded();
      }
    });

    effect(() => {
      if (this.languageService.language() === 'de') {
        this.searchIndex.ensureLoaded();
      }
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
