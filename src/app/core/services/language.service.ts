import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'en' | 'de';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly languageSignal = signal<AppLanguage>('en');
  readonly language = this.languageSignal.asReadonly();

  set(language: AppLanguage): void {
    this.languageSignal.set(language);
  }
}
