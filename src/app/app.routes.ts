// app.routes.ts

import { Routes, RouterModule } from '@angular/router';

import { MainContentComponent } from './main-content/main-content.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  {path: '', redirectTo: 'my', pathMatch : 'full'},
  {path: 'my', component: MainContentComponent, data: {musicType: 'hot'}},
  {path: 'playlist/:id', component: MainContentComponent},
  {path: 'explore/:search', component: MainContentComponent},
  {path: '**', redirectTo: 'my', pathMatch : 'full'}
];

export const routing = RouterModule.forRoot(routes);