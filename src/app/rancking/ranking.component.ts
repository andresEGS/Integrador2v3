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
  selector: 'app-rancking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RanckingComponent implements OnInit {
  public findParam = 'NOMBRE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 30;
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
  private modo = 'REG';
  private session;
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  public rol = [] as Rol;
  public usuarios = [];
  @ViewChild('frame', { static: true }) basicModal: RanckingComponent;
  constructor(private _spinnerService: NgxSpinnerService, private util: TextTilUtil, private msg: Messages, public _usuarioService: UsuarioService, public _rolServicie: RolService) { }

  ngOnInit() {
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
      this.rol = this._usuarioService.getRolSesion();
      this.listarFiltro("nombre", "");
    }
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


}
