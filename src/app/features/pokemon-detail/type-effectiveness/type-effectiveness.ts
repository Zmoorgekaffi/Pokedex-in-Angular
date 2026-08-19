import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { typeColor as getTypeColor, typeTextColor as getTypeTextColor } from '../../../core/constants/pokemon-type-colors.constants';
import { typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';
import { ComponentTitle } from '../../../shared/components/component-title/component-title';

@Component({
  selector: 'app-type-effectiveness',
  imports: [ComponentTitle],
  templateUrl: './type-effectiveness.html',
  styleUrl: './type-effectiveness.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEffectiveness {
  private readonly languageService = inject(LanguageService);

  readonly veryEffective = input.required<string[]>();
  readonly effective = input.required<string[]>();
  readonly resistant = input.required<string[]>();
  readonly immune = input.required<string[]>();

  readonly language = this.languageService.language;

  readonly title = computed(() => pick(this.language(), 'Type Effectiveness', 'Typen-Effektivität'));

  readonly veryEffectiveLabel = computed(() => pick(this.language(), 'Very Effective', 'Sehr effektiv'));
  readonly effectiveLabel = computed(() => pick(this.language(), 'Effective', 'Effektiv'));
  readonly resistantLabel = computed(() => pick(this.language(), 'Resistant', 'Resistent'));
  readonly immuneLabel = computed(() => pick(this.language(), 'Immune', 'Immun'));

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
