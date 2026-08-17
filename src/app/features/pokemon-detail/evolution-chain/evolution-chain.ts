import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import type { Swiper } from 'swiper';
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
  /** The Pokémon currently open on the detail page — used to center the slider on load. */
  readonly currentId = input.required<number>();

  private readonly chainResource = this.pokemonApi.getEvolutionChain(() => this.chainId());

  readonly language = this.languageService.language;
  readonly isLoading = this.chainResource.isLoading;

  readonly nodes = computed<EvolutionNode[]>(() => {
    const chain = this.chainResource.value();
    return chain ? flattenEvolutionChain(chain.chain) : [];
  });

  /** Read once by Swiper at init (`initial-slide`) — falls back to 0 if the current Pokémon isn't in this chain. */
  readonly initialSlideIndex = computed(() => {
    const index = this.nodes().findIndex((node) => node.id === this.currentId());
    return index === -1 ? 0 : index;
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

  /**
   * Fires once a slide-change settles — from swiping, the nav arrows, or clicking a slide
   * (`slide-to-clicked-slide` centers it first, which itself triggers this same event), so
   * every way of picking a different evolution funnels through one navigation.
   */
  onSlideChangeEnd(event: CustomEvent<[Swiper]>): void {
    const [swiper] = event.detail;
    const node = this.nodes()[swiper.activeIndex];
    if (node && node.id !== this.currentId()) {
      this.router.navigate(['/pokemon', node.id]);
    }
  }
}
