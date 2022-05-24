import { Component, OnInit } from '@angular/core';
import { Especialidad } from 'app/models/especialidad';
import { Instructor } from 'app/models/instructor';
import { Rol } from 'app/models/rol';
import { Usuario } from 'app/models/usuario';
import { EspecialidadService } from 'app/services/especialidad.service';
import { InstructorService } from 'app/services/instructor.service';
import { NotificacionService } from 'app/services/notificacion.service';
import { RolService } from 'app/services/rol.service';
import { UsuarioService } from 'app/services/usuario.service';
import { Messages } from 'app/utilidades/Messages';

declare const $: any;
declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
}
export const ROUTES: RouteInfo[] = [
  // { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
  //{ path: '/principal', title: 'Princial', icon: 'dashboard', class: '' },
  //{ path: '/piezas', title: 'Piezas', icon: 'straighten', class: '' },
  //{ path: '/pedidos', title: 'Pedidos', icon: 'content_paste', class: '' },
  // { path: '/notifications', title: 'Usuarios',  icon:'person', class: '' },
  // { path: '/icons', title: 'Graficas',  icon:'pie_chart', class: '' }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];
  public usuario = [] as Usuario;
  public rol = [] as Rol;
  public rolselect = {} as Rol;
  public roles = [];
  session = false;
  public cant_notificaciones=0;
  public notificaciones = [];
  constructor(public _usuarioService: UsuarioService,
    public _instructorService: InstructorService,
    public _especialidadService: EspecialidadService,
    private msg: Messages,
    public _notificacionService: NotificacionService ) { }

  ngOnInit() {
    // this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
      this.rol = this._usuarioService.getRolSesion();
      this.cargarRoles();
      this.menuItems =this.rol.menu;
    }
    console.log(JSON.stringify(this.menuItems));
  }

  async cargarRoles(){
    let roles_all =[];
    this.usuario.roles.forEach(async rol => {
        if(rol.id!=this.rol.id){
           await roles_all.push(rol);
        }
    });
    console.log(this.rol.nombre);
    
    this.roles=roles_all;
  }





  changeRol(rol:Rol){
    this._usuarioService.setRolChange(rol);
    // this.rolselect=rol;
  }

  changeRolSession(){
    this._usuarioService.setRolSession(this.rolselect);  
    window.location.reload(); 
}

  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };

 

}
