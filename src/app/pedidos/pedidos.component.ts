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
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  public findParam = 'CODIGO';
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
  public tipo;
  public fileselect: File;
  public url = "../assets/img/articulo128.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public detalle_carrito = {} as DetalleCarrito;

  
  public carritosDespacho: any[]; 
  public carritosEmpacados: any[];
  public carritosDistrivucion: any[];
  public carritosfinalizados: any[];
  
  private resultadoDespacho = false;
  private resultadoEmpacados = false;
  private resultadoDistrivucion = false;
  private resultadoFinalizados = false;
  public carrito = {} as Carrito;
  public selectedIndex = new FormControl(0);
  public carritoSelect = {} as Carrito;
  private modo = 'REG';
  
  private mostrarCarritoSelect = false;
  private spinner = false;
  public usuario;
  public session = false;
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: PedidosComponent;
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
  }





  async listarFiltro() {
    let listadespacho = this._carritosService.listarEstado(Carrito.DESPACHO);
    (await listadespacho).subscribe(lista1 => {
      this.carritosDespacho = lista1;
      if (lista1.length == 0) {
        this.resultadoDespacho = true;
      } else {
        this.resultadoDespacho = false;
      }
    });

    let listaEmpaque = this._carritosService.listarEstado(Carrito.EMPAQUE);
    (await listaEmpaque).subscribe(lista2 => {
      this.carritosEmpacados = lista2;
      if (lista2.length == 0) {
        this.resultadoEmpacados = true;
      } else {
        this.resultadoEmpacados = false;
      }
    });

    let listadistrivuicion= this._carritosService.listarEstado(Carrito.ENTREGA);
    (await listadistrivuicion).subscribe(lista3 => {
      this.carritosDistrivucion = lista3;
      if (lista3.length == 0) {
        this.resultadoDistrivucion = true;
      } else {
        this.resultadoDistrivucion = false;
      }
    });

    let listaFinalizado = this._carritosService.listarEstado(Carrito.FINALIZADO);
    (await listaFinalizado).subscribe(lista4 => {
      this.carritosfinalizados = lista4;
      if (lista4.length == 0) {
        this.resultadoFinalizados= true;
      } else {
        this.resultadoFinalizados = false;
      }
    });

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
    this.selectedIndex.setValue(4);
  }
  validarTab(evento) {
    this.selectedIndex.setValue(evento);

      if (this.selectedIndex.value != 4) {
        this.mostrarCarritoSelect = false;
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

  cambiarEstado() {
    switch (this.carritoSelect.estado) {      
      case  Carrito.DESPACHO:
        this.carritoSelect.estado=Carrito.EMPAQUE;
      break; 
      case  Carrito.EMPAQUE:
        this.carritoSelect.estado=Carrito.ENTREGA;
      break; 
      case  Carrito.ENTREGA:
        this.carritoSelect.estado=Carrito.FINALIZADO;
      break;    
    }
    this.carritoSelect.responsable=this.usuario;
    this._carritosService.actualizar(this.carritoSelect);
    this.msg.msgSuccess("El pedido paso al estado "+this.carritoSelect.estado+"!");

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
    }
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

  getBotonEstado(estado):String {
    var nombre="EMPACAR PEDIDO"
    switch (estado) {
      
      case  Carrito.DESPACHO:
        nombre="EMPACAR PEDIDO"
      break; 
      case  Carrito.EMPAQUE:
        nombre="ENVIAR A DISTRIVUCION"
      break; 
      case  Carrito.ENTREGA:
        nombre="FINALIZAR VENTA"
      break;    
    }
   return nombre
  }




  spinnerMostrar(accion) {
    this.spinner = accion
  }


}


