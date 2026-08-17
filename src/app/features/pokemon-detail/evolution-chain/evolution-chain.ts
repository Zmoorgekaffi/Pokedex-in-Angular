import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { SearchIndexService } from '../../../core/services/search-index.service';
import { EvolutionNode, evolutionRequirementLabel, flattenEvolutionChain } from '../../../core/utils/evolution.util';
import { getPokemonSpriteUrl } from '../../../core/utils/pokemon.util';

// Registers <swiper-container>/<swiper-slide> as custom elements — must run once per app, not per component instance.
register();

@Component({
  selector: 'app-evolution-chain',
  imports: [],
  templateUrl: './evolution-chain.html',
  styleUrl: './evolution-chain.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EvolutionChain {
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly languageService = inject(LanguageService);
  private readonly searchIndex = inject(SearchIndexService);
  private readonly router = inject(Router);

  readonly chainId = input.required<number>();

  private readonly chainResource = this.pokemonApi.getEvolutionChain(() => this.chainId());

  readonly language = this.languageService.language;
  readonly isLoading = this.chainResource.isLoading;

  readonly nodes = computed<EvolutionNode[]>(() => {
    const chain = this.chainResource.value();
    return chain ? flattenEvolutionChain(chain.chain) : [];
  });

  spriteUrl(node: EvolutionNode): string {
    return getPokemonSpriteUrl(node.id);
  }

  displayName(node: EvolutionNode): string {
    if (this.language() === 'de') {
      const deName = this.searchIndex.entries().find((entry) => entry.id === node.id)?.nameDe;
      if (deName) {
        return deName;
      }
    }
    return node.name;
  }

  requirementLabel(node: EvolutionNode): string | undefined {
    return node.requirement ? evolutionRequirementLabel(node.requirement, this.language()) : undefined;
  }

  goToPokemon(node: EvolutionNode): void {
    this.router.navigate(['/pokemon', node.id]);
  }
}
