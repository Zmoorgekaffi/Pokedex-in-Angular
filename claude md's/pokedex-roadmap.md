# Pokédex App – Roadmap / Schlachtplan

Reihenfolge nach technischer Abhängigkeit: jede Phase baut auf einer lauffähigen Vorstufe auf, nicht nach Feature-Wichtigkeit (auch wenn z.B. `TypeEffectiveness` laut Konzept das zentrale Feature ist, braucht es zuerst eine funktionierende Detailseiten-Route + Datenlayer).

---

## Phase 0 – Projekt-Setup & Tooling

- Tailwind CSS v4 installieren, `@theme`-Konfiguration für Design-Tokens (Farben, Spacing, Breakpoints) anlegen, bestehende `app.scss`/Component-SCSS-Dateien ablösen
- Swiper.js installieren (für `EvolutionChain`, später ggf. Sprite-Galerie/Move-Cards)
- Ordnerstruktur anlegen: `core/services/`, `core/models/`, `shared/components/`, `features/...` (Overview, Pokemon-Detail, Move-Detail)
- Environment-Konfiguration für die PokeAPI-Basis-URL (`environment.ts`)
- TypeScript-Interfaces/Models für Pokémon, Species, Move, Evolution-Chain (Grundlage für alles Weitere)

## Phase 1 – Core-Services (Datenlayer-Fundament)

Kein UI, nur Services — da jede spätere Seite darauf aufbaut:

- `PokemonCacheService` (In-Memory-Signal-Cache, `get`/`set`/`has`)
- `PokemonApiService` (`/pokemon/{id|name}`, `/pokemon-species/{id}`, `/evolution-chain/{id}` via `HttpClient` + `resource()`/`rxResource()`, prüft immer zuerst den Cache)
- `MoveApiService` (`/move/{id|name}`, gleiche Cache-Strategie)
- `SearchIndexService` kommt bewusst erst in Phase 4, da er von `PokemonApiService`/Cache abhängt und zuerst an der Übersichtsseite validiert werden sollte, wie das Grund-Fetching überhaupt funktioniert

## Phase 2 – Routing-Grundgerüst + globales Layout

- Routen für Übersichtsseite, Pokémon-Detailseite (`/pokemon/:id`), Attacken-Detailseite (`/move/:id`) in `app.routes.ts`
- `AppHeader` als persistentes Layout-Element
- `GlobalSearchBar` zunächst nur als leere Hülle (Logik folgt in Phase 4) — Ziel: Navigationsgerüst steht, jede Seite ist erreichbar

## Phase 3 – Übersichtsseite (erste vertikale Slice)

Erste Seite, die echte Daten zeigt — validiert Phase 1 End-to-End:

- `PokemonGrid` + `PokemonCard` (Grunddarstellung, Sprites)
- `LoadMoreTrigger` (IntersectionObserver, `limit`/`offset`-Pagination, Anhängen ans Signal-Array)
- `GenerationSelector`
- `SearchFilterBar` (Name EN/DE, Typ, Generation — seiteninterner Filter)

## Phase 4 – Globale Suche

Braucht eine funktionierende Übersichtsseite als Sprungziel:

- `SearchIndexService` (einmaliger Bulk-Load aller `id`/`name_en`/`name_de`, `computed()`-Filter)
- `GlobalSearchBar` fertigstellen: Live-Dropdown, Navigation zur Detailseite bei Treffer

## Phase 5 – Pokémon-Detailseite

Der größte Block, intern nach Abhängigkeit sortiert:

1. `PokemonHeader` (Sprite, Name, Typen) — Basis, die die Route überhaupt sinnvoll macht
2. `BaseStats` (Balken + Zahlen)
3. `AbilitiesList` (Accordion)
4. `TypeEffectiveness` (zentrales Feature laut Konzept — braucht Typ-Matchup-Logik/-Daten)
5. `EvolutionChain` (Swiper, `@defer` beim Scrollen in den Viewport)
6. `MovesetTable` (Lernmethode-Filter, Level-Filter) + `MoveTooltip` (on-hover Nachladen via `MoveApiService`)

## Phase 6 – Attacken-Detailseite

- `MoveDetailAccordion` (FAQ-Stil, Power/Genauigkeit/PP/Effekt) — kann jetzt auf fertigen `MoveApiService` + Navigation aus `MovesetTable`/`MoveTooltip` aufsetzen

## Phase 7 – Styling-/Responsive-Politur

- Tailwind-`@theme`-Tokens konsequent durchziehen, Responsiveness aller Seiten prüfen
- Loading-/Error-/Empty-States für alle `resource()`-Aufrufe (bisher nicht explizit spezifiziert — an dieser Stelle nachziehen)

## Phase 8 – Tests

- Unit-Tests für Services (Cache-Logik, `SearchIndexService`-Filter, Moveset-Filter-`computed()`s) — die Stellen mit echter Logik, nicht die reinen Präsentations-Components
