import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Menu } from 'app/models/menu';
import { Rol } from 'app/models/rol';
import { Usuario } from 'app/models/usuario';
import { RolService } from 'app/services/rol.service';
import { MenuService } from 'app/services/menu.service';
import { UsuarioService } from 'app/services/usuario.service';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-usuarops',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  public findParam = 'NOMBRE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 4;
  public nextpage = "";
  public anterior = [];
  public identificacion: number;
  public email;
  public login;
  public usuario = {} as Usuario;
  public usuarioSelect = {} as Usuario;
  public listaRolesSelect = [] as any;
  public listaRoles = [] as any;
  public seleccionartodos = false;
  public usuarios: any[]
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  public rol = [] as Rol;
  @ViewChild('frame', { static: true }) basicModal: UsuariosComponent;
  constructor(private _spinnerService: NgxSpinnerService, private util: TextTilUtil, private msg: Messages, public _usuarioService: UsuarioService, public _rolServicie: RolService) { }

  ngOnInit() {
    this.rol = this._usuarioService.getRolSesion();
    this.limpiar();
    this.listarFiltro("nombre", "");
  }

  async listarFiltro(tiposearch: string, valorfind: any) {
    let lista = this._usuarioService.listarFiltro(this.pagesize, this.nextpage, this.adelante, tiposearch, valorfind);
    (await lista).subscribe(listaUsuarios => {
      this.usuarios = listaUsuarios;
      if (listaUsuarios.length == 0) {
        this.resultado = true
        // this.msg.msgWarning('no se encontraron Usuarios resultados');
      } else {
        this.resultado = false
        this.siguiente = this.usuarios[listaUsuarios.length - 1].id;

      }
    })
  }
  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.usuarios[0].id;
      if (this.anterior.length === 0) {
        this.anterior.push(valorvector);
      } else {
        let encontro = false;
        this.anterior.forEach(async valor => {
          if (valor === valorvector) {
            encontro = true;
          }
        });
        if (!encontro) {
          this.anterior.push(valorvector);
        }
      }

    } else {

      this.pagina = this.pagina - 1;
      this.nextpage = this.anterior[this.pagina];

    }
    this.buscarFiltro(siguiente);


  }
  async buscarFiltro(pressKey: boolean) {

    // console.log("nombre :" + this.findValue, "ultimo :" + this.ultimoValor, "adelante :" + siguiente);
    // if (this.findParam != 'IDENTIFICACION' && pressKey) {
    console.log(this.findValue.length, pressKey);
    // if(this.findValue.length>=4 || !pressKey ){
    if (this.util.isStringVacio(this.findValue)) {
      this.findValue = "";
      this.listarFiltro("", "");
      this.paginador = true;
    } else {
      this.paginador = false;
      this.pagina = 0;
      this.anterior = [];
      this.nextpage = "";
      this.adelante = true;
      switch (this.findParam) {
        case 'NOMBRE':
          this.listarFiltro("nombre", this.findValue);
          break;
        case 'APELLIDO': // busca por identificacion
          this.listarFiltro("apellidos", this.findValue);
          break;
        case 'IDENTIFICACION': // busca por identificacion
          if (!pressKey) {
            var identififacion = Number(this.findValue);
            // this.listarFiltro("identificacion",identififacion);
            let usuIdentificacion: Usuario[] = await this._usuarioService.getUsuarioWhere("identificacion", identififacion);
            this.usuarios = usuIdentificacion;
            if (this.usuarios.length == 0) {
              this.resultado = true;
            } else {
              this.resultado = false;
              this.siguiente = this.usuarios[this.usuarios.length - 1].id;
            }
          }
          break;
        default:
          break;
      }
    }
    //  }

  }



  changeParam(estado: string) {
    this.findParam = estado;
  }

  async limpiar() {
    this.usuario = {} as Usuario;
    this.usuarioSelect = {} as Usuario;
    this.listaRolesSelect = [];
    this.identificacion = undefined;
    this.login = "";
    this.email = "";
    this.modo = 'REG';
    this.listarRoles();
  }

  async listarRoles() {
    this.listaRoles = [];
    let rolaweit: Rol[] = await new Promise(resolve => {
      this._rolServicie.listar().subscribe(roles => {
        resolve(roles);
      },
        error => {
          return error
        });
    });
    // console.log("asi comienza " + rolaweit);
    rolaweit.forEach(rol => {
      if (this.rol.nombre == "MASTER" && rol.nombre == "MASTER") {
        let rolselect = {
          nombre: rol.nombre,
          id: rol.id,
          menu: rol.menu,
          check: false
        }
        this.listaRoles.push(rolselect);
      }else if(rol.nombre != "MASTER"){
        let rolselect = {
          nombre: rol.nombre,
          id: rol.id,
          menu: rol.menu,
          check: false
        }
        this.listaRoles.push(rolselect);
      }
    });
    console.log("asi termina " + this.listaRoles);
  }

  onOpened(event: any) {
    this.frame = event;
  }




  mostrar(usuarioSelect: Usuario) {
    this.usuario = usuarioSelect;
    this.identificacion = this.usuario.identificacion;
    this.email = this.usuario.email;
    this.login = this.usuario.login;
    this.registrar = true;
    this.modo = 'EDIT';
    this.selecionarRol(usuarioSelect.roles);
  }
  selecionarRol(lista: any[]) {
    this.listaRoles.forEach(async rol => {
      lista.forEach(async rolsusuario => {
        if (rolsusuario.id === rol.id) {
          rol.check = true;
        }
      });

    });
  }
  selecionarTodos() {
    if (this.seleccionartodos)
      this.seleccionartodos = false
    else
      this.seleccionartodos = true

    this.listaRoles.forEach(async menu => {      
      menu.check = this.seleccionartodos;
    });
  }



  selectedRol(usuarioSelect: Rol) {
    this.usuario = usuarioSelect;
  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._usuarioService.eliminar(this.usuario);
    this.msg.msgInfo('SE ELIMINO EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  validarUsuario(): boolean {
    let valido = true;
    if (this.identificacion === 0 || this.identificacion === null || this.identificacion === undefined) {
      this.msg.msgWarning('INGRESE IDENTIFICACION');
      valido = false;
      $('#identificacion').focus();
      return valido;
    }
    if (this.email === '' || this.email === null || this.email.trim === "" || this.email === undefined) {
      this.msg.msgWarning('INGRESE EMAIL');
      valido = false;
      $('#email').focus();
      return valido;
    }
    if (this.usuario.nombre === '' || this.usuario.nombre === null || this.usuario.nombre === undefined) {
      this.msg.msgWarning('INGRESE NOMBRE ');
      valido = false;
      $('#nombres').focus();
      return valido;
    }
    if (this.usuario.apellidos === '' || this.usuario.apellidos === null || this.usuario.apellidos === undefined) {
      this.msg.msgWarning('INGRESE APELLIDO ');
      valido = false;
      $('#apellido').focus();
      return valido;
    }
    if (this.login === '' || this.login === null || this.login === undefined) {
      this.msg.msgWarning('INGRESE LOGIN ');
      valido = false;
      $('#login').focus();
      return valido;
    }
    if (this.usuario.password === '' || this.usuario.password === null || this.usuario.password === undefined) {
      this.msg.msgWarning('INGRESE CONTRASEÑA ');
      valido = false;
      $('#password').focus();
      return valido;
    }
    if (this.usuario.roles === undefined || this.usuario.roles.length <= 0) {
      this.msg.msgWarning('INGRESE ALMENOS UN  ROL');
      valido = false;
      return valido;
    }
    return valido;
  }

  async submit() {
    this.listaRolesSelect = [];
    this.listaRoles.forEach(async rol => {
      if (rol.check) {
        this.listaRolesSelect.push(rol);
      }
    });
    this.usuario.roles = this.listaRolesSelect;

    console.log(this.usuario);
    let valido = await this.validarUsuario();
    if (valido) {
      let valido2 = await this.validarIdLoEm();
      if (valido2) {
        this._spinnerService.show();
        if (this.modo == 'REG') {
          this._usuarioService.registrar(this.usuario);
          this.limpiar();
          this.msg.msgSuccess('Guardado Exitoso!');
        } else {
          this._usuarioService.actualizar(this.usuario);
          this.msg.msgSuccess("Usuario se modificó exitosamente!");
        }
        this._spinnerService.hide();
      }

    }
  }

  async validarIdLoEm() {
    let valido = true;
    if (this.identificacion != this.usuario.identificacion) {
      let usuIdentificacion: Usuario[] = await this._usuarioService.getUsuarioWhere("identificacion", this.identificacion);
      if (usuIdentificacion.length > 0) {
        this.msg.msgDanger("Usuario ya exite con la identificiacion " + this.identificacion);
        return valido = false;
      } else {
        this.usuario.identificacion = this.identificacion;
      }
    }
    if (this.email != this.usuario.email) {
      let usuEmail: Usuario[] = await this._usuarioService.getUsuarioWhere("email", this.email);
      if (usuEmail.length > 0) {
        this.msg.msgDanger("Usuario ya exite con el Correo electronico " + this.email);
        return valido = false;
      } else {
        this.usuario.email = this.email;
      }
    }
    if (this.login != this.usuario.login) {
      let usuLogin: Usuario[] = await this._usuarioService.getUsuarioWhere("login", this.login);
      if (usuLogin.length > 0) {
        this.msg.msgDanger("Usuario ya exite con el Usuario " + this.login);
        return valido = false;
      } else {
        this.usuario.login = this.login;
      }
    }

    return valido
  }
}
