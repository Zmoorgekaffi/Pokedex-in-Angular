# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` / `ng serve` — dev server at `http://localhost:4200/`, live reload
- `npm run build` / `ng build` — production build, output in `dist/`
- `npm run watch` / `ng build --watch --configuration development` — dev build with watch mode
- `npm test` / `ng test` — run unit tests via Karma/Jasmine (watches by default; runs in Chrome)
- `ng generate component <name>` — scaffold a new component (see `ng generate --help` for other schematics)

There is no e2e test setup and no lint script configured yet.

## Architecture

This is an Angular 20 project using the modern standalone-component style (no `NgModule`s):

- `src/main.ts` bootstraps `App` using `appConfig`.
- `src/app/app.config.ts` is the central provider registration point (`ApplicationConfig`). It currently wires up global error listeners, **zoneless change detection** (`provideZonelessChangeDetection()` — this app does not use `zone.js`, so change detection must be triggered via signals/`OnPush`-compatible patterns rather than relying on zone patching), and the router.
- `src/app/app.routes.ts` holds the route table (currently empty).
- `src/app/app.ts` is the root standalone component (selector `app-root`), using Angular signals (e.g. `signal('pokedex')`) for state.

The project is a freshly generated Angular CLI scaffold — no feature modules, services, or Pokemon-API integration exist yet.

Code style: Prettier is configured in `package.json` (100 print width, single quotes, Angular parser for `.html` files).

The sections below summarize the planning docs in `claude md's/` (kept there as the detailed source of truth; not auto-loaded by Claude Code since they're outside the project root, hence mirrored here). None of this is implemented yet — the codebase is still the bare CLI scaffold.

## Target stack & conventions (see `claude md's/pokedex-techstack.md`)

- Standalone components only, no `NgModule`s; `ChangeDetectionStrategy.OnPush` on every component
- State via `signal()` / `computed()` / `effect()` — no NgRx, no RxJS-based store, no `BehaviorSubject` services
- Inputs/outputs via the `input()` / `output()` signal APIs instead of `@Input()`/`@Output()` decorators where possible
- Styling: Tailwind CSS v4 with `@theme` for design tokens (colors, spacing, breakpoints), utility classes directly in templates — no per-component SCSS files, no `tailwind.config.js` (not yet installed)
- Swiper.js for horizontal scroll/carousel UI (sprite gallery, evolution chain, move cards)

## Product concept (see `claude md's/pokedex-konzept.md`)

A team-planning Pokédex focused on the single-Pokémon detail view, not a 6-Pokémon team builder:

- Core: type-effectiveness overview (weaknesses/resistances/immunities), base stats as bar chart + numbers, abilities with effect descriptions
- Movesets: full learnable moveset per Pokémon, filterable by learn method (level-up/TM/egg), hover for quick info, click for a full move detail page (power, accuracy, PP, effect)
- Navigation: search/filter by name/type/generation, one generation/game selectable at a time, simple sprites (no shiny/high-end artwork focus), evolution chain shown as a classic tree
- Explicitly out of scope: a 6-Pokémon team composer/builder

## Component structure (see `claude md's/pokedex-components.md`)

Three pages: overview/search page, Pokémon detail page, move detail page.

**Global layout**
- `AppHeader` — persistent header on every page, hosts `GlobalSearchBar`
- `GlobalSearchBar` — app-wide search by English name, German name, or numeric Pokédex ID; live dropdown suggestions fed by `SearchIndexService`; a hit navigates straight to the Pokémon detail page

**Overview page**
- `PokemonGrid` — tiled grid of sprites
- `PokemonCard` — single grid tile
- `SearchFilterBar` — in-page filter bar (separate from the global search): search on top, collapsible filters (name EN/DE, type, generation/game) below; embeds `GenerationSelector`
- `GenerationSelector` — picks which generation/game's Pokémon are shown
- `LoadMoreTrigger` — `IntersectionObserver`-based infinite scroll / "load more" at the grid's end

**Pokémon detail page**
- `PokemonHeader` — large sprite + name/types
- `TypeEffectiveness` — three columns: weak / resistant / immune
- `BaseStats` — one bar + number per stat (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
- `AbilitiesList` — abilities stacked vertically, effect text revealed accordion-style on expand
- `EvolutionChain` — Swiper slider through evolution stages
- `MovesetTable` — full learnable moveset; filter row with a learn-method dropdown (level-up / TM/VM / egg / etc.) plus a `type="number"` level filter (empty = inactive, first activation defaults to 1); rows show move left / requirement right (`justify-between`); list re-filters live as method/level change
- `MoveTooltip` — cursor-following hover tooltip with the short version of a move's info; click navigates to the move detail page

**Move detail page**
- `MoveDetailAccordion` — FAQ-style accordion, one expandable item per move, full details (power, accuracy, PP, effect) on expand; no sprites needed here

`AppHeader`/`GlobalSearchBar`, `GenerationSelector`, and `LoadMoreTrigger` were added after the initial concept pass — they weren't literal component names in `pokedex-konzept.md` but were needed to actually implement its search/generation/lazy-load requirements.

## Data flow & services (see `claude md's/pokedex-datenfluss.md`)

No NgRx, no manual RxJS `.subscribe()` management. State lives in services as signals; components consume it read-only via `input()`/`output()` — deeply nested presentational components don't reach into services directly, only container/page components do.

Flow: component calls a service method → service checks `PokemonCacheService` → cache hit returns the cached signal, cache miss triggers an HTTP call to PokeAPI, fills the cache, and updates the signal → component reads the signal (template or `computed()`).

**Services** (planned, under `core/services/`)
- `PokemonApiService` — sole access point for `/pokemon/{id|name}`, `/pokemon-species/{id}`, `/evolution-chain/{id}`, `/move/{id|name}` via `HttpClient`; returns data through `resource()`/`rxResource()` signals, no manual `.subscribe()`; always checks the cache first
- `PokemonCacheService` — in-memory `signal(new Map<string, Pokemon>())`, keyed by normalized lowercase name/ID, `get`/`set`/`has`; session-only (no `localStorage`); exists because PokeAPI's fair-use policy asks clients to cache rather than re-fetch
- `SearchIndexService` — powers global search; on first use loads a lightweight list of all Pokémon (`id`, `name_en`, `name_de` only, from `/pokemon-species/{id}` → `names` filtered by language) once for the app's lifetime, stored via `PokemonCacheService`/`signal()`; exposes a `computed()` that filters the index against the current search input (EN name, DE name, or numeric ID) for `GlobalSearchBar`'s live suggestions
- `MoveApiService` — separate service for `/move/{id|name}`, same caching strategy; used by `MovesetTable`'s hover tooltip (loads on demand, not upfront for the whole moveset) and `MoveDetailAccordion`'s full detail view

**Caching**: two levels — the per-entity in-memory signal cache (`PokemonCacheService`), and the one-time bulk-loaded search index (`SearchIndexService`, built on first `GlobalSearchBar` use, then filtered purely locally). No re-fetch for anything already cached; revisiting a Pokémon triggers no new HTTP call.

**Lazy loading**
- Overview grid: loads one page at a time via PokeAPI `limit`/`offset` (e.g. 20 at a time); `LoadMoreTrigger`'s `IntersectionObserver` calls `pokemonApiService.loadNextPage()`, results are appended (`update()`), not replaced
- Detail page: on open, fetches only `/pokemon/{id}` + `/pokemon-species/{id}`; `EvolutionChain` data loads only once that section actually renders (Angular `@defer`); individual move details load only on tooltip hover / detail-page click, never upfront
- `@defer` blocks for below-the-fold sections (`MovesetTable`, `EvolutionChain`)

**State principles**: no global store, services-with-signals are the single source of truth per data type; `computed()` for derived state (filtered moveset, search matches); `effect()` only for side effects (e.g. URL sync on filter change), never for computing state.

## Build order (see `claude md's/pokedex-roadmap.md`)

Ordered by technical dependency, not feature importance:

0. Tooling setup — install/configure Tailwind v4 (`@theme`, replace the current SCSS files), install Swiper.js, create `core/services`, `core/models`, `shared/components`, `features/*` folders, add data models
1. Core services only, no UI — `PokemonCacheService` → `PokemonApiService` → `MoveApiService` (`SearchIndexService` is deferred to step 4, it needs the fetching pattern proven first)
2. Routing skeleton for all three routes + `AppHeader` shell (`GlobalSearchBar` as an empty placeholder for now)
3. Overview page as the first vertical slice (`PokemonGrid`/`PokemonCard`/`LoadMoreTrigger`/`GenerationSelector`/`SearchFilterBar`) — proves the data layer end-to-end
4. Global search (`SearchIndexService` + finish `GlobalSearchBar`)
5. Pokémon detail page, internally in this order: `PokemonHeader` → `BaseStats` → `AbilitiesList` → `TypeEffectiveness` → `EvolutionChain` → `MovesetTable`/`MoveTooltip`
6. Move detail page (`MoveDetailAccordion`)
7. Styling/responsive polish pass + loading/error/empty states for all `resource()` calls (not yet specified elsewhere)
8. Unit tests for the services/logic layer (cache, `SearchIndexService` filter, moveset filter `computed()`s)
