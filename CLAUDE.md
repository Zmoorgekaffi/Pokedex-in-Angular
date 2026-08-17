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
- `src/app/app.routes.ts` holds the route table: `/` (overview), `/pokemon/:id`, `/move/:id`, all lazy via `loadComponent`.
- `src/app/app.ts` is the root standalone component (selector `app-root`); just renders `AppHeader` + `<router-outlet />`, no state of its own.

Code style: Prettier is configured in `package.json` (100 print width, single quotes, Angular parser for `.html` files). Component schematics default to `style: css` + `changeDetection: OnPush` (see `angular.json`), so `ng generate component` already matches convention.

## Current status (2026-08-17)

Phases 0–3 of the roadmap below are done and pushed to `origin/master`. Phase 4 (global search) is next.

- **Phase 0/1** — Tailwind v4 (`.postcssrc.json` + `src/styles.css`, `@theme` block), Swiper installed (not wired into any component yet), folder skeleton, `environment.ts`/`environment.development.ts` (`pokeApiBaseUrl`), models for `Pokemon`/`PokemonSpecies`/`Move`/`EvolutionChain` in `core/models/` (snake_case, mirror the raw PokeAPI JSON — no DTO mapping layer). `PokemonCacheService` (3 separate signal `Map`s for Pokemon/Species/EvolutionChain), `PokemonApiService`, `MoveApiService`.
- **Phase 2** — Routes for `/`, `/pokemon/:id`, `/move/:id` (lazy `loadComponent`) in `app.routes.ts`; `withComponentInputBinding()` is enabled so route params arrive as `input()` signals on page components. `AppHeader` (persistent) hosts `GlobalSearchBar`, which is still just a disabled placeholder input — its real logic is Phase 4's job.
- **Phase 3** — Overview page is a working vertical slice: `PokemonGrid`/`PokemonCard`/`LoadMoreTrigger`/`GenerationSelector`/`SearchFilterBar`, wired into `OverviewPage`. Default browsing paginates the national dex via `/pokemon?limit&offset`; selecting a generation hits `/generation/{id}`, selecting a type hits `/type/{name}` (a real fetch, not a client-only filter over what's loaded); selecting both intersects the two result sets client-side. Sprite images for grid tiles are built directly from the numeric ID (`core/utils/pokemon.util.ts` → `getPokemonSpriteUrl`, pointed at `raw.githubusercontent.com/PokeAPI/sprites`) instead of fetching each Pokémon individually — this is a deliberate deviation from "PokemonApiService is the sole access point," justified purely to avoid N+1 fetches for a grid; revisit if that tradeoff stops making sense.

### Gotchas learned the hard way (read before touching resources/services again)

- **`rxResource()` on this Angular version (20.3.28) uses `params`/`stream`, not the older `request`/`loader` naming** — check `node_modules/@angular/core/rxjs-interop/index.d.ts` / `api.d.d.ts` directly if unsure, don't trust memory/older docs.
- **`params` returning `undefined` keeps a resource idle (no request); `null` does not** — it happily fetches `.../undefined`-shaped URLs otherwise. Optional filter params (e.g. `selectedGeneration`, `selectedType`) must be typed `T | undefined`, never `T | null`.
- **`PokemonApiService`/`MoveApiService` methods that return `rxResource()` must be called from a real injection context** (a component field initializer or constructor) — do not wrap them in `runInInjectionContext(someInjector, ...)` inside the service using the *service's own* injector. That was tried in Phase 1 and reverted in Phase 3: it silently binds the resource's lifecycle to the root injector instead of the calling component, so the resource is never torn down when the component is destroyed (a leak). Calling these methods as a component field initializer works correctly with no wrapper needed.
- **`LoadMoreTrigger`'s `IntersectionObserver` only fires on intersection *crossings*, not continuously** — gating `loadMore.emit()` only inside the observer callback caused a real, reproduced bug (see commit `a9c2aa2`): the sentinel could already be visible on mount, firing `loadMore()` while the first page was still loading, which raced ahead and silently dropped page 1. Fix: track intersection in a signal and re-evaluate via `effect()` on every `disabled()` change too, and make sure `disabled` accounts for the relevant resource's `isLoading()`, not just "no more data". Any future infinite-scroll/defer-loaded section (e.g. `EvolutionChain`, `MovesetTable`) should reuse `LoadMoreTrigger` as-is rather than re-implementing this.
- No screenshot/browser-automation tool is available in this environment — verification so far has relied on `ng build`, `ng test`, and temporary throwaway spec files that hit the **real** PokeAPI (written, run, then deleted — see git history for examples). Keep doing that for new data-layer work; ask the user to eyeball actual UI/UX in their own browser.

The sections below summarize the planning docs in `claude md's/` (kept there as the detailed source of truth; not auto-loaded by Claude Code since they're outside the project root, hence mirrored here). They describe the *full* target design; check "Current status" above for what's actually built so far — everything from Phase 4 onward below is still just the plan.

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

0. ✅ Tooling setup — install/configure Tailwind v4 (`@theme`, replace the current SCSS files), install Swiper.js, create `core/services`, `core/models`, `shared/components`, `features/*` folders, add data models
1. ✅ Core services only, no UI — `PokemonCacheService` → `PokemonApiService` → `MoveApiService` (`SearchIndexService` is deferred to step 4, it needs the fetching pattern proven first)
2. ✅ Routing skeleton for all three routes + `AppHeader` shell (`GlobalSearchBar` as an empty placeholder for now)
3. ✅ Overview page as the first vertical slice (`PokemonGrid`/`PokemonCard`/`LoadMoreTrigger`/`GenerationSelector`/`SearchFilterBar`) — proves the data layer end-to-end
4. ⬅️ **next up** — Global search (`SearchIndexService` + finish `GlobalSearchBar`)
5. Pokémon detail page, internally in this order: `PokemonHeader` → `BaseStats` → `AbilitiesList` → `TypeEffectiveness` → `EvolutionChain` → `MovesetTable`/`MoveTooltip`
6. Move detail page (`MoveDetailAccordion`)
7. Styling/responsive polish pass + loading/error/empty states for all `resource()` calls (not yet specified elsewhere)
8. Unit tests for the services/logic layer (cache, `SearchIndexService` filter, moveset filter `computed()`s)
