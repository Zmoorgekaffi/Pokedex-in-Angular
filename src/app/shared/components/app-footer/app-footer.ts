import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooter {
  private readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;

  readonly overviewLabel = computed(() => pick(this.language(), 'Overview', 'Übersicht'));
  readonly aboutLabel = computed(() => pick(this.language(), 'About this project', 'Über dieses Projekt'));
  readonly aboutPortfolio = computed(() => pick(this.language(), "More Project's", "Mehr Projekte"));
}
