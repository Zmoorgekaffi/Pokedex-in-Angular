import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild
} from '@angular/core';
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
  private readonly headerRef = viewChild.required<ElementRef<HTMLElement>>('headerRef');

  readonly language = this.languageService.language;

  constructor() {
    /** Publishes the header's real (responsive) height so sticky elements below it, e.g. SearchFilterBar, can offset below it instead of assuming a fixed pixel value. */
    afterNextRender(() => {
      const element = this.headerRef().nativeElement;
      const setHeight = () =>
        document.documentElement.style.setProperty('--app-header-height', `${element.offsetHeight}px`);

      setHeight();
      new ResizeObserver(setHeight).observe(element);
    });
  }

  setLanguage(language: AppLanguage): void {
    this.languageService.set(language);
  }
}
