import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { UsuarioService } from '../services/usuario.service';


@Injectable()
export class RedirectIfLoggedInGuard implements CanActivate {

  constructor(
    public usuariopService: UsuarioService,
    private router: Router,) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log(route+'session-->'+this.usuariopService.checkLogin())
    if (this.usuariopService.checkLogin()) {
      this.router.navigate(['/principal']);
      return false;
    } else {
      return true;
    }

  }
  

}