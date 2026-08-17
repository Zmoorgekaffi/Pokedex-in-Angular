import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Ability,
  EvolutionChain,
  Generation,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  TypeDetail
} from '../models';
import { PokemonCacheService } from './pokemon-cache.service';

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(PokemonCacheService);
  private readonly baseUrl = environment.pokeApiBaseUrl;

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "route param not resolved yet".
   */
  getPokemon(params: () => string | number | undefined) {
    return rxResource({
      params,
      stream: ({ params }) => {
        const cached = this.cache.getPokemon(params);
        if (cached) {
          return of(cached);
        }
        return this.http
          .get<Pokemon>(`${this.baseUrl}/pokemon/${params}`)
          .pipe(tap((pokemon) => this.cache.setPokemon(params, pokemon)));
      }
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "route param not resolved yet".
   */
  getPokemonSpecies(params: () => string | number | undefined) {
    return rxResource({
      params,
      stream: ({ params }) => {
        const cached = this.cache.getSpecies(params);
        if (cached) {
          return of(cached);
        }
        return this.http
          .get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${params}`)
          .pipe(tap((species) => this.cache.setSpecies(params, species)));
      }
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "route param not resolved yet".
   */
  getEvolutionChain(params: () => number | undefined) {
    return rxResource({
      params,
      stream: ({ params }) => {
        const cached = this.cache.getEvolutionChain(params);
        if (cached) {
          return of(cached);
        }
        return this.http
          .get<EvolutionChain>(`${this.baseUrl}/evolution-chain/${params}`)
          .pipe(tap((chain) => this.cache.setEvolutionChain(params, chain)));
      }
    });
  }

  /** Must be called from an injection context (e.g. a component field initializer). */
  getPokemonPage(params: () => { limit: number; offset: number }) {
    return rxResource({
      params,
      stream: ({ params }) =>
        this.http.get<PokemonListResponse>(
          `${this.baseUrl}/pokemon?limit=${params.limit}&offset=${params.offset}`
        )
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "no generation selected".
   */
  getGeneration(params: () => number | undefined) {
    return rxResource({
      params,
      stream: ({ params: id }) => this.http.get<Generation>(`${this.baseUrl}/generation/${id}`)
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "no type selected".
   */
  getType(params: () => string | undefined) {
    return rxResource({
      params,
      stream: ({ params: name }) => this.http.get<TypeDetail>(`${this.baseUrl}/type/${name}`)
    });
  }

  /**
   * Must be called from an injection context. `params` returning `undefined` keeps the
   * resource idle (no request) — used for "no ability expanded yet".
   */
  getAbility(params: () => string | undefined) {
    return rxResource({
      params,
      stream: ({ params: idOrName }) => {
        const cached = this.cache.getAbility(idOrName);
        if (cached) {
          return of(cached);
        }
        return this.http
          .get<Ability>(`${this.baseUrl}/ability/${idOrName}`)
          .pipe(tap((ability) => this.cache.setAbility(idOrName, ability)));
      }
    });
  }
}
