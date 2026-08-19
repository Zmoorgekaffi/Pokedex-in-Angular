import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/overview/overview-page/overview-page').then((m) => m.OverviewPage)
  },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./features/pokemon-detail/pokemon-detail-page/pokemon-detail-page').then(
        (m) => m.PokemonDetailPage
      )
  },
  {
    path: 'move/:id',
    loadComponent: () =>
      import('./features/move-detail/move-detail-page/move-detail-page').then(
        (m) => m.MoveDetailPage
      )
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about-page/about-page').then((m) => m.AboutPage)
  }
];
