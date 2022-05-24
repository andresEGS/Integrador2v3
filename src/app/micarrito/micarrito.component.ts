import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Articulo } from 'app/models/articulo';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { ArchivoService } from 'app/services/archivo.service';
import { ArticuloService } from 'app/services/articulo.service';
import { CarritosService } from 'app/services/carrito.service';
import { UsuarioService } from 'app/services/usuario.service';
import { Carrito } from 'app/models/carrito';
import { Usuario } from 'app/models/usuario';
import { DetalleCarrito } from 'app/models/detalle_carrito';
import { FormControl } from '@angular/forms';




@Component({
  selector: 'app-mi-carrito',
  templateUrl: './micarrito.component.html',
  styleUrls: ['./micarrito.component.css']
})
export class MicarritoComponent implements OnInit {
  public findParam = 'CODIGO';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 4;
  public nextpage = "";
  public anterior = [];
  public tipos = ["GRANOLAS", "CEREALES", "AVENAS", "BEBIDAS", "OTROS"];
  public nombre;
  public descripcion;
  public tipo;
  public fileselect: File;
  public url = "../assets/img/articulo128.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public detalle_carrito = {} as DetalleCarrito;

  public carritos: any[];
  public carrito = {} as Carrito;
  public selectedIndex = new FormControl(0);
  public carritoSelect = {} as Carrito;
  private modo = 'REG';
  private resultado = false;
  private mostrarCarrito = true;
  private mostrarCarritoSelect = false;
  private spinner = false;
  public usuario;
  public session = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: MicarritoComponent;
  constructor(
    private util: TextTilUtil,
    private _usuarioService: UsuarioService,
    private _carritosService: CarritosService,
    private msg: Messages,
    public _articuloService: ArticuloService) { }

  ngOnInit() {
    this.carrito.cliente = {} as Usuario;
    const arr: DetalleCarrito[] = [];
    var detalle_carrito = {} as DetalleCarrito;
    detalle_carrito.articulo = {} as Articulo;
    detalle_carrito.articulo.id = '01';
    arr.push(detalle_carrito);
    this.carrito.articulos = arr;
    console.log(this.carrito);
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
    }
    this.limpiar();
    this.listarFiltro();
    this.cargarCArrito();
  }


  getImagenEstado(estado):String {
    var imagen="finalizado.png"
    switch (estado) {
      case Carrito.ACTIVO:
        imagen="micarrito.png"
      break;
      case  Carrito.DESPACHO:
        imagen="articulo128.png"
      break; 
      case  Carrito.EMPAQUE:
        imagen="pedidos128.png"
      break; 
      case  Carrito.ENTREGA:
        imagen="reparto.png"
      break; 
      case  Carrito.FINALIZADO:
        imagen="finalizado.png"
      break;    
    }
   return imagen
  }


  async listarFiltro() {
    console.log(this.usuario);
    let lista = this._carritosService.listarMisCarritos(this.usuario.id);
    (await lista).subscribe(listaCarritos => {
      this.carritos = listaCarritos;
      if (listaCarritos.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false;
        this.siguiente = this.carritos[listaCarritos.length - 1].id;

      }
    });
  }

  async cargarCArrito() {
    console.log(this.usuario);
    let carritoActivo: Carrito[] = await this._carritosService.getCarritoAsync(this.usuario.id, "ACTIVO");
    if (carritoActivo.length > 0) {
      this.mostrarCarrito = true;
      this.carrito = carritoActivo[0];
    } else {
      this.mostrarCarrito = false;
    }
  }


  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.carritos[0].id;
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

    this.findValue = "";
    this.listarFiltro();
    this.paginador = true;

  }



  changeParam(estado: string) {
    this.findParam = estado;
  }

  async limpiar() {
    this.modo = 'REG';
    this.nombre = "";
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/articulo128.png";
  }


  mostrar(articuloSelect: Articulo) {
    let articulo = articuloSelect;
    this.url = articuloSelect.imagen;
    this.urlcertificado = articuloSelect.imagen;
    this.nombre = articulo.nombre;
    this.descripcion = articulo.descripcion;
    this.tipo = articulo.grupo;
    console.log(articulo);
    // const parsedUrl = new URL(articuloSelect.parche);
    // parsedUrl.toJSON
    //  console.log(parsedUrl); 
    this.fileselect = null;
    this.fileselectCertificado = null;
    // this.registrar = true;
    this.modo = 'EDIT';
  }

  selectedDetalle(detalle: DetalleCarrito) {
    this.detalle_carrito = detalle;
  }

  selectedCArrito(carrito: Carrito) {
    this.carritoSelect = carrito;
    this.mostrarCarritoSelect = true;
    if (this.mostrarCarrito)
      this.selectedIndex.setValue(2);
    else
      this.selectedIndex.setValue(1);
  }
  validarTab(evento) {
    this.selectedIndex.setValue(evento);
    if (this.mostrarCarrito) {
      if (this.selectedIndex.value != 2) {
        this.mostrarCarritoSelect = false;
      }
    }else{
      if (this.selectedIndex.value != 1) {
        this.mostrarCarritoSelect = false;
      }
    }

  }

  eliminarDetalle() {
    var pos = this.carrito.articulos.indexOf(this.detalle_carrito);
    this.carrito.articulos.splice(pos, 1);
    this.calcularValor();
  }

  eliminarDetalle1(detalle: DetalleCarrito) {
    var pos = this.carrito.articulos.indexOf(detalle);
    this.carrito.articulos.splice(pos, 1);
    this._carritosService.actualizar(this.carrito);
  }

  sumarCantidad(detalle: DetalleCarrito) {
    detalle.cantidad = detalle.cantidad + 1;
    detalle.valor_total = detalle.valor_uni * detalle.cantidad;
    this._carritosService.actualizar(this.carrito);
  }
  restarCantidad(detalle: DetalleCarrito) {
    detalle.cantidad = detalle.cantidad - 1;
    detalle.valor_total = detalle.valor_uni * detalle.cantidad;
    this._carritosService.actualizar(this.carrito);
  }

  calcularValor() {
    this.carrito.valor = 200;
    console.log("Calculadno Vlaores");

  }
  modoRegistro(modo: boolean) {
    // this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._carritosService.eliminar(this.carrito);
    this.msg.msgInfo('SE ELIMINO LA COMPRA CORRECTAMENTE');
    this.mostrarCarrito = false;
    this.limpiar();

  }
  validarArticulo(): boolean {
    let valido = true;

    return valido;
  }

  async submit() {
    let valido = await this.validarArticulo();
    if (valido) {
      this.spinnerMostrar(true)
      await this._carritosService.aprobarCarrito(this.carrito);
      this.limpiar();
      this.spinnerMostrar(false)
      this.msg.msgSuccess('Guardado Exitoso!');
      this.mostrarCarrito = false;
    }
  }




  spinnerMostrar(accion) {
    this.spinner = accion
  }


}


