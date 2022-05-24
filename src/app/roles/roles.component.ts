import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Menu } from 'app/models/menu';
import { Rol } from 'app/models/rol';
import { RolService } from 'app/services/rol.service';
import { MenuService } from 'app/services/menu.service';
import { Messages } from 'app/utilidades/Messages';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  public rol = {} as Rol;
  public rolSelect = {} as Rol;
  public menuSelect = {} as Menu;
  public listaMenuSelect = [] as any;
  public listaMenu = [] as any;
  public listaMenuDisponibles = [] as any;
  public seleccionartodos = false;
  public roles = [];
  private modo = 'REG';
  private registrar = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: RolesComponent;
  constructor(private msg: Messages, public _rolService: RolService, public _menuServicie: MenuService) { }

  ngOnInit() {
    this.limpiar();
    this.listarRoles();
  }

  listarRoles() {
    this._rolService.listar().subscribe(listaRoles => {
      this.roles = listaRoles;
      if (listaRoles.length == 0) {
        this.msg.msgWarning('no se encontraron Roles resultados');
      }

    })
  }



  async limpiar() {
    this.rol = {} as Rol;
    this.rolSelect = {} as Rol;
    this.listaMenuSelect = [];
    this.listaMenuDisponibles = [];
    this.modo = 'REG';
    this.listarMenu();



  }
  async listarMenu() {
    this.listaMenu = [];
    let Menuaweit: Menu[] = await new Promise(resolve => {
      this._menuServicie.listar().subscribe(menus => {
        resolve(menus);
      },
        error => {
          return error
        });
    });
    Menuaweit.forEach(menu => {
      if (menu.menu === undefined) {
        let menuselect = {
          class: menu.class,
          title: menu.title,
          icon: menu.icon,
          id: menu.id,
          path:menu.path,
          tipo: menu.tipo,
          check: false
        }
        this.listaMenu.push(menuselect);
      } else {
        let menuselect = {
          title: menu.title,
          class: menu.class,
          icon: menu.icon,
          id: menu.id,         
          tipo: menu.tipo,
          check: false,
          menu: menu.menu
        }
        this.listaMenu.push(menuselect);
      }

    });
  }

  onOpened(event: any) {
    this.frame = event;
  }


  validarRol(): boolean {
    let valido = true;
    if (this.rol.nombre === '' || this.rol.nombre === null || this.rol.nombre === undefined) {
      this.msg.msgDanger('INGRESE NOMBRE DEL ROL');
      valido = false;
      $('#nombre').focus();
      return valido;
    }
    if (this.rol.menu === undefined || this.rol.menu.length <= 0) {
      this.msg.msgDanger('INGRESE ALMENOS UN MENU A ESTE ROL');
      valido = false;
      return valido;
    }
    return valido;
  }

  mostrarRol(rolSelect: Rol) {
    this.rol = rolSelect;
    this.registrar = true;
    this.modo = 'EDIT';
    this.selecionarMenu(rolSelect.menu);
  }
  selecionarMenu(menus: any[]) {
    this.listaMenu.forEach(async menu => {
      menus.forEach(async menuRol => {
        if (menuRol.id === menu.id)
          menu.check = true;
      });

    });
  }
  selecionarTodosMenu() {
    if (this.seleccionartodos)
      this.seleccionartodos = false
    else
      this.seleccionartodos = true

    this.listaMenu.forEach(async menu => {
      menu.check = this.seleccionartodos;
    });
  }


  selectedRol(rolSelect: Rol) {
    this.rol = rolSelect;
  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    $('#nombre').focus();
    this.limpiar();
  }

  eliminar() {
    this._rolService.eliminar(this.rol);
    this.msg.msgInfo('SE ELIMINO EL ROL CORRECTAMENTE');
    this.limpiar();

  }
  async submit() {

    this.listaMenu.forEach(async menu => {
      if (menu.check) {
        this.listaMenuSelect.push(menu);
      }
    });
    this.rol.menu = this.listaMenuSelect;

    console.log(this.rol);
    let valido = await this.validarRol();
    if (valido) {

      if (this.modo == 'REG') {
        console.log(this.rol);
        this._rolService.registrar(this.rol);
        this.msg.msgSuccess('Guardado Exitoso!')
      } else {
        this._rolService.actualizar(this.rol);
        this.msg.msgSuccess("Rol se modifico Exitosamente!");
      }
      // this.limpiar();
    }
  }
}
