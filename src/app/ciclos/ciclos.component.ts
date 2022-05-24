import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Menu } from 'app/models/menu';
import { Rol } from 'app/models/rol';
import { RolService } from 'app/services/rol.service';
import { MenuService } from 'app/services/menu.service';
import { Messages } from 'app/utilidades/Messages';
import { CicloService } from 'app/services/ciclo.service';
import { Ciclo } from 'app/models/ciclo';
import * as moment from 'moment';
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-ciclos',
  templateUrl: './ciclos.component.html',
  styleUrls: ['./ciclos.component.css']
})
export class CiclosComponent implements OnInit {
  public ciclo = {} as Ciclo;
  public cicloSelect = {} as Ciclo;
  public listaCiclo = [] as any;
  public ciclos = [];
  private modo = 'REG';
  private registrar = false;
  public frame: ElementRef;
  private hora;
  fecha_inicio: any;
  fecha_anio: any;
  public left='left';
  hoveredDate: NgbDate | null = null;
  public anios: any[];
  anioselect =new FormControl();
  fechaInicial: NgbDate;
  fechaFinal: NgbDate | null = null;
  @ViewChild('frame', { static: true }) basicModal: CiclosComponent;
  constructor(private util: TextTilUtil,private calendar: NgbCalendar,private msg: Messages, public _cicloService: CicloService, public _menuServicie: MenuService) {
   
    
   }
   onDateSelection(date: NgbDate) {
    if (!this.fechaInicial && !this.fechaFinal) {
      this.fechaInicial = date;
    } else if (this.fechaInicial && !this.fechaFinal && date.after(this.fechaInicial)) {
      this.fechaFinal = date;
    } else {
      this.fechaFinal = null;
      this.fechaInicial = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fechaInicial && !this.fechaFinal && this.hoveredDate && date.after(this.fechaInicial) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.fechaFinal && date.after(this.fechaInicial) && date.before(this.fechaFinal);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fechaInicial) || (this.fechaFinal && date.equals(this.fechaFinal)) || this.isInside(date) || this.isHovered(date);
  }

  ngOnInit() {
    this.limpiar();
   
  }

   // 
  async listarAnios(){
     this.anios=await this._cicloService.listarAnios();
  }

  async listarCiclos() {
   let ciclosLista: Ciclo[]= await this._cicloService.getCicloWhere("anio",this.anioselect.value);
   this.ciclos=await ciclosLista;
      
  }

  async buscarCilos(value){
    let ciclosLista: Ciclo[]= await this._cicloService.getCicloWhere("anio",value);
    this.ciclos=await ciclosLista;
       if (this.ciclos.length == 0) {
         this.msg.msgWarning('no se encontraron Ciclos');
       }
  }

  getHora(){
    return moment().format('MMMM Do YYYY, h:mm:ss a')
  }



  async limpiar() {
    this.ciclo = {} as Ciclo;
    this.cicloSelect = {} as Ciclo;   
    await this.listarAnios();
    this.fechaInicial = this.calendar.getToday();
    this.fechaFinal = this.calendar.getNext(this.calendar.getToday(), 'd', 60);
    this.anioselect.setValue(this.fechaInicial.year);
    this.modo = 'REG';
  }


  onOpened(event: any) {
    this.frame = event;
  }


  validarCiclo(): boolean {
    this.ciclo.anio=this.fechaInicial.year;
    this.ciclo.fecha_inicio=this.util.jsonToDate(this.fechaInicial).getTime();
    this.ciclo.fecha_cierre=this.util.jsonToDate(this.fechaFinal).getTime();
    console.log(this.ciclo);
    let valido = true;
   
  
    return valido;
  }

  mostrarRol(cicloSelect: Ciclo) {
    this.ciclo = cicloSelect;
     this.fechaInicial =this.util.dateToJson(new Date(cicloSelect.fecha_inicio));; 
     this.fechaFinal =this.util.dateToJson(new Date(cicloSelect.fecha_cierre));; 
    this.registrar = true;
    this.modo = 'EDIT';
  }
 
  selectedCiclo(cicloSelect: Ciclo) {
    this.ciclo = cicloSelect;
    
  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  eliminar() {
    this._cicloService.eliminar(this.ciclo);
    this.msg.msgInfo('SE ELIMINO EL Ciclo CORRECTAMENTE');
    this.limpiar();

  }
  async submit() {
    
    let valido = await this.validarCiclo();
    if (valido) {        
      if (this.modo == 'REG') {   
        await this._cicloService.registrar(this.ciclo);
        this.msg.msgSuccess('Guardado exitoso!')
      } else {
        this._cicloService.actualizar(this.ciclo);
        this.msg.msgSuccess("Ciclo se modificó exitosamente!");
      }
      // this.limpiar();
    }
  }
}
