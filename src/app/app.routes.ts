import { Routes } from '@angular/router';

import { Upgrades } from './pages/upgrades/upgrades';
import { Achievements } from './pages/achievements/achievements';
import { Options } from './pages/options/options';
import { Skins } from './pages/skins/skins';

export const routes: Routes = [
  { path: '', component: Upgrades },
  { path: 'upgrades', component: Upgrades },
  { path: 'achievements', component: Achievements },
  { path: 'options', component: Options },
  { path: 'skins', component: Skins },
  { path: '**', redirectTo: '' },
];
