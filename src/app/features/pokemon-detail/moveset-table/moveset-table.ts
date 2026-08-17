import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LEARN_METHOD_ORDER,
  learnMethodLabel as getLearnMethodLabel
} from '../../../core/constants/move-learn-method.constants';
import { POKEMON_TYPES, typeLabel as getTypeLabel } from '../../../core/constants/pokemon-type.constants';
import { typeColor as getTypeColor, typeTextColor as getTypeTextColor } from '../../../core/constants/pokemon-type-colors.constants';
import { Move, PokemonMove } from '../../../core/models';
import { LanguageService } from '../../../core/services/language.service';
import { MoveApiService } from '../../../core/services/move-api.service';
import { pick } from '../../../core/utils/i18n.util';
import { buildMovesetRows, MovesetRow } from '../../../core/utils/moveset.util';
import { MoveTooltip } from '../move-tooltip/move-tooltip';

export interface MoveTypeGroup {
  type: string;
  rows: MovesetRow[];
}

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

  /** Bulk-fetches (concurrency-capped) every distinct move this Pokémon knows, once, so rows can show localized names/types instead of just the EN slug. */
  private readonly moveNames = computed<string[]>(() => [...new Set(this.rows().map((row) => row.name))]);
  private readonly movesResource = this.moveApi.getMoves(() => this.moveNames());
  private readonly moveByName = computed<Map<string, Move>>(
    () => new Map((this.movesResource.value() ?? []).map((move) => [move.name, move]))
  );
  readonly isLoadingTypes = this.movesResource.isLoading;

  readonly availableMethods = computed<string[]>(() => {
    const present = new Set(this.rows().map((row) => row.method));
    return LEARN_METHOD_ORDER.filter((method) => present.has(method)).concat(
      [...present].filter((method) => !LEARN_METHOD_ORDER.includes(method))
    );
  });

  /** Defaults to level-up — the most common/expected view of a moveset. */
  readonly methodFilter = signal<string | undefined>('level-up');
  readonly levelFilter = signal<number | undefined>(undefined);

  /** The level number filter only makes sense (and is only shown) for the level-up method — machine/egg/tutor rows are always level 0. */
  readonly showLevelFilter = computed(() => this.methodFilter() === 'level-up');

  readonly filteredRows = computed<MovesetRow[]>(() => {
    const method = this.methodFilter();
    const level = this.showLevelFilter() ? this.levelFilter() : undefined;
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

  /** Groups the (already method/level-filtered) rows by the move's own type — "Fire" is one accordion, "Ghost" another, etc. */
  readonly groupedByType = computed<MoveTypeGroup[]>(() => {
    const byName = this.moveByName();
    if (byName.size === 0) {
      return [];
    }
    const groups = new Map<string, MovesetRow[]>();
    for (const row of this.filteredRows()) {
      const type = byName.get(row.name)?.type.name ?? 'unknown';
      const list = groups.get(type);
      if (list) {
        list.push(row);
      } else {
        groups.set(type, [row]);
      }
    }
    const ordered = POKEMON_TYPES.filter((type) => groups.has(type)).map((type) => ({ type, rows: groups.get(type)! }));
    return groups.has('unknown') ? [...ordered, { type: 'unknown', rows: groups.get('unknown')! }] : ordered;
  });

  /** Which type accordions are open. Seeded with the first group once data first arrives; left alone after that so user toggles stick. */
  readonly expandedTypes = signal<ReadonlySet<string>>(new Set());

  readonly hoveredMoveName = signal<string | undefined>(undefined);
  readonly hoverX = signal(0);
  readonly hoverY = signal(0);

  readonly methodPlaceholder = computed(() => pick(this.language(), 'All methods', 'Alle Methoden'));
  readonly levelPlaceholder = computed(() => pick(this.language(), 'Level', 'Level'));

  private readonly methodSelect = viewChild<ElementRef<HTMLSelectElement>>('methodSelect');

  constructor() {
    effect(() => {
      const groups = this.groupedByType();
      if (groups.length > 0 && this.expandedTypes().size === 0) {
        this.expandedTypes.set(new Set([groups[0].type]));
      }
    });

    /**
     * A native <select>'s [value] binding is a no-op if it's applied before the matching
     * <option> (rendered by the @for below, from availableMethods()) actually exists in the DOM
     * — the browser doesn't retroactively re-select once that option shows up, so the select
     * visually fell back to the first <option> ("Alle Methoden") even though methodFilter() was
     * already 'level-up'. Re-applying .value imperatively whenever the options list changes (not
     * just when methodFilter() changes) fixes the mismatch — but it must happen in a *new*
     * macrotask: doing it synchronously inside the effect gets stomped back to '' by Angular's own
     * [value] binding re-running later in the same change-detection pass (confirmed by tracing
     * every step: the assignment succeeds immediately, then reverts before detectChanges returns).
     */
    effect(() => {
      this.availableMethods();
      const select = this.methodSelect()?.nativeElement;
      const value = this.methodFilter() ?? '';
      if (select) {
        setTimeout(() => {
          select.value = value;
        });
      }
    });
  }

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

  typeLabel(type: string): string {
    return getTypeLabel(type, this.language());
  }

  typeColor(type: string): string {
    return getTypeColor(type);
  }

  typeTextColor(type: string): string {
    return getTypeTextColor(type);
  }

  isExpanded(type: string): boolean {
    return this.expandedTypes().has(type);
  }

  toggleType(type: string): void {
    this.expandedTypes.update((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
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
