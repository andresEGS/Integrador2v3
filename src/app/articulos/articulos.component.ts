import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Articulo } from 'app/models/articulo';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArchivoService } from 'app/services/archivo.service';
import { ArticuloService } from 'app/services/articulo.service';




@Component({
  selector: 'app-articulos',
  templateUrl: './articulos.component.html',
  styleUrls: ['./articulos.component.css']
})
export class ArticulosComponent implements OnInit {
  public findParam = 'GRUPO';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 10;
  public nextpage = "";
  public anterior = [];
  public tipos = ["GRANOLAS", "CEREALES", "AVENAS", "BEBIDAS", "OTROS"];
  public nombre;
  public descripcion;
  public ingredientes;
  public tipo;
  public fileselect: File;
  public url = "../assets/img/articulo128.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public articulo = {} as Articulo;
  public articuloSelect = {} as Articulo;
  public articulos: any[];
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: ArticulosComponent;
  constructor(
    private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    private _archivoService: ArchivoService,
    private msg: Messages,
    public _articuloService: ArticuloService) { }

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
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  onFileSelectedCertificado(event) {
    this.fileselectCertificado = <File>event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.urlcertificado = event.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  cancelFile(event) {
    this.fileselect = null;
    this.url = "../assets/img/articulo128.png";
    this.articulo.imagen = this.url;
  }

  cancelFileCertificado(event) {
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.articulo.imagen = this.urlcertificado;
  }



  async listarFiltro(tiposearch: string, valorfind: any) {
    let lista = this._articuloService.listarFiltro(this.pagesize, this.nextpage, this.adelante, tiposearch, valorfind);
    (await lista).subscribe(listaArticulos => {
      this.articulos = listaArticulos;
      if (listaArticulos.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false;
        this.siguiente = this.articulos[listaArticulos.length - 1].id;

      }
    });
  }
  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.articulos[0].id;
      if (this.anterior.length === 0) {
        this.anterior.push(valorvector);
      } else {
        let encontro = false;
        this.anterior.forEach(async (valor) => {
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
          this.listarFiltro("nombre", this.findValue.toUpperCase());
          break;
        case 'GRUPO':
          this.listarFiltro("grupo", this.findValue.toUpperCase());
          break;
        case 'PRECIO':
          this.listarFiltro("precio",5500);
          break;
        case 'ESTADO':
          this.listarFiltro("estado", this.findValue.toUpperCase());
          break;
        case 'CANTIDAD':
          this.listarFiltro("cantidad", 52);
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
    this.articulo = {} as Articulo;
    this.articuloSelect = {} as Articulo;
    this.modo = 'REG';
    this.nombre = "";
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/articulo128.png";
  }


  onOpened(event: any) {
    this.frame = event;
  }

  mostrar(articuloSelect: Articulo) {
    this.articulo = articuloSelect;
    this.url = articuloSelect.imagen;
    this.urlcertificado = articuloSelect.imagen;
    this.nombre = this.articulo.nombre;
    this.descripcion = this.articulo.descripcion;
    this.tipo = this.articulo.grupo;
    console.log(this.articulo);
    // const parsedUrl = new URL(articuloSelect.parche);
    // parsedUrl.toJSON
    //  console.log(parsedUrl); 
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.registrar = true;
    this.modo = 'EDIT';
  }

  selected(espeSelect: Articulo) {
    this.articulo = espeSelect;

  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._articuloService.eliminar(this.articulo);
    this.msg.msgInfo('SE ELIMINO EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  validarArticulo(): boolean {
    let valido = true;
    if (this.util.isStringVacio(this.nombre)) {
      this.msg.msgWarning('INGRESE NOMBRE');
      valido = false;
      $('#nombre').focus();
      valido;
    }
    if (this.util.isStringVacio(this.tipo)) {
      this.msg.msgDanger("Articulo debe tener un grupo ");
      valido = false;
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarArticulo();
    if (valido) {
      this.getArticulo();
      console.log(this.articulo);
      if (this.modo == 'REG') {
        await this._articuloService.registrar(this.articulo, this.fileselect);
        this.limpiar();
        this._spinnerService.hide();
        this.msg.msgSuccess('Guardado Exitoso!');
      } else {
        await this._articuloService.actualizarArticulo(this.articulo, this.fileselect);
        this._spinnerService.hide();
        this.msg.msgSuccess("Articulo se MODIFICO Exitosamente!");
      }
    }
  }
  async changeestado() {
    this._spinnerService.show();
    if (this.articulo.estado == "ACTIVO") {
      this.articulo.estado = "INACTIVO";
    } else {
      this.articulo.estado = "ACTIVO";
    }
    await this._articuloService.actualizar(this.articulo);
    this._spinnerService.hide();
    this.msg.msgSuccess("Articulo se MODIFICO Exitosamente!");
  }

  async getArticulo() {
    this.articulo.nombre = this.nombre;
    this.articulo.grupo = this.tipo;
    this.articulo.descripcion = this.descripcion;
    // this.articulo.ingredientes =this.ingredientes;
  }


}


