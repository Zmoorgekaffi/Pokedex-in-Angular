import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';

@Component({
  selector: 'app-loading-spinner',
  imports: [],
  templateUrl: './loading-spinner.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinner {
  private readonly languageService = inject(LanguageService);

  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly sizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'h-4 w-4 border-2';
      case 'lg':
        return 'h-10 w-10 border-4';
      default:
        return 'h-6 w-6 border-2';
    }
  });

  readonly label = computed(() => pick(this.languageService.language(), 'Loading…', 'Lädt…'));
}
