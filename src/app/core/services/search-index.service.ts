import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NamedApiResource, PokemonListResponse, PokemonSpecies, SearchIndexEntry } from '../models';
import { extractIdFromResourceUrl } from '../utils/pokemon.util';

/** Concurrency cap for the per-species name fetches so the index build doesn't fire 1000+ requests at once. */
const FETCH_CONCURRENCY = 20;

@Injectable({ providedIn: 'root' })
export class SearchIndexService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.pokeApiBaseUrl;

  private readonly triggered = signal(false);

  /** Field initializer runs during the service's own construction, which is a real injection context. */
  private readonly indexResource = rxResource({
    params: () => (this.triggered() ? true : undefined),
    stream: () => this.loadIndex$()
  });

  readonly entries = computed<SearchIndexEntry[]>(() => this.indexResource.value() ?? []);
  readonly isLoading = this.indexResource.isLoading;

  /** Idempotent — kicks off the one-time bulk load on first call, no-op afterwards. */
  ensureLoaded(): void {
    this.triggered.set(true);
  }

  private loadIndex$() {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon-species?limit=20000&offset=0`).pipe(
      switchMap((list) =>
        from(list.results).pipe(
          mergeMap((resource) => this.fetchEntry(resource), FETCH_CONCURRENCY),
          toArray()
        )
      ),
      map((entries) => entries.filter((entry): entry is SearchIndexEntry => entry !== null))
    );
  }

  private fetchEntry(resource: NamedApiResource) {
    const id = extractIdFromResourceUrl(resource.url);
    return this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${id}`).pipe(
      map(
        (species): SearchIndexEntry => ({
          id,
          nameEn: species.names.find((name) => name.language.name === 'en')?.name ?? species.name,
          nameDe: species.names.find((name) => name.language.name === 'de')?.name ?? species.name
        })
      ),
      catchError(() => of(null))
    );
  }
}
