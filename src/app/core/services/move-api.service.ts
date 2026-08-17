import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { from, of } from 'rxjs';
import { mergeMap, tap, toArray } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Move } from '../models';

/** Concurrency cap so a whole moveset doesn't fire 30-90 requests at once. */
const FETCH_CONCURRENCY = 15;

function normalizeKey(key: string | number): string {
  return String(key).trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class MoveApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.pokeApiBaseUrl;

  private readonly moveMap = signal(new Map<string, Move>());

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "no move hovered/selected yet".
   */
  getMove(params: () => string | number | undefined) {
    return rxResource({
      params,
      stream: ({ params }) => {
        const key = normalizeKey(params);
        const cached = this.moveMap().get(key);
        if (cached) {
          return of(cached);
        }
        return this.http
          .get<Move>(`${this.baseUrl}/move/${params}`)
          .pipe(tap((move) => this.moveMap.update((map) => new Map(map).set(key, move))));
      }
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the resource
   * idle. Bulk-fetches (concurrency-capped) so a whole moveset's localized names/types can be
   * read without one resource per row — populates the same cache `getMove()` reads from.
   */
  getMoves(params: () => string[] | undefined) {
    return rxResource({
      params,
      stream: ({ params: names }) =>
        from(names).pipe(
          mergeMap((name) => {
            const key = normalizeKey(name);
            const cached = this.moveMap().get(key);
            if (cached) {
              return of(cached);
            }
            return this.http
              .get<Move>(`${this.baseUrl}/move/${name}`)
              .pipe(tap((move) => this.moveMap.update((map) => new Map(map).set(key, move))));
          }, FETCH_CONCURRENCY),
          toArray()
        )
    });
  }
}
