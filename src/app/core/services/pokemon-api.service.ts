import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, inject, runInInjectionContext } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EvolutionChain, Pokemon, PokemonSpecies } from '../models';
import { PokemonCacheService } from './pokemon-cache.service';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(PokemonCacheService);
  private readonly injector = inject(Injector);
  private readonly baseUrl = environment.pokeApiBaseUrl;

  getPokemon(idOrName: string | number) {
    return runInInjectionContext(this.injector, () =>
      rxResource({
        params: () => idOrName,
        stream: ({ params }) => {
          const cached = this.cache.getPokemon(params);
          if (cached) {
            return of(cached);
          }
          return this.http
            .get<Pokemon>(`${this.baseUrl}/pokemon/${params}`)
            .pipe(tap((pokemon) => this.cache.setPokemon(params, pokemon)));
        }
      })
    );
  }

  getPokemonSpecies(idOrName: string | number) {
    return runInInjectionContext(this.injector, () =>
      rxResource({
        params: () => idOrName,
        stream: ({ params }) => {
          const cached = this.cache.getSpecies(params);
          if (cached) {
            return of(cached);
          }
          return this.http
            .get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${params}`)
            .pipe(tap((species) => this.cache.setSpecies(params, species)));
        }
      })
    );
  }

  getEvolutionChain(id: number) {
    return runInInjectionContext(this.injector, () =>
      rxResource({
        params: () => id,
        stream: ({ params }) => {
          const cached = this.cache.getEvolutionChain(params);
          if (cached) {
            return of(cached);
          }
          return this.http
            .get<EvolutionChain>(`${this.baseUrl}/evolution-chain/${params}`)
            .pipe(tap((chain) => this.cache.setEvolutionChain(params, chain)));
        }
      })
    );
  }
}
