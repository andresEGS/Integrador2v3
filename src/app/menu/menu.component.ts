import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Menu } from 'app/models/menu';
import { MenuService } from 'app/services/menu.service';
import { Messages } from 'app/utilidades/Messages';
import {FormControl} from '@angular/forms';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from 'app/services/usuario.service';
import { Rol } from 'app/models/rol';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  public menu = {} as Menu;
  public menuSub = {} as Menu;
  public menuSelect = {} as Menu;
  public listaMenu = [] as any;
  public listaSubMenu = [] as any;
  private modo = 'REG';
  private registrar = false;
  private session=false;
  public rol = {} as Rol;
  public frame: ElementRef;
  toppings = new FormControl();

  toppingList: string[] = ['padre', 'menu'];
  @ViewChild('frame', { static: true }) basicModal: MenuComponent;
  constructor(private msg: Messages,  public _menuServicie: MenuService , public _usuarioService:UsuarioService) { }

  ngOnInit() {
    this.limpiar();
    this.listarMenu();
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.rol = this._usuarioService.getRolSesion();
    }
  }

  listarMenu() {
    this._menuServicie.listar().subscribe(listaMenu => {
      this.listaMenu = listaMenu;
      // this.listaMenu = this.rol.menu;
      if (listaMenu.length == 0) {
        this.msg.msgWarning('no se encontraron Menu resultados');
      }

    })
  }



  async limpiar() {
    this.menu = {} as Menu;
    this.listaMenu = [];
    this.listaSubMenu = [];
    this.menuSub={} as Menu;
    this.modo = 'REG';
    this.listarMenu();
    this.toppings.setValue("menu");
  }


  onOpened(event: any) {
    this.frame = event;
  }
  prepararSubmenu(){
    this.menuSub={} as Menu;
  }
  agregarSubMenu(){
    this.menu.menu.push(this.menuSub);
  }

  eliminarSubMenu(menu: Menu) {
    console.log(menu);
    var pos_esp = this.menu.menu.indexOf(menu);
    // this.especialidadesSelect.splice(pos, 1);
    this.menu.menu.splice(pos_esp,1);
  
  }

  validarRol(): boolean {
    let valido = true;
    if (this.menu.title === '' || this.menu.title === null || this.menu.title === undefined) {
      this.msg.msgDanger('INGRESE NOMBRE DEL TITULO');
      valido = false;
      $('#title').focus();
      return valido;
    }
    if(this.toppings.status == 'INAVLID'){
      this.msg.msgDanger('INGRESE TIPO MENU DEL PATH');
      valido = false;
      return valido;
    }else{
      this.menu.tipo=this.toppings.value;
    }
    if ((this.menu.path === '' || this.menu.path === null || this.menu.path === undefined)&&this.menu.tipo !='padre') {
      this.msg.msgDanger('INGRESE NOMBRE DEL PATH');
      valido = false;
      $('#path').focus();
      return valido;
    }
    if (this.menu.icon === '' || this.menu.icon === null || this.menu.icon === undefined) {
      this.msg.msgDanger('INGRESE NOMBRE DEL PATH');
      valido = false;
      $('#icon').focus();
      return valido;
    }
   
    return valido;
  }

  mostrarMenu(menuSelect: Menu) {
    console.log(menuSelect);
    this.menu = menuSelect;
    this.registrar = true;
    this.modo = 'EDIT';
    this.toppings.setValue(this.menu.tipo);
  }

  selectedMenu(menuSelect: Menu) {
    this.menuSelect = menuSelect;
  }

 
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    $('#nombre').focus();
    this.limpiar();
  }

  eliminar() {
    this._menuServicie.eliminar(this.menu);
    this.msg.msgInfo('SE ELIMINO EL MENU CORRECTAMENTE');
    this.limpiar();

  }
  async submit() {


    console.log(this.menu);
    let valido = await this.validarRol();
    if (valido) {
      if (this.modo == 'REG') {
        console.log(this.menu);
         this._menuServicie.registrar(this.menu);
        this.msg.msgSuccess('Guardado Exitoso!')
      } else {
        this._menuServicie.actualizar(this.menu);
        this.msg.msgSuccess("Menu se modifico Exitosamente!");
      }
      // this.limpiar();
    }
  }
}
