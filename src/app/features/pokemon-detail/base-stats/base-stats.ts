import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MAX_BASE_STAT, STAT_LABELS_DE, STAT_LABELS_EN } from '../../../core/constants/pokemon-stat.constants';
import { LanguageService } from '../../../core/services/language.service';
import { PokemonStat } from '../../../core/models';

@Component({
  selector: 'app-base-stats',
  imports: [],
  templateUrl: './base-stats.html',
  styleUrl: './base-stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseStats {
  private readonly languageService = inject(LanguageService);

  readonly stats = input.required<PokemonStat[]>();

  readonly maxStat = MAX_BASE_STAT;

  statLabel(statName: string): string {
    const labels = this.languageService.language() === 'de' ? STAT_LABELS_DE : STAT_LABELS_EN;
    return labels[statName] ?? statName;
  }

  barWidth(value: number): number {
    return Math.min(100, (value / MAX_BASE_STAT) * 100);
  }
}
