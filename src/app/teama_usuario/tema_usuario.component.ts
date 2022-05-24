import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Tema } from 'app/models/tema';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArchivoService } from 'app/services/archivo.service';
import { TemaService } from 'app/services/tema.service';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UsuarioService } from 'app/services/usuario.service';
import { Usuario } from 'app/models/usuario';



@Component({
  selector: 'app-temas',
  templateUrl: './tema_usaurio.component.html',
  styleUrls: ['./tema_usuario.component.css']
})
export class TemaUsuarioComponent implements OnInit {
  public findParam = 'NOMBRE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 10;
  public nextpage = "";
  public anterior = [];
  public nombre;
  public fileselect: File;
  public url = "../assets/img/tema.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public tema = {} as Tema;
  public temaSelect = {} as Tema;
  public temas: any[]
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public usuario = {} as Usuario;
  public session;
  public frame: ElementRef;
  @ViewChild('nombreTema', { static: false }) nombre_tema: ElementRef;
  @ViewChild('contenidoTema', { static: false }) contenido_tema: ElementRef;
  @ViewChild('puntosTema', { static: false }) puntos_tema: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: TemaUsuarioComponent;
  constructor(
    public _usuarioService: UsuarioService,
    private _sanitizer: DomSanitizer,
    private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    private _archivoService: ArchivoService,
    private msg: Messages,
    public _temaService: TemaService) { }

  ngOnInit() {
    // this.nombre_tema.nativeElement.focus();
    this.limpiar();
    this.listarFiltro("nombre", "");
    this.session = this._usuarioService.checkLogin();

    if (this.session) {

      this.usuario = this._usuarioService.getUsuarioSesion();
      this.actualizarUsuario();
      this._spinnerService.show();

    }
  }

  async actualizarUsuario(){
    let usuario: Usuario[] = await this._usuarioService.getUsuarioWhere('id', this.usuario.id);
    if (usuario.length > 0) {
      this.usuario = usuario[0];
    }
  }

  getVideoIframe() {
    var url = this.tema.video;
    console.log(url);
    if (url === undefined) {
      return '';
    } else {
      var video, results;

      if (url === null) {
        return '';
      }
      results = url.match('[\\?&]v=([^&#]*)');
      video = (results === null) ? url : results[1];

      return this._sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + video);
    }
  }
  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };

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

  onFileSelectedCertificado(event) {
    this.fileselectCertificado = <File>event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.urlcertificado = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }




  async listarFiltro(tiposearch: string, valorfind: any) {
    let lista = this._temaService.listarFiltro(this.pagesize, this.nextpage, this.adelante, tiposearch, valorfind);
    (await lista).subscribe(listaTemas => {
      this.temas = listaTemas;
      if (listaTemas.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false
        this.siguiente = this.temas[listaTemas.length - 1].id;

      }
    })
  }
  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.temas[0].id;
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
    this.tema = {} as Tema;
    this.temaSelect = {} as Tema;
    this.modo = 'REG';
    this.nombre = "";
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/tema.png";
  }


  onOpened(event: any) {
    this.frame = event;
  }

  mostrar(temaSelect: Tema) {
    this.tema = temaSelect;
    this.nombre = this.tema.nombre;
    console.log(this.tema);
    // const parsedUrl = new URL(temaSelect.parche);
    // parsedUrl.toJSON
    //  console.log(parsedUrl); 
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.registrar = true;
    this.modo = 'EDIT';
  }

  selected(espeSelect: Tema) {
    this.tema = espeSelect;

  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._temaService.eliminar(this.tema);
    this.msg.msgInfo('SE ELIMINO EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  validarTema(): boolean {

    let valido = true;
    this.tema.nombre = this.nombre;
    console.log(this.tema);
    if (this.util.isStringVacio(this.nombre)) {

      this.msg.msgWarningmodal('INGRESE NOMBRE DEL TEMA', false);
      valido = false;
      this.nombre_tema.nativeElement.focus();

      return valido;
    }
    if (this.util.isStringVacio(this.tema.contenido)) {
      this.msg.msgWarningmodal('INGRESE CONTENDIO DEL TEMA', false);
      valido = false;
      this.contenido_tema.nativeElement.focus();
      return valido;
    }
    if (this.util.isNumberVacio(this.tema.puntos)) {
      this.msg.msgWarningmodal('INGRESE PUNTOS NECESARIOS', false);
      valido = false;
      this.puntos_tema.nativeElement.focus();
      return valido;
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarTema();
    if (valido) {
      let valido2 = await this.validarNombre();
      if (valido2) {
        this._spinnerService.show();
        if (this.modo == 'REG') {
          await this._temaService.registrar(this.tema);
          this.limpiar();
          this._spinnerService.hide();
          this.msg.msgSuccess('Guardado Exitoso!');
        } else {
          await this._temaService.actualizar(this.tema)
          this._spinnerService.hide();
          this.msg.msgSuccess("Tema se MODIFICO Exitosamente!");
        }
      }

    }
  }
  async changeestado() {
    this._spinnerService.show();

    await this._temaService.actualizar(this.tema);
    this._spinnerService.hide();
    this.msg.msgSuccess("Tema se MODIFICO Exitosamente!");
  }

  async validarNombre() {
    let valido = true;
    if (this.nombre != this.tema.nombre) {
      let usuIdentificacion: Tema[] = await this._temaService.getWhereAsync("nombre", this.nombre);
      if (usuIdentificacion.length > 0) {
        this.msg.msgDanger("Tema ya exite con el nombre " + this.nombre);
        return valido = false;
      } else {
        this.tema.nombre = this.nombre;
      }
    }

    return valido
  }
}
