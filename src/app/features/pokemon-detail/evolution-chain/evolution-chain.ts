import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import type { Swiper } from 'swiper';
import type { SwiperContainer } from 'swiper/element/bundle';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { SearchIndexService } from '../../../core/services/search-index.service';
import { EvolutionNode, evolutionRequirementLabel, flattenEvolutionChain } from '../../../core/utils/evolution.util';
import { getPokemonSpriteUrl } from '../../../core/utils/pokemon.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

// Registers <swiper-container>/<swiper-slide> as custom elements — must run once per app, not per component instance.
register();

@Component({
  selector: 'app-evolution-chain',
  imports: [LoadingSpinner],
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

  /** Falls back to 0 if the current Pokémon isn't in this chain. */
  readonly initialSlideIndex = computed(() => {
    const index = this.nodes().findIndex((node) => node.id === this.currentId());
    return index === -1 ? 0 : index;
  });

  private readonly swiperEl = viewChild<ElementRef<SwiperContainer>>('swiperEl');
  private swiperInitialized = false;
  /** The chain the currently-live Swiper instance was built for — see the reinit branch below. */
  private initializedChainId: number | undefined;

  constructor() {
    /**
     * `init="false"` on the template keeps Swiper Element from auto-initializing on
     * `connectedCallback`. Auto-init would read `initial-slide` off the DOM attributes at that
     * exact moment — but Angular appends the element to the (already-connected) DOM as part of
     * its "create" pass and only applies attribute/property bindings in a later "update" pass, so
     * `connectedCallback` always fires before any Angular-bound value for `initial-slide` exists.
     * That silently defaulted the slider to slide 0 on every fresh page load. Initializing
     * manually here, after setting `.initialSlide` as a JS property, sidesteps the race entirely.
     */
    effect(() => {
      const el = this.swiperEl()?.nativeElement;
      const hasNodes = this.nodes().length > 0;
      const targetIndex = this.initialSlideIndex();
      const chainId = this.chainId();
      if (!el || !hasNodes) {
        return;
      }
      if (!this.swiperInitialized || this.initializedChainId !== chainId) {
        /**
         * Either the first mount, or this same `EvolutionChain` instance got reused for a
         * *different* evolution chain entirely — e.g. navigating from the detail page via the
         * global search bar to an unrelated Pokémon, which Angular's router serves by reusing the
         * component (same `/pokemon/:id` route) rather than recreating it. `chainId` changing
         * means `nodes()` is now a whole different set of slides, not just a different position
         * within the same set — asking the *existing* Swiper instance to `slideTo` an index is
         * unreliable here because its internal slide model can still be stale relative to the
         * `@for`-rendered DOM (it only catches up via its own MutationObserver, on its own
         * schedule). Destroying and re-initializing is what the previous slider-navigation fix
         * intentionally avoided for the same-chain case (see the `slideTo` branch below) but is
         * exactly what's needed when the slide set itself changed.
         */
        el.swiper?.destroy(true, true);
        this.swiperInitialized = true;
        this.initializedChainId = chainId;
        el.initialSlide = targetIndex;
        el.initialize();
        return;
      }
      /**
       * Same chain, same Swiper instance — this same `EvolutionChain` instance stays mounted
       * across `/pokemon/:id` navigations that don't touch the route structure (browser
       * back/forward, a global-search hit to a sibling in this chain, clicking a different
       * evolution stage's link elsewhere on the page). `onSlideChangeEnd` only moves the slider
       * for navigations that *originated* from the slider itself (a swipe/click/nav arrow already
       * left `swiper.activeIndex` in the right place); every other kind of navigation just updates
       * `currentId` and otherwise leaves the slider exactly where it was, which is what showed
       * pidgey/an unrelated stage instead of the Pokémon actually open on the page. Keep the
       * active slide in sync with `currentId` here instead.
       */
      const swiper = el.swiper;
      if (swiper && swiper.activeIndex !== targetIndex) {
        swiper.slideTo(targetIndex);
      }
    });
  }

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
    if (!node || node.id === this.currentId()) {
      return;
    }
    // Explicitly re-pin the scroll position around the navigation: Router itself has no scroll
    // behavior configured (verified — no withInMemoryScrolling, and grepping the router package
    // for scroll handling turns up nothing), so whatever resets the viewport to top is some other
    // browser-level side effect (most likely focus loss when Swiper's own DOM updates around the
    // slide change) rather than anything Angular is doing on purpose. Restoring is more reliable
    // than chasing the exact native mechanism further without being able to inspect it in a browser.
    const scrollY = window.scrollY;
    void this.router.navigate(['/pokemon', node.id]).then(() => {
      requestAnimationFrame(() => window.scrollTo({ top: scrollY }));
    });
  }
}
