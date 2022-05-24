import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Articulo } from 'app/models/articulo';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArticuloService } from 'app/services/articulo.service';
import { Carrito } from 'app/models/carrito';
import { UsuarioService } from 'app/services/usuario.service';
import { CarritosService } from 'app/services/carrito.service';
import { DetalleCarrito } from 'app/models/detalle_carrito';



@Component({
  selector: 'app-tienda',
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent implements OnInit {
  public findParam = 'CODIGO';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 10;
  public nextpage = "";
  public anterior = [];
  public tipos = ["TODOS", "GRANOLAS", "CEREALES", "AVENAS", "BEBIDAS", "OTROS"];
  public nombre;
  public valor_busqueda = 100000;
  public descripcion;
  public tipo = "TODOS";
  public fileselect: File;
  public url = "../assets/img/articulo128.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public articulo = {} as Articulo;
  public usuario;
  public session = false;
  public micarrito = {} as Carrito;
  public articuloSelect = {} as Articulo;
  public articulos: any[];
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: TiendaComponent;
  constructor(

    private _usuarioService: UsuarioService,
    private util: TextTilUtil,
    private _carritoService: CarritosService,
    private msg: Messages,
    public _articuloService: ArticuloService) { }

  ngOnInit() {
    this.limpiar();
    this.listarFiltro("", this.valor_busqueda);
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
    }
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



  async listarFiltro(grupo: string, precio: any) {
    let lista = this._articuloService.filtroGrupoPrecio(grupo, precio);
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
    console.log(this.findValue.length, pressKey);

    if (this.tipo == 'TODOS') {
      this.findValue = "";
      this.listarFiltro("", this.valor_busqueda);
      this.paginador = true;
    } else {
      this.paginador = false;
      this.pagina = 0;
      this.anterior = [];
      this.nextpage = "";
      this.adelante = true;
      this.listarFiltro(this.tipo, this.valor_busqueda);
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

  selected(articuloSelect: Articulo) {
    this.articulo = articuloSelect;
  }

  async agregarProducto(articuloSelect: Articulo) {
    this.micarrito.cliente = this.usuario;

    let carritoActivo: Carrito[] = await this._carritoService.getCarritoAsync(this.usuario.id, "ACTIVO");
    if (carritoActivo.length > 0) {
      this.micarrito=carritoActivo[0];
      let encontro=false;
      for(let detalle of this.micarrito.articulos){
        console.log(detalle.articulo.id,articuloSelect.id)
        if(detalle.articulo.id===articuloSelect.id){
          detalle.cantidad ++;
          detalle.valor_uni = articuloSelect.precio;
          detalle.valor_total = detalle.valor_uni * detalle.cantidad;
          encontro=true;
          break;
        }
      } 
      if(!encontro){
        var detalle_carrito = {} as DetalleCarrito;
        detalle_carrito.articulo = articuloSelect;
        detalle_carrito.cantidad =1;
        detalle_carrito.valor_uni = articuloSelect.precio;
        detalle_carrito.valor_total = detalle_carrito.valor_uni * detalle_carrito.cantidad;
        detalle_carrito.descuento = 0;
        detalle_carrito.iva = 0;
       this.micarrito.articulos.push(detalle_carrito);
      }
      this._carritoService.actualizar(this.micarrito);
      this.msg.msgSuccess("Se Agregó articulo al carrito!");
    } else {
      this.micarrito.estado = "ACTIVO";
        var detalle_carrito = {} as DetalleCarrito;
        detalle_carrito.articulo = articuloSelect;
        detalle_carrito.cantidad = 1;
        detalle_carrito.valor_uni = articuloSelect.precio;
        detalle_carrito.valor_total = detalle_carrito.valor_uni * detalle_carrito.cantidad;
        detalle_carrito.descuento = 0;
        detalle_carrito.iva = 0;
        const arr: DetalleCarrito[] = [];
        arr.push(detalle_carrito);
        this.micarrito.articulos = arr;
        console.log(this.micarrito);
        this._carritoService.registrar(this.micarrito);
        this.msg.msgSuccess("Articulo se Agrego a Su carrito de Compras!");
    }


  }

  modoRegistro(modo: boolean) {
    this.registrar = modo;
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

    }
  }
  async changeestado() {
    if (this.articulo.estado == "ACTIVO") {
      this.articulo.estado = "INACTIVO";
    } else {
      this.articulo.estado = "ACTIVO";
    }
    await this._articuloService.actualizar(this.articulo);
    this.msg.msgSuccess("Articulo se MODIFICO Exitosamente!");
  }

  async getArticulo() {
    this.articulo.nombre = this.nombre;
    this.articulo.grupo = this.tipo;
    this.articulo.descripcion = this.descripcion;
  }


}


