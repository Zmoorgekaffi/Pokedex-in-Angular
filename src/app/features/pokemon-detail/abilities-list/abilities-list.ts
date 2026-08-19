import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { PokemonAbility } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { pick } from '../../../core/utils/i18n.util';
import { ComponentTitle } from '../../../shared/components/component-title/component-title';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-abilities-list',
  imports: [ComponentTitle, LoadingSpinner],
  templateUrl: './abilities-list.html',
  styleUrl: './abilities-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbilitiesList {
  private readonly pokemonApi = inject(PokemonApiService);
  private readonly languageService = inject(LanguageService);

  readonly abilities = input.required<PokemonAbility[]>();

  readonly language = this.languageService.language;

  readonly title = computed(() => pick(this.language(), 'Abilities', 'Fähigkeiten'));

  /** Single-open accordion: only the expanded ability's name is set, which also gates the fetch below. */
  private readonly expandedName = signal<string | undefined>(undefined);

  /** Must be a field initializer (real injection context) — see gotcha in CLAUDE.md re: rxResource + own injector. */
  private readonly abilityDetailResource = this.pokemonApi.getAbility(() => this.expandedName());

  readonly isLoadingDetail = this.abilityDetailResource.isLoading;

  isExpanded(ability: PokemonAbility): boolean {
    return this.expandedName() === ability.ability.name;
  }

  toggle(ability: PokemonAbility): void {
    this.expandedName.update((current) => (current === ability.ability.name ? undefined : ability.ability.name));
  }

  effectText(ability: PokemonAbility): string | undefined {
    if (!this.isExpanded(ability)) {
      return undefined;
    }
    const detail = this.abilityDetailResource.value();
    if (!detail || detail.name !== ability.ability.name) {
      return undefined;
    }
    const language = this.language();
    const entry =
      detail.effect_entries.find((e) => e.language.name === language) ??
      detail.effect_entries.find((e) => e.language.name === 'en');
    return entry?.short_effect ?? entry?.effect;
  }
}
