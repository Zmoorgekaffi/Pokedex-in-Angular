import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TypeRelations } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { extractIdFromResourceUrl, getPokemonSpriteUrl } from '../../../core/utils/pokemon.util';
import { computeTypeEffectiveness } from '../../../core/utils/type-effectiveness.util';
import { AbilitiesList } from '../abilities-list/abilities-list';
import { BaseStats } from '../base-stats/base-stats';
import { EvolutionChain } from '../evolution-chain/evolution-chain';
import { MovesetTable } from '../moveset-table/moveset-table';
import { PokemonHeader } from '../pokemon-header/pokemon-header';
import { TypeEffectiveness } from '../type-effectiveness/type-effectiveness';

@Component({
  selector: 'app-pokemon-detail-page',
  imports: [PokemonHeader, BaseStats, AbilitiesList, TypeEffectiveness, EvolutionChain, MovesetTable],
  templateUrl: './pokemon-detail-page.html',
  styleUrl: './pokemon-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonDetailPage {
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly languageService = inject(LanguageService);

  readonly id = input<string>();

  private readonly pokemonResource = this.pokemonApi.getPokemon(() => this.id());
  private readonly speciesResource = this.pokemonApi.getPokemonSpecies(() => this.id());

  readonly pokemon = computed(() => this.pokemonResource.value());
  private readonly species = computed(() => this.speciesResource.value());

  readonly types = computed<string[]>(() => this.pokemon()?.types.map((t) => t.type.name) ?? []);

  private readonly type1Resource = this.pokemonApi.getType(() => this.types()[0]);
  private readonly type2Resource = this.pokemonApi.getType(() => this.types()[1]);

  readonly isLoading = computed(() => this.pokemonResource.isLoading() || this.speciesResource.isLoading());
  readonly error = computed(() => this.pokemonResource.error() ?? this.speciesResource.error());

  readonly displayName = computed(() => {
    const pokemon = this.pokemon();
    const species = this.species();
    if (!species) {
      return pokemon?.name ?? '';
    }
    const language = this.languageService.language();
    const entry =
      species.names.find((name) => name.language.name === language) ??
      species.names.find((name) => name.language.name === 'en');
    return entry?.name ?? pokemon?.name ?? '';
  });

  /**
   * Deliberately always the jsDelivr-mirrored simple sprite (matches "simple sprites, no
   * shiny/high-end artwork focus" from the product concept), never `sprites.other['official-artwork']`
   * — that field is a full URL returned directly by PokeAPI and points at raw.githubusercontent.com,
   * which is not meant for hotlinking and rate-limits hard under sustained traffic (see
   * getPokemonSpriteUrl's comment for how this was diagnosed).
   */
  readonly spriteUrl = computed(() => {
    const pokemon = this.pokemon();
    return pokemon ? getPokemonSpriteUrl(pokemon.id) : '';
  });

  readonly typeEffectiveness = computed(() => {
    const relations = [this.type1Resource.value()?.damage_relations, this.type2Resource.value()?.damage_relations].filter(
      (relation): relation is TypeRelations => !!relation
    );
    return computeTypeEffectiveness(relations);
  });

  readonly evolutionChainId = computed<number | undefined>(() => {
    const url = this.species()?.evolution_chain.url;
    return url ? extractIdFromResourceUrl(url) : undefined;
  });
}
