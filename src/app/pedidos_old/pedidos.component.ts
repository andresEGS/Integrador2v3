import { Component, OnInit } from '@angular/core';
import { Pedido } from 'app/models/pedido';
import { PiezasService } from 'app/services/pieza.service';
import { Messages } from 'app/utilidades/Messages';
import { UsuarioService } from 'app/services/usuario.service';
import { Usuario } from 'app/models/usuario';
import { Persona } from 'app/models/persona';
import { Pieza } from 'app/models/pieza';
import { Medida } from 'app/models/medida';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { Abono } from 'app/models/abono';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PedidosService } from 'app/services/pedidos.service';
import { AlertService } from 'ngx-alerts';


@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {
  model: any;
  public piezas = [];
  public piezasAdd = [];
  public pedido = {} as Pedido;
  public persona = {} as Persona;
  public usuario = [] as Usuario;
  public piezaSelect = {} as Pieza;
  public medidas = [];
  public pedidos = [];
  public abonos = [];
  public abono = {} as Abono;
  public idpiezaSelect = '0';
  public agregarPieza = false;
  public piezaValida = true;
  public abonoValido = false;
  public left='left';
  public eliminarPieza = false;
  public mensg = '';
  public totalValorString = '';
  fecha: any;
  session;
  fechaEntrega: any;
  constructor(
    private util: TextTilUtil,
    private msg: AlertService,
    private modalService: NgbModal,
    public _usuarioService: UsuarioService,
    public _piezasService: PiezasService,
    public _pedidosService: PedidosService
  ) {
    

   }

  listarPedidos() {
    this._pedidosService.listar().subscribe(pdidios => {
      this.pedidos = pdidios;
      if (pdidios.length == 0) {
        this.msg.warning('no se encontraron resultados');
      }

    })
  }

  ngOnInit() {
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
    }

    this.limpiar();
    this.limpiarPieza();
  }

  listarPiezas() {
    this._piezasService.listarSexo(this.pedido.sexo).subscribe(piezasList => {
      this.piezas = piezasList;
      if (piezasList.length == 0) {
        this.msg.warning('no se encontraron resultados');
      }
    })
    this.limpiarPieza();
  }

  limpiar() {
    let myDate = new Date();
    this.fecha = this.util.dateToJson(myDate);
    this.changeFechaEntrega();
    this.pedido.sexo = 'M';
    this.pedido.valor = 0;
    this.totalValorString = new Intl.NumberFormat().format(this.totalValor())
    this.listarPiezas();
  }

  changeFechaEntrega() {
    let fechaselect = this.util.jsonToDate(this.fecha);
    fechaselect.setDate(fechaselect.getDate() + 2);
    this.fechaEntrega = this.util.dateToJson(fechaselect);
  }

  openModal() {
    this.limpiarPieza();
    let pieza = this.piezas.filter(pieza => pieza.id == this.idpiezaSelect)[0];
    this.piezaSelect.id = pieza.id;
    this.piezaSelect.imagen = pieza.imagen;
    this.piezaSelect.nombre = pieza.nombre;
    this.piezaSelect.estado = pieza.estado;
    pieza.medidas.forEach(element => {
      let medidas = {} as Medida;
      medidas.nombre = element.nombre;
      medidas.descripcion = element.descripcion;
      medidas.valor = element.valor;
      this.piezaSelect.medidas.push(medidas);
    });
    this.piezaSelect.sexo = pieza.sexo;
    this.piezaSelect.valor = pieza.valor;
  }
  closeModal() {
    this.totalValor();
  }

  selectPieza() {
    if (this.idpiezaSelect == '0') {
      this.agregarPieza = false;
    } else {
      this.agregarPieza = true;
    }
  }

  selectPiezaAdd(pieza: Pieza) {
    this.eliminarPieza = true;
    this.piezaSelect = pieza;
  }

  eliminarPiezasAdd(pieza: Pieza) {
    var pos = this.piezasAdd.indexOf(pieza);
    this.piezasAdd.splice(pos, 1);
    this.pedido.valor = this.totalValor();
    $('#ModalPieza').click();
  }

  limpiarPieza(): void {
    this.eliminarPieza = false;
    this.piezaSelect = {} as Pieza;
    this.piezaSelect.imagen = './assets/img/piezas/maniqui.png';
    this.piezaSelect.nombre = '';
    this.piezaSelect.medidas = [];
  }

  validarPieza(): boolean {
    let valido = true;
    if (this.piezaSelect.valor <= 0 || this.piezaSelect.valor === null || this.piezaSelect.valor === undefined) {
      valido = false;
      this.mensg = 'Ingrese el valor de la pieza'
    }
    // var result
    this.medidas = this.piezaSelect.medidas;
    var resutl = this.medidas.filter(medida => (medida.valor == 0 || medida.valor === null || medida.valor === undefined));
    console.log(resutl.length);
    if (resutl.length > 0) {
      valido = false;
      this.mensg = 'No se llenarón todas las medidas'
    }
    return valido;
  }

  addPieza() {
    this.piezaValida = this.validarPieza();
    this.piezaSelect.estado = "PENDIENTE";
    console.log(this.piezaSelect)
    if (this.piezaValida) {
      // var piezatemp = {
      //   id: this.piezaSelect.id,
      //   nombre: this.piezaSelect.nombre,
      //   medidas: this.piezaSelect.medidas,
      //   sexo: this.piezaSelect.sexo,
      //   imagen: this.piezaSelect.imagen,
      //   valor: this.piezaSelect.valor,
      //   estado: this.piezaSelect.estado,
      // };
      this.piezasAdd.push(this.piezaSelect);
      this.pedido.valor = this.totalValor();
      $('#ModalPieza').click();
      this.idpiezaSelect = '0';
      this.selectPieza();

    }


  }


  validarPedido(): boolean {
    let valido = true;

    if (this.persona.nombre === '' || this.persona.nombre === null || this.persona.nombre === undefined) {
      this.msg.danger('INGRESE NOMBRE DE CLIENTE');
      valido = false;
      $('#nombre').focus();
      return valido;
    }

    if (this.piezasAdd.length <= 0) {
      this.msg.danger('INGRESE POR LO MENOS UNA PIEZA');
      valido = false;
    }
    return valido;
  }

  submitPedidoSinAbono(content) {
    this.abonoValido = true;
    this.abono.valor=0;
    this.submitPedido(content);
  }

  public submitPedidoAbono(content) {
    this.abonoValido = false;
    this.submitPedido(content);
  }

  submitPedido(content) {
    if (this.validarPedido()) {
      this.pedido.cliente = this.persona
      this.pedido.piezas = this.piezasAdd
      this.pedido.fecha = this.util.jsonToDate(this.fecha).getTime();
      this.pedido.fecha_entrega = this.util.jsonToDate(this.fechaEntrega).getTime();
      this.pedido.abonos = this.abonos;
      this.pedido.estado = 'PENDIENTE';
      this.pedido.valor= this.totalValor()
      if (!this.abonoValido && (this.abono.valor <= 0 || this.abono.valor == undefined)) {
        this.abonoValido = true;
        this.msg.warning('INGRESE UN ABONO Ó SELECIONE LA OPCION SEGUIR SIN ABONO');
      } else {
        this.abono.fecha = this.pedido.fecha;
        this.abono.saldo = this.pedido.valor - this.abono.valor;
        this.abonos.push(this.abono);
        this.abono.usuario = this.usuario;
        this.pedido.saldo = this.abono.saldo;
        this.pedido.usuario = this.usuario;
        this.pedido.abonos = this.abonos;
        console.log(this.pedido);
        this._pedidosService.registrar(this.pedido);
        this.limpiarPedido();
        this.msg.success('REGISTRO EXITOSO');
      }

    }
  }
  limpiarPedido() {
    this.persona = {} as Persona;
    this.pedido = {} as Pedido;
    this.piezasAdd = [];
    this.abono = {} as Abono;
    this.abonos = [];
    this.piezaValida = true;
    this.abonoValido = false;
    this.eliminarPieza = false;
    this.totalValor();
     $('#addpedidoModal').click();
  }

  valorStrint(valor: number): string {
    return new Intl.NumberFormat().format(valor);
  }

  totalValor(): number {
    var total = 0;
    this.piezasAdd.forEach(element => {
      let pieza = element;
      total = total + pieza.valor
    });
    this.totalValorString = new Intl.NumberFormat().format(total)
    return total;
  }



}
