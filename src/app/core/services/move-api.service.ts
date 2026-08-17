import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Move } from '../models';

function normalizeKey(key: string | number): string {
  return String(key).trim().toLowerCase();
}

@Injectable({ providedIn: 'root' })
export class MoveApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.pokeApiBaseUrl;

  private readonly moveMap = signal(new Map<string, Move>());

  /** Must be called from an injection context (e.g. a component field initializer). */
  getMove(idOrName: string | number) {
    return rxResource({
      params: () => idOrName,
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
}
