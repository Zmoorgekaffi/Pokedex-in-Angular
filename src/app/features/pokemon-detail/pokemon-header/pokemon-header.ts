import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-pokemon-header',
  imports: [],
  templateUrl: './pokemon-header.html',
  styleUrl: './pokemon-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonHeader {
  private readonly languageService = inject(LanguageService);

  readonly name = input.required<string>();
  readonly id = input.required<number>();
  readonly spriteUrl = input.required<string>();
  readonly types = input.required<string[]>();

  readonly language = this.languageService.language;

  readonly paddedId = computed(() => `#${this.id().toString().padStart(3, '0')}`);

  typeLabel(type: string): string {
    return getTypeLabel(type, this.language());
  }
}
