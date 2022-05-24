import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { RedirectIfLoggedInGuard } from './utilidades/RedirectIfLoggedInGuard';


const routes: Routes = [
  { path: '', redirectTo:'/login',pathMatch: 'full'},
  { path: 'login', component: LoginComponent,canActivate: [RedirectIfLoggedInGuard]},
  {
    path: '',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
    }]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
