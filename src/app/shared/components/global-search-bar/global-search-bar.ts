import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SearchIndexEntry } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { SearchIndexService } from '../../../core/services/search-index.service';
import { filterSearchIndex } from '../../../core/utils/search.util';

const MAX_SUGGESTIONS = 8;
const BLUR_CLOSE_DELAY_MS = 150;

@Component({
  selector: 'app-global-search-bar',
  imports: [],
  templateUrl: './global-search-bar.html',
  styleUrl: './global-search-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSearchBar {
  private readonly router = inject(Router);
  private readonly searchIndex = inject(SearchIndexService);
  private readonly languageService = inject(LanguageService);

  readonly query = signal('');
  readonly isOpen = signal(false);
  readonly isLoading = this.searchIndex.isLoading;
  readonly language = this.languageService.language;

  readonly matches = computed<SearchIndexEntry[]>(() => {
    const query = this.query();
    if (!query.trim()) {
      return [];
    }
    return filterSearchIndex(this.searchIndex.entries(), query).slice(0, MAX_SUGGESTIONS);
  });

  onFocus(): void {
    this.searchIndex.ensureLoaded();
    this.isOpen.set(true);
  }

  onInput(value: string): void {
    this.query.set(value);
    this.searchIndex.ensureLoaded();
    this.isOpen.set(true);
  }

  onBlur(): void {
    // Delayed so a suggestion's (mousedown) still fires before the dropdown closes.
    setTimeout(() => this.isOpen.set(false), BLUR_CLOSE_DELAY_MS);
  }

  displayName(entry: SearchIndexEntry): string {
    return this.language() === 'de' ? entry.nameDe : entry.nameEn;
  }

  selectEntry(entry: SearchIndexEntry): void {
    this.isOpen.set(false);
    this.query.set('');
    this.router.navigate(['/pokemon', entry.id]);
  }
}
