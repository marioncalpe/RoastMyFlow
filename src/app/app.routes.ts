import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { Loading } from './pages/loading/loading';
import { Error } from './pages/error/error';
import { Callback } from './pages/callback/callback';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'callback', component: Callback },
  { path: 'dashboard', component: Dashboard },
  { path: 'loading', component: Loading },
  { path: 'error', component: Error },
  { path: '**', redirectTo: 'error' }
];
