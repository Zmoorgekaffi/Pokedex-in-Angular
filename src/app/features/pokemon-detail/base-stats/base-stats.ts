import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MAX_BASE_STAT, STAT_LABELS_DE, STAT_LABELS_EN } from '../../../core/constants/pokemon-stat.constants';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';
import { PokemonStat } from '../../../core/models';
import { ComponentTitle } from '../../../shared/components/component-title/component-title';

@Component({
  selector: 'app-base-stats',
  imports: [ComponentTitle],
  templateUrl: './base-stats.html',
  styleUrl: './base-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseStats {
  private readonly languageService = inject(LanguageService);

  readonly stats = input.required<PokemonStat[]>();

  readonly maxStat = MAX_BASE_STAT;

  readonly title = computed(() => pick(this.languageService.language(), 'Base Stats', 'Basiswerte'));

  statLabel(statName: string): string {
    const labels = this.languageService.language() === 'de' ? STAT_LABELS_DE : STAT_LABELS_EN;
    return labels[statName] ?? statName;
  }

  barWidth(value: number): number {
    return Math.min(100, (value / MAX_BASE_STAT) * 100);
  }
}
