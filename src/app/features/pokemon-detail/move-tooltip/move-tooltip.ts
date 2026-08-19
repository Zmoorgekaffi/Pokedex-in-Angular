import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { typeColor as getTypeColor, typeTextColor as getTypeTextColor } from '../../../core/constants/pokemon-type-colors.constants';
import { typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';
import { MoveApiService } from '../../../core/services/move-api.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-move-tooltip',
  imports: [LoadingSpinner],
  templateUrl: './move-tooltip.html',
  styleUrl: './move-tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveTooltip {
  private readonly moveApi = inject(MoveApiService);
  private readonly languageService = inject(LanguageService);

  readonly moveName = input<string | undefined>(undefined);
  readonly x = input(0);
  readonly y = input(0);

  private readonly moveResource = this.moveApi.getMove(() => this.moveName());

  readonly language = this.languageService.language;
  readonly isLoading = this.moveResource.isLoading;

  readonly displayName = computed(() => {
    const move = this.moveResource.value();
    if (!move) {
      return this.moveName() ?? '';
    }
    const language = this.language();
    const entry =
      move.names.find((name) => name.language.name === language) ??
      move.names.find((name) => name.language.name === 'en');
    return entry?.name ?? move.name;
  });

  readonly typeName = computed(() => this.moveResource.value()?.type.name);
  readonly power = computed(() => this.moveResource.value()?.power ?? undefined);
  readonly accuracy = computed(() => this.moveResource.value()?.accuracy ?? undefined);
  readonly pp = computed(() => this.moveResource.value()?.pp ?? undefined);

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
