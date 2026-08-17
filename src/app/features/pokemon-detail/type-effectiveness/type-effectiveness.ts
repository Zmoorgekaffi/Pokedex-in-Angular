import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';

@Component({
  selector: 'app-type-effectiveness',
  imports: [],
  templateUrl: './type-effectiveness.html',
  styleUrl: './type-effectiveness.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeEffectiveness {
  private readonly languageService = inject(LanguageService);

  readonly weak = input.required<string[]>();
  readonly resistant = input.required<string[]>();
  readonly immune = input.required<string[]>();

  readonly language = this.languageService.language;

  readonly weakLabel = computed(() => pick(this.language(), 'Weak', 'Schwach'));
  readonly resistantLabel = computed(() => pick(this.language(), 'Resistant', 'Resistent'));
  readonly immuneLabel = computed(() => pick(this.language(), 'Immune', 'Immun'));

  typeLabel(type: string): string {
    return getTypeLabel(type, this.language());
  }
}
