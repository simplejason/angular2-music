// app.routes.ts

import { Routes, RouterModule } from '@angular/router';

import { MainContentComponent } from './main-content/main-content.component';
import { ExploreContentComponent } from './explore-content/explore-content.component';

const routes: Routes = [
  {path: '', redirectTo: 'explore', pathMatch : 'full'},
  {path: 'explore', component: MainContentComponent},
  {path: 'playlist/:id', component: MainContentComponent},
  {path: 'explore/:search', component: MainContentComponent},
  {path: '**', redirectTo: 'my', pathMatch : 'full'}
];

export const routing = RouterModule.forRoot(routes);