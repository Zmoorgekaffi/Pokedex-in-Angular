import { ChangeDetectionStrategy, Component, model } from '@angular/core';

export interface GenerationOption {
  id: number;
  label: string;
}

export const GENERATIONS: GenerationOption[] = [
  { id: 1, label: 'Generation I' },
  { id: 2, label: 'Generation II' },
  { id: 3, label: 'Generation III' },
  { id: 4, label: 'Generation IV' },
  { id: 5, label: 'Generation V' },
  { id: 6, label: 'Generation VI' },
  { id: 7, label: 'Generation VII' },
  { id: 8, label: 'Generation VIII' },
  { id: 9, label: 'Generation IX' }
];

@Component({
  selector: 'app-generation-selector',
  imports: [],
  templateUrl: './generation-selector.html',
  styleUrl: './generation-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerationSelector {
  readonly generations = GENERATIONS;
  readonly selected = model<number | undefined>(undefined);

  onChange(value: string): void {
    this.selected.set(value === '' ? undefined : Number(value));
  }
}
