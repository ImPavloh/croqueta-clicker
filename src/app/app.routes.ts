import { Routes } from '@angular/router';

import { Upgrades } from './pages/upgrades/upgrades';
import { Stats } from './pages/stats/stats';
import { Options } from './pages/options/options';
import { Skins } from './pages/skins/skins';

export const routes: Routes = [
    { path: '', component: Upgrades},
    { path: 'upgrades', component: Upgrades},
    { path: 'stats', component: Stats },
    { path: 'options', component: Options },
    { path: 'skins', component: Skins },
    { path: '**', redirectTo: '' }
];
