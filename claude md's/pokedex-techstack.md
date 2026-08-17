# Techstack – Pokédex App

- **Framework:** Angular 20+ — ausschließlich Standalone Components (keine NgModules), State-Management via Signals (kein RxJS-Store, kein NgRx)
- **Styling:** Tailwind CSS mit `@theme` (Tailwind v4 Theme-Konfiguration) für Design-Tokens und Responsiveness — keine separaten SCSS-Dateien, Utility-First-Ansatz
- **Slider/Carousel:** Swiper.js für horizontale Scroll-/Carousel-Elemente (z.B. Sprite-Galerie, Evolution-Stammbaum, Attacken-Karten)

## Konventionen

- Komponenten: `standalone: true`, `ChangeDetectionStrategy.OnPush`
- State: `signal()`, `computed()`, `effect()` statt Services mit BehaviorSubjects
- Inputs/Outputs: `input()` / `output()` Signal-APIs statt Decorators, wo möglich
- Styling: Tailwind-Klassen direkt im Template, `@theme`-Variablen für Breakpoints/Farben/Spacing statt `tailwind.config.js`
