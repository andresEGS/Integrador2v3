import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Pregunta } from 'app/models/pregunta';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArchivoService } from 'app/services/archivo.service';
import { PreguntaService } from 'app/services/pregunta.service';
import { TemaService } from 'app/services/tema.service';


import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Tema } from 'app/models/tema';
import { FormControl } from '@angular/forms';
import { Respuesta } from 'app/models/respuesta';



@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.component.html',
  styleUrls: ['./preguntas.component.css']
})
export class PreguntasComponent implements OnInit {
  public findParam = 'NOMBRE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 5;
  public nextpage = "";
  public anterior = [];
  public fontStyleControl = new FormControl();
  public nombre;
  public fileselect: File;
  public url = "../assets/img/pregunta.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public pregunta = {} as Pregunta;
  public temaSelect = {} as Tema;
  public preguntaSelect = {} as Pregunta;
  public preguntas: any[];
  public respuestas: any[];
  public respuestasLetras= ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"];
  public respuestasFV: any[];
  public temas: any[]
  private modo = 'REG';
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  @ViewChild('nombrePregunta', { static: false }) nombre_pregunta: ElementRef;
  @ViewChild('dificultadPregunta', { static: false }) dificultad_pregunta: ElementRef;
  @ViewChild('TipoPregunta', { static: false }) tipo_pregunta: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: PreguntasComponent;
  constructor(
    private _sanitizer: DomSanitizer,
    private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    public _temaService: TemaService,
    private msg: Messages,
    public _preguntaService: PreguntaService) { }

  ngOnInit() {
    // this.nombre_pregunta.nativeElement.focus();
    this.limpiar();
    this.listarFiltro("nombre", "");
  }


  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };


  borrarRespuesta(respuesta:Respuesta){
    console.log(respuesta);
    // var pos = this.especialidadesSelect.indexOf(especialidad);
    var pos_esp = this.respuestas.indexOf(respuesta);
    // this.especialidadesSelect.splice(pos, 1);
    this.respuestas.splice(pos_esp, 1);
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
        console.log(this.temas);

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
          this.listarFiltro("nombre", this.findValue.toUpperCase());
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

  agregarRespuesta(tipo: boolean) {
    if (tipo) {
      console.log(tipo);
      var respuesta = {} as Respuesta;
      respuesta.id = this.respuestas.length + 1 + "";
      respuesta.letra =this.respuestasLetras[this.respuestas.length];
      respuesta.nombre = "";
      respuesta.correcta = false;
      respuesta.isImagen = false;
      respuesta.imagen = "";
      this.respuestas.push(respuesta);
    }

  }
  iniciarRespuestas() {
    this.respuestasFV = [];
    var respuestaf = {} as Respuesta;
    respuestaf.id = this.respuestasFV.length + 1 + "";
    respuestaf.nombre = "FALSO";
    respuestaf.correcta = false;
    respuestaf.isImagen = false;
    respuestaf.imagen = "";
    this.respuestasFV.push(respuestaf);
    var respuestav = {} as Respuesta;
    respuestav.id = this.respuestas.length + 2 + "";
    respuestav.nombre = "VERDADERO";
    respuestav.correcta = false;
    respuestav.isImagen = false;
    respuestav.imagen = "";
    this.respuestasFV.push(respuestav);
  }

  async limpiar() {
    // this.temaSelect = {} as Tema;
    this.pregunta = {} as Pregunta;
    this.preguntaSelect = {} as Pregunta;
    this.modo = 'REG';
    this.respuestas = [];
    this.iniciarRespuestas();
    this.nombre = "";
    this.fileselect = null;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/pregunta.png";
  }




  onOpened(event: any) {
    this.frame = event;
  }

  async mostrar(preguntaSelect: Pregunta) {    
    this.modoRegistro(true);
    console.log(preguntaSelect)
    this.pregunta = preguntaSelect;
    this.nombre = this.pregunta.nombre;
    this.respuestas= this.pregunta.respuestas;
 
    this.modo = 'EDIT';
  }


  selected(select: Pregunta) {
    this.pregunta = select;

  }
  modoRegistro(modo: boolean) {
    this.registrar = modo;
    this.limpiar();
  }

  seletTema(temaselect: Tema) {
    this.modoRegistro(true);
    this.temaSelect = temaselect;
  }

  async mostrarPreguntas(temaselect: Tema) {
    this.temaSelect = temaselect;
    let lista = this._preguntaService.getWhere("tema", temaselect.id);

    (await lista).subscribe(preguintas => {
      this.preguntas = preguintas;
      if (preguintas.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false
        this.siguiente = this.temas[preguintas.length - 1].id;
        console.log(this.temas);

      }
    })
  }


  eliminar() {
    this._preguntaService.eliminar(this.pregunta);
    this.msg.msgInfo('SE ELIMINÓ EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  public async validarPregunta() {

    let valido = true;

    if (this.util.isStringVacio(this.temaSelect.id)) {

      this.msg.msgWarningmodal('SELECIONE UN TEMA VALIDO', false);
      valido = false;

      return valido;
    } else {
      this.pregunta.tema = this.temaSelect.id;
      this.pregunta.tema_nombre = this.temaSelect.nombre;
    }
    if (this.util.isStringVacio(this.pregunta.nombre)) {

      this.msg.msgWarningmodal('INGRESE DESCRIPCION EN LA PREGUNTA', false);
      valido = false;
      this.nombre_pregunta.nativeElement.focus();

      return valido;
    }
    if (this.util.isStringVacio(this.pregunta.dificultad)) {
      this.msg.msgWarningmodal('INGRESE LA DIFICULTAD', false);
      valido = false;
      this.dificultad_pregunta.nativeElement.focus();
      return valido;
    }
    if (this.util.isStringVacio(this.pregunta.tipo)) {
      this.msg.msgWarningmodal('INGRESE TIPO DE PREGUNTA', false);
      valido = false;
      return valido;
    } else {
      if (this.pregunta.tipo === 'UNI' || this.pregunta.tipo === 'SEL') {
        if (this.respuestas.length <= 0) {
          this.msg.msgWarningmodal('INGRESE ALMENOS UNA RESPUESTA', false);
          valido = false;
          return valido;
        } else {
          var cont_resp_correct = 0
          var cont_resp_Incorrect = 0
          console.log(this.respuestas)
          for (var i = 0; i < this.respuestas.length; i++) {
            if (this.respuestas[i].correcta) {
              cont_resp_correct++;
            } else {
              cont_resp_Incorrect++;
            }
          }
          if (cont_resp_correct == 0) {
            this.msg.msgWarningmodal('SELECCIONE SOLO ALMENOS RESPUESTA CORRECTA', false);
            valido = false;
            return valido;
          }
          if (this.pregunta.tipo === 'UNI') {
            if (cont_resp_correct > 1) {
              this.msg.msgWarningmodal('SELECCIONE SOLO UNA RESPUESTA CORRECTA', false);
              valido = false;
              return valido;
            }
          }
        }
        this.pregunta.respuestas = this.respuestas;
      } else {
        var cont_resp = 0
        console.log(this.respuestasFV)
        for (var i = 0; i < this.respuestasFV.length; i++) {
          if (this.respuestasFV[i].correcta) {
            cont_resp++;
          }
        }
        if (cont_resp > 1) {
          this.msg.msgWarningmodal('SELECCIONE SOLO UNA RESPUESTA CORRECTA', false);
          valido = false;
          return valido;
        }
        if (cont_resp == 0) {
          this.msg.msgWarningmodal('SELECCIONE UNA RESPUESTA CORRECTA', false);
          valido = false;
          return valido;
        }
        this.pregunta.respuestas = this.respuestasFV;

      }
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarPregunta();
    if (valido) {
      
      
        this._spinnerService.show();
        if (this.modo == 'REG') {
          let valido2 = await this.validarNombre();
          if (valido2) {
          await this._preguntaService.registrar(this.pregunta);
          console.log(this.pregunta)
          this.limpiar();
          this._spinnerService.hide();
          this.msg.msgSuccess('¡Guardado exitoso!');
          }
        } else {
          await this._preguntaService.actualizar(this.pregunta)
          this._spinnerService.hide();
          this.msg.msgSuccess("¡Pregunta se modifió exitosamente!");
        }
      }

    
  }

  async changeestado() {
    this._spinnerService.show();

    await this._preguntaService.actualizar(this.pregunta);
    this._spinnerService.hide();
    this.msg.msgSuccess("¡Pregunta se modifió exitosamente!");
  }

  async validarNombre() {
    let valido = true;
    let usuIdentificacion: Pregunta[] = await this._preguntaService.getWhereAsync("nombre", this.pregunta.nombre);
    if (usuIdentificacion.length > 0) {
      this.msg.msgDanger("Pregunta ya exite con el nombre " + this.pregunta.nombre);
      return valido = false;
    }

    return valido
  }
}
