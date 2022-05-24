import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { UsuarioService } from 'app/services/usuario.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    public usuariopService: UsuarioService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    //console.log(url+' session-->'+this.usuariopService.checkLogin())
    // console.log(url+'logiin-->'+this.checkLogin(url))
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.usuariopService.checkLogin()) {
      return true;
    }

    // Store the attempted URL for redirecting
    this.usuariopService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}