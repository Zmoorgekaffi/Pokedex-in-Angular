import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { typeColor as getTypeColor, typeTextColor as getTypeTextColor } from '../../../core/constants/pokemon-type-colors.constants';
import { typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';
import { getPokemonSpriteUrl } from '../../../core/utils/pokemon.util';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-pokemon-header',
  imports: [LoadingSpinner],
  templateUrl: './pokemon-header.html',
  styleUrl: './pokemon-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonHeader {
  private readonly languageService = inject(LanguageService);

  readonly name = input.required<string>();
  readonly id = input.required<number>();
  readonly spriteUrl = input.required<string>();
  readonly types = input.required<string[]>();
  /** True while the page is fetching a new Pokémon (e.g. an evolution-slider jump) — `id`/`spriteUrl` stay on the previous Pokémon until then, since the page keeps them sticky for the rest of the header. */
  readonly isLoading = input.required<boolean>();

  readonly language = this.languageService.language;

  readonly paddedId = computed(() => `#${this.id().toString().padStart(3, '0')}`);

  /** A handful of IDs have no official artwork in the sprites repo — fall back to the small sprite. */
  private readonly artworkFailed = signal(false);
  /** Whether the `<img>` for the current `displaySpriteUrl()` has actually finished loading (fresh fetch or from cache). */
  private readonly imageReady = signal(false);

  readonly displaySpriteUrl = computed(() =>
    this.artworkFailed() ? getPokemonSpriteUrl(this.id()) : this.spriteUrl()
  );

  /** Hides the hero image behind the spinner both while a new Pokémon is being fetched and while its image bytes are still loading — otherwise the previous Pokémon's picture lingers on screen, reading as a broken/stuck page. */
  readonly showSpinner = computed(() => this.isLoading() || !this.imageReady());

  constructor() {
    effect(() => {
      this.id();
      this.artworkFailed.set(false);
      this.imageReady.set(false);
    });
  }

  onImageLoad(): void {
    this.imageReady.set(true);
  }

  onImageError(): void {
    this.artworkFailed.set(true);
    this.imageReady.set(false);
  }

  typeLabel(type: string): string {
    return getTypeLabel(type, this.language());
  }

  typeColor(type: string): string {
    return getTypeColor(type);
  }

  typeTextColor(type: string): string {
    return getTypeTextColor(type);
  }
}
