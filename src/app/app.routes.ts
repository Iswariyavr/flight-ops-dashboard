import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'ops' },
  {
    path: 'ops',
    title: 'Flightdeck · Live traffic',
    loadComponent: () =>
      import('./features/operations/operations-page/operations-page').then((m) => m.OperationsPage),
    children: [
      { path: '', children: [] }, // /ops               → nothing selected
      { path: 'flight/:id', children: [] }, // /ops/flight/ai-889 → selected flight
    ],
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFound),
  },
];
