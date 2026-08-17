import { AppLanguage } from '../services/language.service';

export function pick(language: AppLanguage, en: string, de: string): string {
  return language === 'de' ? de : en;
}
