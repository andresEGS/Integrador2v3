import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Medida } from 'app/models/medida';
import { Messages } from 'app/utilidades/Messages';
import { PiezasService } from 'app/services/pieza.service';
import { Pieza } from 'app/models/pieza';

@Component({
  selector: 'app-piezas',
  templateUrl: './piezas.component.html',
  styleUrls: ['./piezas.component.css']
})
export class PiezasComponent implements OnInit {
  public pieza = {} as Pieza;
  public piezaSelect = {} as Pieza;
  public medida = {} as Medida;
  public medidas = [] as any;
  public medidasValid = true;
  public piezas = [];
  public imagenes = [];
  public imagePath = './assets/img/piezas/maniqui.png';
  private modo='REG';
  public frame: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: PiezasComponent;
  constructor(private msg: Messages, public _piezasService: PiezasService) { }

  ngOnInit() {
    for (let index = 1; index < 141; index++) {
      let path = {
        id: index,
        path: './assets/img/piezas/' + index + '.png'
      };
      this.imagenes.push(path);
    }
    this.limpiar();
    this.listarPiezas();
  }

  listarPiezas() {
    this._piezasService.listar().subscribe(piezasList => {
      this.piezas = piezasList;
      if (piezasList.length == 0) {
        this.msg.msgWarning('no se encontraron resultados');
      }

    })
  }

  

  limpiar() {
    // $('#nombre').focus();
    this.pieza = {} as Pieza
    this.pieza.sexo = "U";
    this.medidas=[];
    this.modo = 'REG';
    this.imagePath='./assets/img/piezas/maniqui.png';
  }
  onOpened(event: any) {
    this.frame = event;
  }

  agregarMeidas() {
    if (this.medida.nombre === '' || this.medida.nombre === null || this.medida.nombre === undefined) {
      this.msg.msgDanger('INGRESE IDENTIFICADOR DE LA MEDIDA');
      $('#nombreMedida').focus();
      this.medidasValid = false;
    } else {
      this.medida.valor="0";
      this.medidas.push(this.medida);
      this.medida ={} as Medida;
      this.medidasValid = true;
      $('#MedidasModal').click();
    }


    // this.frame.nativeElement
  }
  eliminarrMeidas(medida: Medida) {
    var pos = this.medidas.indexOf(medida);
    this.medidas.splice(pos, 1);
  }
  agregarImagen(path) {
    this.imagePath = path;
    this.pieza.imagen = path;
    $('#modalSocial').click();
  }
  validarPieza(): boolean {
    let valido = true;
    if (this.pieza.nombre === '' || this.pieza.nombre === null || this.pieza.nombre === undefined) {
      this.msg.msgDanger('INGRESE NOMBRE DE LA PIEZZA');
      valido = false;
      $('#nombre').focus();
      return valido;
    }
    if (this.medidas.length <= 0) {
      this.msg.msgDanger('INGRESE POR LO MENOS UNA MEDIDA');
      valido = false;
      return valido;
    }
    if (this.pieza.imagen === '' || this.pieza.imagen === null || this.pieza.imagen == undefined) {
      this.pieza.imagen = this.imagePath;
      valido = true;
    }
    return valido;
  }
  mostrarPieza(piezaSelect:Pieza) {
    this.pieza = piezaSelect;
    this.modo = 'EDIT';
    $('#nombre').focus();
    this.medidas = this.pieza.medidas  ? this.pieza.medidas : [];
    this.imagePath=this.pieza.imagen;
  }
  selectedPieza(piezaSelect:Pieza){
    this.piezaSelect=piezaSelect
  }
  eliminar() {
    this._piezasService.eliminar(this.piezaSelect);
    this.msg.msgInfo('SE ELIMINO LA PIEZA CORRECTAMENTE');
    this.limpiar();
  }
  submit() {
    this.pieza.medidas = this.medidas;
    let valido = this.validarPieza();
    if (valido) { 
      if (this.modo == 'REG') {
        console.log(this.pieza);
        this._piezasService.registrar(this.pieza);
        this.msg.msgSuccess('Guardado Exitoso!')
      } else {
        this._piezasService.actualizar(this.pieza);
        this.msg.msgSuccess("pieza se MODIFICO Exitosamente!");
      }
      this.limpiar();
    }
  }
}
