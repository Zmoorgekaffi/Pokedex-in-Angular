# Pokédex App – Component-Liste

## Seiten

- **Such-/Übersichtsseite** – Liste aller Pokémon
- **Pokémon-Detailseite** – Alle Infos zu einem Pokémon
- **Attacken-Detailseite** – Detailinfos zu einer einzelnen Attacke

---

## Globales Layout

### `AppHeader`
- Persistente Kopfzeile, auf allen Seiten sichtbar
- Enthält die globale Suchleiste (siehe `GlobalSearchBar`)

### `GlobalSearchBar`
- Sucht Pokémon direkt aus dem Header, ohne auf der Übersichtsseite sein zu müssen
- Suche funktioniert nach:
  - **Englischem Namen**
  - **Deutschem Namen**
  - **Pokédex-ID** (numerisch)
- Bei Treffer: Navigation direkt zur `Pokémon-Detailseite`
- Live-Vorschlagsliste (Dropdown) während des Tippens, gespeist aus dem lokalen Such-Index (siehe `pokedex-datenfluss.md` → `SearchIndexService`)

---

## Übersichtsseite

### `PokemonGrid`
- Grid mit Sprites (kachelbasiert)

### `PokemonCard`
- Einzelne Kachel im Grid

### `SearchFilterBar`
- Seiteninterne Filterleiste (zusätzlich zur globalen `GlobalSearchBar`)
- Suche oben, Filter klappbar darunter
- Filter: Name (EN/DE), Typ, Generation/Spiel

### `GenerationSelector`
- Auswahl der Generation/des Spiels, dessen Pokémon angezeigt werden
- Eigenständige Component (wird in `SearchFilterBar` eingebettet)

### `LoadMoreTrigger`
- Lazy-Loading-Element am Ende des Grids (Infinite Scroll oder "Mehr laden"-Button)
- Lädt die nächste Seite an Pokémon nach, sobald sichtbar (Intersection Observer)

---

## Pokémon-Detailseite

### `PokemonHeader`
- Klassisches Layout: großes Sprite + Name/Typen daneben

### `TypeEffectiveness`
- Gruppiert in 3 Spalten: **Schwach / Resistent / Immun**

### `BaseStats`
- Vertikale Balken (wie Diagramm-Säulen) + Zahlen kombiniert
- Ein Balken pro Stat (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)

### `AbilitiesList`
- Liste untereinander
- Effekt-Beschreibung erscheint beim Aufklappen (Accordion-Verhalten)

### `EvolutionChain`
- Swiper-Slider durch die Entwicklungsstufen

### `MovesetTable`
- Filterzeile oben:
  - Dropdown-Filter zum Sortieren nach Lernmethode (Standard, TM/VM, Ei, ggf. weitere)
  - Zusätzlich Input `type="number"` für Level-Filter
    - Leer = inaktiv, filtert nicht nach Level (verhält sich, als gäbe es den Filter nicht)
    - Bei Klick/Aktivierung: Minimalwert = 1
- Darunter: Liste der Attacken
  - Pro Zeile: Attacke links, Anforderung (Level/Methode) rechts, `justify-between` im selben Div
- Attacken werden live nach aktivem Methoden-Filter + Level gefiltert

### `MoveTooltip`
- Kleines Tooltip-Fenster direkt am Mauszeiger beim Hover über eine Attacke
- Zeigt nur das Nötigste (Kurzinfo)
- Klick auf Attacke → navigiert zur Attacken-Detailseite

---

## Attacken-Detailseite

### `MoveDetailAccordion`
- Aufbau wie ein FAQ
- Jede Attacke ist ein aufklappbares Div (Accordion-Item)
- Beim Ausklappen: Details der Attacke (Power, Genauigkeit, PP, Effekt etc.)
- Keine Sprites nötig für Attacken

---

## Ergänzungen gegenüber Konzept/Techstack

Diese Components wurden neu ergänzt, weil sie im Konzept implizit gefordert waren, aber in der ersten Version der Liste fehlten:

- `AppHeader` + `GlobalSearchBar` — Konzept fordert Suche nach Name/Typ/Generation, aber keine Angabe, ob nur seiteninternes Filtern oder App-weite Suche gemeint war → jetzt beides: seiteninterner Filter (`SearchFilterBar`) UND globale Suche (`GlobalSearchBar`) mit EN/DE-Namen sowie ID
- `GenerationSelector` — im Konzept explizit als eigenes Auswahlkriterium genannt ("Generation/Spiel auswählbar"), bisher nur als Teil der Filterleiste ohne eigene Component
- `LoadMoreTrigger` — notwendig für die im Datenfluss beschriebene Lazy-Load-Logik der Übersichtsliste
