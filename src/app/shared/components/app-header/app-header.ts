import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppLanguage, LanguageService } from '../../../core/services/language.service';
import { GlobalSearchBar } from '../global-search-bar/global-search-bar';

@Component({
  selector: 'app-header',
  imports: [RouterLink, GlobalSearchBar],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeader {
  private readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;

  setLanguage(language: AppLanguage): void {
    this.languageService.set(language);
  }
}
