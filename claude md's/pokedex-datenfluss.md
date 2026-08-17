# Pokédex App – Datenfluss

Basiert auf Angular 20+ (Standalone Components, Signals). Kein NgRx, kein manuelles RxJS-Subscribe-Management — State lebt in Services als Signals, Components konsumieren sie read-only.

---

## Grober Ablauf

```
Component
   │  ruft Service-Methode auf
   ▼
Service (z.B. PokemonApiService)
   │  prüft Cache
   ├─ Cache-Hit  → gibt gecachtes Signal zurück
   └─ Cache-Miss → HTTP-Request an PokeAPI
                      │
                      ▼
                 Cache wird befüllt
                      │
                      ▼
              Signal wird aktualisiert
   ▼
Component liest Signal (direkt im Template oder via computed())
```

---

## Services

### `PokemonApiService` (`core/services/pokemon-api.service.ts`)
- Einziger Zugriffspunkt auf die PokeAPI-Endpunkte:
  - `/pokemon/{id|name}`
  - `/pokemon-species/{id}`
  - `/evolution-chain/{id}`
  - `/move/{id|name}`
- Nutzt Angular's `HttpClient`
- Rückgabewerte werden über Angular's `resource()` (bzw. `rxResource()`) API als Signal bereitgestellt — kein manuelles `.subscribe()` in Components
- Jede Methode prüft zuerst den `PokemonCacheService`, bevor ein Request rausgeht

### `PokemonCacheService` (`core/services/pokemon-cache.service.ts`)
- Hält einen In-Memory-Cache als `signal(new Map<string, Pokemon>())`
- Key = Name oder ID (normalisiert, lowercase)
- Methoden: `get(key)`, `set(key, value)`, `has(key)`
- Grund: PokeAPI Fair-Use-Policy empfiehlt explizit, Responses zu cachen statt wiederholt abzufragen
- Cache ist Session-basiert (kein `localStorage`) — bei Bedarf später erweiterbar

### `SearchIndexService` (`core/services/search-index.service.ts`)
- Zuständig für die globale Suche (EN-Name, DE-Name, ID)
- Lädt einmalig beim App-Start eine **leichte Liste** aller Pokémon (nur `id`, `name_en`, `name_de`) — nicht die vollen Detaildaten
  - Namen kommen aus `/pokemon-species/{id}` → Feld `names`, gefiltert nach `language.name === 'de'` / `'en'`
  - Da dies potenziell viele Requests sind (ein Call pro Species), wird das Ergebnis direkt im `PokemonCacheService` abgelegt und für die App-Laufzeit als `signal()` gehalten (einmalig aufgebaut, nicht bei jedem Seitenaufruf neu)
- Stellt ein `computed()` bereit, das basierend auf dem aktuellen Such-Input (Signal) die passenden Treffer aus dem Index filtert (Name EN, Name DE oder numerische ID)
- `GlobalSearchBar` bindet direkt an dieses `computed()` für die Live-Vorschlagsliste

### `MoveApiService` (`core/services/move-api.service.ts`)
- Separater Service für Attacken-Details (`/move/{id|name}`)
- Gleiche Cache-Strategie wie `PokemonApiService`
- Wird von `MovesetTable` (Tooltip-Kurzinfo) und `MoveDetailAccordion` (volle Details) genutzt
- Tooltip lädt nur bei Bedarf (on hover) nach, nicht vorab für alle Attacken im Moveset

---

## Caching-Logik

- **Ebene 1 – In-Memory-Signal-Cache** (`PokemonCacheService`): einmal geladene Pokémon/Species/Moves bleiben für die Dauer der Session im Speicher
- **Ebene 2 – Such-Index** (`SearchIndexService`): einmaliger Bulk-Load aller Namen (EN/DE + ID) beim ersten Öffnen der `GlobalSearchBar`, danach nur noch lokales Filtern ohne weitere Requests
- Kein Re-Fetch, solange ein Eintrag im Cache existiert — Navigation zwischen bereits besuchten Pokémon triggert keinen neuen HTTP-Call

---

## Lazy-Loading-Logik

### Übersichtsseite (`PokemonGrid`)
- Initial wird nur die erste Seite geladen (`limit`/`offset`-Query-Parameter der PokeAPI, z.B. 20 Stück)
- `LoadMoreTrigger` nutzt einen `IntersectionObserver`: sobald das Element sichtbar wird, ruft es `pokemonApiService.loadNextPage()` auf
- Neue Ergebnisse werden an das bestehende Signal-Array angehängt (`update()`), nicht ersetzt

### Detailseite
- Nur die für die aktuelle Ansicht nötigen Daten werden geladen:
  - Beim Öffnen der Detailseite: `/pokemon/{id}` + `/pokemon-species/{id}` (für Basisdaten, Stats, Typen, Fähigkeiten)
  - `EvolutionChain`-Daten erst laden, wenn diese Section tatsächlich gerendert wird (z.B. via `@defer` in Angular)
  - Moveset-Details (einzelne Attacken) werden erst bei Hover (Tooltip) bzw. Klick (Detailseite) nachgeladen — nicht beim initialen Laden der Pokémon-Detailseite
- `@defer`-Blocks (Angular 20+) für Sections, die erst beim Scrollen in den Viewport sichtbar werden (z.B. `MovesetTable`, `EvolutionChain`)

---

## State-Prinzipien

- Kein globaler Store — Services mit Signals sind die "Single Source of Truth" pro Datentyp
- `computed()` für abgeleitete Werte (z.B. gefiltertes Moveset nach Methode + Level, Suchtreffer im `SearchIndexService`)
- `effect()` ausschließlich für Side-Effects (z.B. URL-Sync bei Filteränderung), nicht zur State-Berechnung
- Components erhalten Daten über `input()` (Signal-Inputs) und geben Events über `output()` weiter — kein direkter Service-Zugriff aus tief verschachtelten Präsentations-Components, sondern über die jeweilige Container-Component/Seite
