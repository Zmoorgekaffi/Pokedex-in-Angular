import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LEARN_METHOD_ORDER,
  learnMethodLabel as getLearnMethodLabel
} from '../../../core/constants/move-learn-method.constants';
import { typeColor as getTypeColor, typeTextColor as getTypeTextColor } from '../../../core/constants/pokemon-type-colors.constants';
import { Move, PokemonMove } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { MoveApiService } from '../../../core/services/move-api.service';
import { pick } from '../../../core/utils/i18n.util';
import { buildMovesetRows, MovesetRow } from '../../../core/utils/moveset.util';
import { MoveTooltip } from '../move-tooltip/move-tooltip';

@Component({
  selector: 'app-moveset-table',
  imports: [RouterLink, MoveTooltip],
  templateUrl: './moveset-table.html',
  styleUrl: './moveset-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovesetTable {
  private readonly languageService = inject(LanguageService);
  private readonly moveApi = inject(MoveApiService);

  readonly moves = input.required<PokemonMove[]>();

  readonly language = this.languageService.language;

  private readonly rows = computed<MovesetRow[]>(() => buildMovesetRows(this.moves()));

  /** Bulk-fetches (concurrency-capped) every distinct move this Pokémon knows, once, so rows can show localized names/type colors instead of just the EN slug. */
  private readonly moveNames = computed<string[]>(() => [...new Set(this.rows().map((row) => row.name))]);
  private readonly movesResource = this.moveApi.getMoves(() => this.moveNames());
  private readonly moveByName = computed<Map<string, Move>>(
    () => new Map((this.movesResource.value() ?? []).map((move) => [move.name, move]))
  );

  readonly availableMethods = computed<string[]>(() => {
    const present = new Set(this.rows().map((row) => row.method));
    return LEARN_METHOD_ORDER.filter((method) => present.has(method)).concat(
      [...present].filter((method) => !LEARN_METHOD_ORDER.includes(method))
    );
  });

  /** Defaults to level-up — the most common/expected view of a moveset. */
  readonly methodFilter = signal<string | undefined>('level-up');
  readonly levelFilter = signal<number | undefined>(undefined);

  readonly filteredRows = computed<MovesetRow[]>(() => {
    const method = this.methodFilter();
    const level = this.levelFilter();
    return this.rows().filter((row) => {
      if (method && row.method !== method) {
        return false;
      }
      if (level !== undefined && row.level !== level) {
        return false;
      }
      return true;
    });
  });

  readonly hoveredMoveName = signal<string | undefined>(undefined);
  readonly hoverX = signal(0);
  readonly hoverY = signal(0);

  readonly methodPlaceholder = computed(() => pick(this.language(), 'All methods', 'Alle Methoden'));
  readonly levelPlaceholder = computed(() => pick(this.language(), 'Level', 'Level'));

  learnMethodLabel(method: string): string {
    return getLearnMethodLabel(method, this.language());
  }

  requirementLabel(row: MovesetRow): string {
    return row.method === 'level-up' ? `Lvl. ${row.level}` : this.learnMethodLabel(row.method);
  }

  /** Falls back to the EN slug until the bulk move fetch resolves that row's entry. */
  displayMoveName(row: MovesetRow): string {
    const move = this.moveByName().get(row.name);
    if (!move) {
      return row.name;
    }
    const language = this.language();
    const entry =
      move.names.find((name) => name.language.name === language) ??
      move.names.find((name) => name.language.name === 'en');
    return entry?.name ?? move.name;
  }

  moveType(row: MovesetRow): string | undefined {
    return this.moveByName().get(row.name)?.type.name;
  }

  typeColor(type: string): string {
    return getTypeColor(type);
  }

  typeTextColor(type: string): string {
    return getTypeTextColor(type);
  }

  onMethodChange(value: string): void {
    this.methodFilter.set(value === '' ? undefined : value);
  }

  onLevelInput(value: string): void {
    this.levelFilter.set(value === '' ? undefined : Math.max(1, Number(value)));
  }

  onRowEnter(row: MovesetRow, event: MouseEvent): void {
    this.hoveredMoveName.set(row.name);
    this.hoverX.set(event.clientX);
    this.hoverY.set(event.clientY);
  }

  onRowMove(event: MouseEvent): void {
    this.hoverX.set(event.clientX);
    this.hoverY.set(event.clientY);
  }

  onRowLeave(): void {
    this.hoveredMoveName.set(undefined);
  }
}
