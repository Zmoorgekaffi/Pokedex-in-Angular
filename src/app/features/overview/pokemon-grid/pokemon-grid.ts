import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GridItem } from '../../../core/utils/pokemon.util';
import { PokemonCard } from '../pokemon-card/pokemon-card';

@Component({
  selector: 'app-pokemon-grid',
  imports: [PokemonCard],
  templateUrl: './pokemon-grid.html',
  styleUrl: './pokemon-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PokemonGrid {
  readonly items = input.required<GridItem[]>();
}
