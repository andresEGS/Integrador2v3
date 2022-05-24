import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Especialidad } from 'app/models/especialidad';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { EspecialidadService } from 'app/services/especialidad.service';
import { RolService } from 'app/services/rol.service';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArchivoService } from 'app/services/archivo.service';
import { Tipo_archivo } from 'app/services/tipo_archivo';
import { Archivo } from 'app/models/archivo';


@Component({
  selector: 'app-especialidades',
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.css']
})
export class EspecialidadComponent implements OnInit {
  public findParam = 'NOMBRE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 4;
  public nextpage = "";
  public anterior = [];
  public nombre;
  public fileselect: File;
  public url = "../assets/img/especialidad.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public especialidad = {} as Especialidad;
  public especialidadSelect = {} as Especialidad;
  public especialidades: any[]
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: EspecialidadComponent;
  constructor(
    private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    private _archivoService: ArchivoService,
    private msg: Messages,
    public _especialidadService: EspecialidadService) { }

  ngOnInit() {
    this.limpiar();
    this.listarFiltro("nombre", "");
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

  cancelFile(event) {
    this.fileselect = null;
    this.url = "../assets/img/especialidad.png";
    this.especialidad.parche = this.url;
  }

  cancelFileCertificado(event) {
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.especialidad.certificado = this.urlcertificado;
  }



  async listarFiltro(tiposearch: string, valorfind: any) {
    let lista = this._especialidadService.listarFiltro(this.pagesize, this.nextpage, this.adelante, tiposearch, valorfind);
    (await lista).subscribe(listaEspecialidads => {
      this.especialidades = listaEspecialidads;
      if (listaEspecialidads.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false
        this.siguiente = this.especialidades[listaEspecialidads.length - 1].id;

      }
    })
  }
  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.especialidades[0].id;
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
    this.especialidad = {} as Especialidad;
    this.especialidadSelect = {} as Especialidad;
    this.modo = 'REG';
    this.nombre = "";
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/especialidad.png";
  }


  onOpened(event: any) {
    this.frame = event;
  }

  mostrar(especialidadSelect: Especialidad) {
    this.especialidad = especialidadSelect;
    this.url = especialidadSelect.parche;
    this.urlcertificado = especialidadSelect.certificado;
    this.nombre = this.especialidad.nombre;
    console.log(this.especialidad);
    // const parsedUrl = new URL(especialidadSelect.parche);
    // parsedUrl.toJSON
    //  console.log(parsedUrl); 
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.registrar = true;
    this.modo = 'EDIT';
  }

  selected(espeSelect: Especialidad) {
    this.especialidad = espeSelect;

  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._especialidadService.eliminar(this.especialidad);
    this.msg.msgInfo('SE ELIMINO EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  validarEspecialidad(): boolean {
    let valido = true;
    if (this.util.isStringVacio(this.nombre)) {
      this.msg.msgWarning('INGRESE NOMBRE');
      valido = false;
      $('#nombre').focus();
      return valido;
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarEspecialidad();
    if (valido) {
      let valido2 = await this.validarNombre();
      if (valido2) {
        this._spinnerService.show();
        if (this.modo == 'REG') {
          await this._especialidadService.registrar(this.especialidad, this.fileselect, this.fileselectCertificado);
          this.limpiar();
          this._spinnerService.hide();
          this.msg.msgSuccess('Guardado Exitoso!');
        } else {
          await this._especialidadService.actualizarEspecialidad(this.especialidad, this.fileselect, this.fileselectCertificado);
          this._spinnerService.hide();
          this.msg.msgSuccess("Especialidad se MODIFICO Exitosamente!");
        }
      }

    }
  }
  async changeestado() {
    this._spinnerService.show();
    if (this.especialidad.estado == "ACTIVO") {
      this.especialidad.estado = "INACTIVO";
    } else {
      this.especialidad.estado = "ACTIVO";
    }
    await this._especialidadService.actualizar(this.especialidad);
    this._spinnerService.hide();
    this.msg.msgSuccess("Especialidad se MODIFICO Exitosamente!");
  }

  async validarNombre() {
    let valido = true;
    if (this.nombre != this.especialidad.nombre) {
      let usuIdentificacion: Especialidad[] = await this._especialidadService.getEspecialidadWhere("nombre", this.nombre);
      if (usuIdentificacion.length > 0) {
        this.msg.msgDanger("Especialidad ya exite con el nombre " + this.nombre);
        return valido = false;
      } else {
        this.especialidad.nombre = this.nombre;
      }
    }

    return valido
  }
}
