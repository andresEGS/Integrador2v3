import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { RedirectIfLoggedInGuard } from './utilidades/RedirectIfLoggedInGuard';
import { AuthGuard } from './utilidades/AuthGuard';
import { Page404Component } from './page404/page404.component';
import { PrincipalComponent } from './principal/principal.component';



const routes: Routes =[
  
  { path: '', redirectTo:'/login',pathMatch: 'full'},
  { path: 'login', component: LoginComponent,canActivate: [RedirectIfLoggedInGuard]},
  {
    path: 'principal', redirectTo:'principal', pathMatch: 'full'
   },
   {
    path: '',
    component: AdminLayoutComponent,
    children: [{
      path: '',
      loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
    }]
  },
  { path: '**', component: Page404Component }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
