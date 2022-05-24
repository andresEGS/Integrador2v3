import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from 'app/services/usuario.service';
import { SESSION } from 'app/services/session';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { Rol } from 'app/models/rol';
import { RolService } from 'app/services/rol.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CategoriaService } from 'app/services/categoria.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public user
  public password
  public sessioncheck
  public usuario = [] as Usuario;
  public newUsuario = {} as Usuario;
  public roles = [];
  public isError = false;
  public isRegistro = false;
  public isRecordar = false;
  public isLogin = true;
  public identificacion_rec;
  public msges = '';
  session = false;

  constructor(private util: TextTilUtil, private msg: Messages, public _usuariopService: UsuarioService,  
    public _rolService: RolService, private _router: Router, private _spinnerService: NgxSpinnerService) { }

  ngOnInit() {


  }

  iniciarSession() {
    if (this.user === '' || this.user == undefined || this.user === null || this.user == 'undefined' ||
      this.password === '' || this.password == undefined || this.password === null || this.password == 'undefined') {
      this.msges = 'Igrese usuario y contraseña';
      this.isError = true;
      this.msg.msgWarning(this.msges);
    } else {
      this._spinnerService.show();
      this._usuariopService.login(this.user, this.password, 'email').subscribe(usuarios => {
        if (usuarios.length > 0) {
          this.usuario = usuarios[0];
          this.guardarSession(this.usuario);
        } else {
          this._usuariopService.login(this.user, this.password, 'login').subscribe(usuariosLogin => {
            if (usuariosLogin.length > 0) {
              this.usuario = usuariosLogin[0];
              this.guardarSession(this.usuario);
            } else {
              this.msges = 'Usuario no negistrado ó datos incorrectos';
              this.isError = true;
              this.msg.msgDanger(this.msges);
            }

          });

        }
        this._spinnerService.hide();
      }
      );
      if (this._usuariopService.checkLogin()) {
        this.msg.msgSuccess('Bienbenido ' + this.user.nombre);
      }
    }
    // this._spinnerService.hide();
  }

  async recuperar() {
    let resp: Usuario[] = await this._usuariopService.getUsuarioWhere("identificacion", this.identificacion_rec);
    if (resp.length > 0) {
      resp[0].password;
      this.msg.msgInfoModal("se envió contraseña y usuario al correro: " + resp[0].email);

    } else {
      this.msg.msgDanger("Usuario no registrado con esta identificación");
    }

  }

  async registrarUsuario() {
    try {
      console.log("GUARDANDO")

      let rolaweit: Rol[] = await this._rolService.getRolWhere("nombre", Rol.ROL2);
      let rol = {} as Rol;
      rol = rolaweit[0];
      this.roles = []
      this.roles.push(rol);
      this.newUsuario.roles = this.roles;
      let valido = await this.validarusuario();
      this.newUsuario.login = this.newUsuario.email;
      if (valido) {
        let resp: Usuario[] = await this._usuariopService.getUsuarioWhere("identificacion", this.newUsuario.identificacion);

        if (resp.length > 0) {
          this.msg.msgDanger("Usuario ya exite con esta identificiación");
        } else {
          let resp2: Usuario[] = await this._usuariopService.getUsuarioWhere("login", this.newUsuario.login);
          if (resp2.length > 0) {
            this.msg.msgDanger("ya exite un usuario este Correo nombre "+this.newUsuario.login);
          } else {
            
            await this._usuariopService.registrar(this.newUsuario);
            this.msg.msgSuccessCenter("¡SE LE HAN OBSEQUIADO 100 PUNTOS POR SÚ INSCRIPCIÓN!")
            this._usuariopService.login(this.newUsuario.login, this.newUsuario.password, 'login').subscribe(usuarios => {
              if (usuarios.length > 0) {                
                this.guardarSession(usuarios[0]);
              }
            });

          }
        }




      }
    } catch (err) {
      console.log(<any>err);
    }


  }

  async validarusuario() {
    let valido = true;
    this.newUsuario.foto = "../assets/img/faces/logo.png";
    if (this.newUsuario.identificacion === 0 || this.newUsuario.identificacion === null || this.newUsuario.identificacion === undefined) {
      this.msg.msgDanger('INGRESE IDENTIFICACIÓN');
      valido = false;
      $('#identificacion').focus();
      return valido;
    }
    if (this.newUsuario.email === '' || this.newUsuario.email === null || this.newUsuario.email === undefined) {
      this.msg.msgDanger('INGRESE EMAIL');
      valido = false;
      $('#email').focus();
      return valido;
    } else {
      this.newUsuario.email = this.newUsuario.email.trim();
    }
    if (this.newUsuario.nombre === '' || this.newUsuario.nombre === null || this.newUsuario.nombre === undefined) {
      this.msg.msgDanger('INGRESE NOMBRE ');
      valido = false;
      $('#nombres').focus();
      return valido;
    }
    if (this.newUsuario.apellidos === '' || this.newUsuario.apellidos === null || this.newUsuario.apellidos === undefined) {
      this.msg.msgDanger('INGRESE APELLIDO ');
      valido = false;
      $('#apellido').focus();
      return valido;
    }
    if (this.newUsuario.password === '' || this.newUsuario.password === null || this.newUsuario.password === undefined) {
      this.msg.msgDanger('INGRESE CONTRASEÑA ');
      valido = false;
      $('#password').focus();
      return valido;
    }


    return valido;
  }

  mostrarRegistro(mostrar: boolean) {
    // this.msg.msgSuccess('Mostrar Registro ' + mostrar);
    this.isRecordar = !mostrar;
    this.isLogin = !mostrar;
    this.isRegistro = mostrar;
  }
  mostrarLogin(mostrar: boolean) {
    // this.msg.msgSuccess('Mostrar Registro ' + mostrar);
    this.isRecordar = !mostrar;
    this.isLogin = mostrar;
    this.isRegistro = !mostrar;
  }
  mostrarRecordar(mostrar: boolean) {
    // this.msg.msgSuccess('Mostrar Registro ' + mostrar);
    this.isRecordar = mostrar;
    this.isLogin = !mostrar;
    this.isRegistro = !mostrar;
  }

  limpiar() {
    this.newUsuario = {} as Usuario
    this.isRegistro = false;
    this.isLogin = true;
  }

  logOut() {
    localStorage.clear();
    sessionStorage.clear();
    this._router.navigate(['']);
    this.session = false;
  }

  guardarSession(usuario:Usuario) {
    var user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      login: usuario.login,
      foto: usuario.foto,
      roles: usuario.roles,
      puntos: usuario.puntos,
      categoria: usuario.categoria
    }
      ;
    localStorage.setItem(SESSION.sesiontemporal, this.sessioncheck);
    if (this.sessioncheck) {
      localStorage.setItem(SESSION.usuarioSesion, this.util.encriptar(JSON.stringify(user)));
      localStorage.setItem(SESSION.rolSesion, this.util.encriptar(JSON.stringify(usuario.roles[0])));
    } else {
      sessionStorage.setItem(SESSION.usuarioSesion, this.util.encriptar(JSON.stringify(user)));
      sessionStorage.setItem(SESSION.rolSesion, this.util.encriptar(JSON.stringify(usuario.roles[0])));
    }
    this._router.navigate(['/principal']);
  }




}
