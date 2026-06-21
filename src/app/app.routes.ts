import { Routes } from '@angular/router';

import { Upgrades } from './pages/upgrades/upgrades';
import { Achievements } from './pages/achievements/achievements';
import { Options } from './pages/options/options';
import { Skins } from './pages/skins/skins';

export const routes: Routes = [
  { path: '', component: Upgrades },
  { path: 'upgrades', component: Upgrades },
  { path: 'achievements', component: Achievements },
  {
    path: 'contracts',
    loadComponent: () => import('./pages/contracts/contracts').then((module) => module.Contracts),
  },
  { path: 'options', component: Options },
  { path: 'skins', component: Skins },
  {
    path: 'report',
    loadComponent: () => import('./pages/report/report').then((module) => module.Report),
    data: { preload: false },
  },
  { path: '**', redirectTo: '' },
];
