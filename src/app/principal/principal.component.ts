import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { Usuario } from 'app/models/usuario';
import { EspecialidadService } from 'app/services/especialidad.service';
import { UsuarioService } from 'app/services/usuario.service';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Categoria } from 'app/models/categoria';
import { CategoriaService } from 'app/services/categoria.service';
import { SESSION } from 'app/services/session';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})

export class PrincipalComponent implements OnInit {
  public usuario = {} as Usuario;
  public categoria = {} as Categoria;
  public categorias: any[];
  public identificacion: number;
  public email;
  public login;
  public session;
  public starts:string[]=["star_outline","star_outline","star_outline","star_outline","star_outline"];
  public url = "../assets/img/faces/logo.png";
  public fileselect: File;

  constructor(private _sanitizer: DomSanitizer
    , private _spinnerService: NgxSpinnerService, private util: TextTilUtil, private msg: Messages, public _usuarioService: UsuarioService, public _categoriaService: CategoriaService) { }

  ngOnInit() {
    this.categoria.imagen="rango1";
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
      this.cargarCategoria();
      this.listacategorias();
      this.getusuarioPerfile();
       setTimeout(() => {
        this.getusuarioPerfile();
        this.cargarCategoria();        
        this.cargarsession();
        this.listacategorias();
      }, 1000);

    }

  }

  async listacategorias() {
    let lista = await this._categoriaService.getListar();
    if (lista.length > 0) {
      this.categorias = lista;
    }   
  }

  async cargarCategoria() {
    this.starts=["star_outline","star_outline","star_outline","star_outline","star_outline"];
    let categoriausuario = await this._categoriaService.getWhereAsync('id', this.usuario.categoria);
    if (categoriausuario.length > 0) {
      this.categoria = categoriausuario[0];
    }
    let valor=(((this.usuario.puntos-this.categoria.puntos_inicial)/100)/5);
    for (let index = 0; index < valor; index++) {
      if(index+1>valor){
        this.starts[index] ="star_half"; 
      }else{
        this.starts[index] ="star"; 
      }
          
    }
    console.log(valor);
  }

  async cargarsession() {
    let usuario: Usuario[] = await this._usuarioService.getUsuarioWhere('id', this.usuario.id);
    if (usuario.length > 0) {
      this.usuario = usuario[0];
    }
    var user = {
      id: this.usuario.id,
      nombre: this.usuario.nombre,
      apellidos: this.usuario.apellidos,
      email: this.usuario.email,
      login: this.usuario.login,
      foto: this.usuario.foto,
      roles: this.usuario.roles,
      puntos: this.usuario.puntos,
      categoria: this.usuario.categoria
    }
    sessionStorage.setItem(SESSION.usuarioSesion, this.util.encriptar(JSON.stringify(user)));
  }

  getVideoIframe(url) {
    var video, results;

    if (url === null) {
      return '';
    }
    results = url.match('[\\?&]v=([^&#]*)');
    video = (results === null) ? url : results[1];

    return this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + video);
  }


  async getusuarioPerfile() {

    let usuIdentificacion: Usuario[] = await this._usuarioService.getUsuarioWhere("id", this.usuario.id);

    if (usuIdentificacion.length == 0) {
      this.msg.msgWarning('EL USUARIO NO ESTA REGISTRADO');
    } else {
      this.usuario = usuIdentificacion[0];
      this.identificacion = this.usuario.identificacion;
      this.login = this.usuario.login;
      this.email = this.usuario.email;
      if (this.usuario.foto == null) {
        this.usuario.foto = this.url;
      } else {
        this.url = this.usuario.foto;
      }
      this._spinnerService.hide();
    }

  }

  cancelFile(event) {
    this.fileselect = null;
    this.url = "../assets/img/faces/logo.png";
    this.usuario.foto = this.url;
  }

  onFileSelected(event) {
    this.fileselect = <File>event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.url = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async validarUsuario() {
    let valido = true;
    if (this.identificacion === 0 || this.identificacion === null || this.identificacion === undefined) {
      this.msg.msgWarning('INGRESE IDENTIFICACION');
      valido = false;
      $('#identificacion').focus();
      return valido;
    }
    if (this.email === '' || this.email === null || this.email === undefined) {
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
    console.log(valido);
    return valido;
  }

  async submit() {


    console.log(this.usuario);
    let valido = await this.validarUsuario();
    if (valido) {
      let valido2 = await this.validarIdLoEm();
      if (valido2) {
        this._spinnerService.show();
        // console.log(this.usuario);
        await this._usuarioService.actualizarConFoto(this.usuario, this.fileselect);
        this._spinnerService.hide();
        this.msg.msgSuccess("Usuario se MODIFICO Exitosamente!");
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


