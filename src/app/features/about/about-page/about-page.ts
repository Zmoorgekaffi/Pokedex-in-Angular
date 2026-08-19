import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';
import { pick } from '../../../core/utils/i18n.util';
import { ComponentTitle } from '../../../shared/components/component-title/component-title';

interface Topic {
  title: string;
  description: string;
}

/** One entry per thing this project is deliberately built to demonstrate, in both languages. */
const TOPICS: { en: Topic; de: Topic }[] = [
  {
    en: {
      title: 'Modern Angular (standalone, signals, zoneless)',
      description:
        'Standalone components everywhere, no NgModules. State lives in signal()/computed()/effect() instead of NgRx or an RxJS store, and the app runs zoneless — change detection is driven entirely by signals.'
    },
    de: {
      title: 'Modernes Angular (Standalone, Signals, Zoneless)',
      description:
        'Überall Standalone-Komponenten, keine NgModules. State lebt in signal()/computed()/effect() statt in NgRx oder einem RxJS-Store, und die App läuft zoneless – Change Detection wird komplett über Signals gesteuert.'
    }
  },
  {
    en: {
      title: 'Claude Code as a coding agent',
      description:
        'The architecture, every feature, and this very page were built together with Claude Code, an AI coding agent working directly inside this repository — planning changes, writing code, and verifying them against the real API.'
    },
    de: {
      title: 'Claude Code als Coding-Agent',
      description:
        'Die Architektur, jedes Feature und auch diese Seite selbst wurden gemeinsam mit Claude Code entwickelt – einem KI-Coding-Agenten, der direkt in diesem Repository plant, Code schreibt und ihn gegen die echte API verifiziert.'
    }
  },
  {
    en: {
      title: 'Working with a real REST API',
      description:
        'Every screen runs on the public PokéAPI — pagination, filtering, in-memory caching, and stitching several endpoints together (Pokémon, species, evolution chain, moves, encounter locations) into one coherent page.'
    },
    de: {
      title: 'Arbeiten mit einer echten REST-API',
      description:
        'Jede Ansicht läuft über die öffentliche PokéAPI – Pagination, Filterung, In-Memory-Caching und das Zusammenführen mehrerer Endpunkte (Pokémon, Spezies, Entwicklungskette, Attacken, Fundorte) zu einer stimmigen Seite.'
    }
  },
  {
    en: {
      title: 'Lazy loading',
      description:
        'Every route is lazy-loaded via loadComponent, and below-the-fold sections on the detail page (evolution chain, moveset, locations) only fetch their data and code once they actually scroll into view, via @defer.'
    },
    de: {
      title: 'Lazy Loading',
      description:
        'Jede Route wird per loadComponent lazy geladen, und Bereiche unterhalb des sichtbaren Viewports auf der Detailseite (Entwicklungskette, Attacken, Fundorte) laden ihre Daten und ihren Code erst per @defer, sobald sie wirklich ins Bild scrollen.'
    }
  },
  {
    en: {
      title: 'Signals end to end',
      description:
        'No manual subscriptions anywhere in the app — data flows from HTTP calls through rxResource(), into signal()/computed(), straight into the template.'
    },
    de: {
      title: 'Signals von Anfang bis Ende',
      description:
        'Nirgends manuelle Subscriptions in der App – Daten fließen von HTTP-Aufrufen über rxResource() in signal()/computed() bis direkt ins Template.'
    }
  },
  {
    en: {
      title: 'Swiper.js',
      description:
        'The evolution chain is a real Swiper Element carousel (the web-component/framework-integration variant, not the plain JS class API), kept two-way in sync with the current route.'
    },
    de: {
      title: 'Swiper.js',
      description:
        'Die Entwicklungskette ist ein echtes Swiper-Element-Karussell (die Web-Component-/Framework-Integrationsvariante, nicht die einfache JS-Class-API), zweiseitig mit der aktuellen Route synchronisiert.'
    }
  },
  {
    en: {
      title: 'Component-based programming',
      description:
        'Small, focused, OnPush components. Presentational pieces stay dumb and reusable; only container/page components reach into services — the same discipline throughout the whole app.'
    },
    de: {
      title: 'Komponentenbasiertes Programmieren',
      description:
        'Kleine, fokussierte OnPush-Komponenten. Präsentationale Bausteine bleiben „dumm“ und wiederverwendbar; nur Container-/Seiten-Komponenten greifen auf Services zu – diese Disziplin zieht sich durch die ganze App.'
    }
  }
];

@Component({
  selector: 'app-about-page',
  imports: [ComponentTitle],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutPage {
  private readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;

  readonly title = computed(() => pick(this.language(), 'What this project demonstrates', 'Was dieses Projekt zeigt'));
  readonly intro = computed(() =>
    pick(
      this.language(),
      'This Pokédex is a learning/portfolio project. Beyond just browsing Pokémon, it exists to show these things in practice:',
      'Dieser Pokédex ist ein Lern-/Portfolio-Projekt. Über das reine Durchstöbern von Pokémon hinaus soll er Folgendes praktisch zeigen:'
    )
  );

  readonly topics = computed<Topic[]>(() => TOPICS.map((topic) => (this.language() === 'de' ? topic.de : topic.en)));
}
