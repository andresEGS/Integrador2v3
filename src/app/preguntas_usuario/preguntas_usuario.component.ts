import { Component, OnInit, ElementRef, ViewChild, Self } from '@angular/core';
import { Tema } from 'app/models/tema';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { NgxSpinnerService } from 'ngx-spinner';
import { ArchivoService } from 'app/services/archivo.service';
import { TemaService } from 'app/services/tema.service';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PreguntaService } from 'app/services/pregunta.service';
import { Pregunta } from 'app/models/pregunta';
import { Respuesta } from 'app/models/respuesta';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from 'app/services/usuario.service';
import { SESSION } from 'app/services/session';
import { CategoriaService } from 'app/services/categoria.service';
import { Categoria } from 'app/models/categoria';
import { iterator } from 'rxjs/internal-compatibility';


@Component({
  selector: 'app-preguntas-usuario',
  templateUrl: './preguntas_usuario.component.html',
  styleUrls: ['./preguntas_usuario.component.css']
})
export class PreguntasUsuarioComponent implements OnInit {
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
  public dificultad = "";
  public url = "../assets/img/tema.png";
  public urlcertificado = "../assets/img/certificado.jpg";
  public fileselectCertificado: File;
  public tema = {} as Tema;
  public preguntaSelect = {} as Pregunta;
  public respuestaSelect = {} as Respuesta;
  public temas: any[];
  public preguntas: any[] = [];
  public num_pregunta_correctas = 0;
  public num_pregunta_erradas = 0;
  public num_pregunta = 0;
  public num_pregunta_max = 0;
  public puntos = 0;
  private modo = 'REG';
  private resultado = false;
  public usuario_session = {} as Usuario;
  public id_usuario;
  public session;
  private quiz = false;
  private panel_dificultad = true;
  public msg_resultado = "";
  public frame: ElementRef;
  @ViewChild('nombreTema', { static: false }) nombre_tema: ElementRef;
  @ViewChild('contenidoTema', { static: false }) contenido_tema: ElementRef;
  @ViewChild('puntosTema', { static: false }) puntos_tema: ElementRef;
  @ViewChild('frame', { static: true }) basicModal: PreguntasUsuarioComponent;

  constructor(
    public _usuarioService: UsuarioService,
    private util: TextTilUtil,
    public _categoriaService: CategoriaService,
    private msg: Messages,
    public _temaService: TemaService,
    public _preguntaService: PreguntaService) { }



  ngOnInit() {
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario_session = this._usuarioService.getUsuarioSesion();
      this.id_usuario = this.usuario_session.id;
      this.cargarsession();


    }

  }
  async cargarsession() {
    this._usuarioService.setUsuarioSesion(this.usuario_session);
  }


  isMobileMenu() {
    if ($(window).width() > 991) {
      return false;
    }
    return true;
  };






  async listarPreguntas() {
    let listapreguntas = this._preguntaService.listarFiltro(this.num_pregunta_max, this.nextpage, this.adelante, "", "");
    (await listapreguntas).subscribe(preuntaslista => {
      this.preguntas = preuntaslista;
      this.preguntaSelect = preuntaslista[this.num_pregunta];
    })
  }




  async listarTemas() {
    let lista_temas: Tema[] = await this._temaService.getListaPuntosAsync(this.usuario_session.puntos);
    let cont=0;
    lista_temas.forEach(async tema => { 
      
      // let opr = "=="
      // switch (this.dificultad) {
      //   case "FACIL":
      //     opr = '==';
      //     break;
      //   case "MEDIO":
      //     opr = '<=';
      //     break;
      //   default:
      //     opr = '>=';
      //     break;
      // }
      let lista_preguntas: Pregunta[] = await this._preguntaService.getListaTemaDificultadAsync(tema.id, '==', this.dificultad);
      await cont++;
      await lista_preguntas.forEach(async pregunt => {
        await this.preguntas.push(pregunt)
        
      })
      console.log(this.preguntas.length);
      if(lista_temas.length == cont){
      if(this.num_pregunta_max>this.preguntas.length){
        this.num_pregunta_max=this.preguntas.length;        
      }
      let valor = Math.random() * (this.preguntas.length - 0) + 0;  
      let index =Math.round(valor)
        console.log(index);
        this.preguntaSelect = await this.preguntas[index];
    }
    });
    
  }





  changeParam(estado: string) {
    this.findParam = estado;
  }

  async limpiar() {
    this.tema = {} as Tema;
    this.modo = 'REG';
    this.nombre = "";
    this.puntos = 0;
    this.num_pregunta = 0;
    this.num_pregunta_correctas = 0;
    this.num_pregunta_erradas = 0;
    this.fileselectCertificado = null;
    this.urlcertificado = "../assets/img/certificado.jpg";
    this.url = "../assets/img/tema.png";
  }


  selectDificultad(dificultad: string) {
    this.dificultad = dificultad;
    if (this.dificultad === 'FACIL') {
      this.num_pregunta_max = 5;
    } else if (this.dificultad === 'MEDIO') {
      this.num_pregunta_max = 10;
    } else {
      this.num_pregunta_max = 20;
    }
  }

  siguientePregunta() {
    this.num_pregunta++;

    var valor_por_medo = 0;

    if (this.respuestaSelect.correcta) {
      this.num_pregunta_correctas = this.num_pregunta_correctas + 1;
      if (this.dificultad === 'FACIL') {
        valor_por_medo = 50;
      } else if (this.dificultad === 'MEDIO') {
        valor_por_medo = 100;
      } else {
        valor_por_medo = 200;
      }
      if (this.preguntaSelect.dificultad === 'FACIL') {
        valor_por_medo = valor_por_medo + 100;
      } else if (this.preguntaSelect.dificultad === 'MEDIO') {
        valor_por_medo = valor_por_medo + 200;
      } else {
        valor_por_medo = valor_por_medo + 500;
      }

    } else {
      this.num_pregunta_erradas = this.num_pregunta_erradas + 1;
    }
    this.puntos = this.puntos + valor_por_medo;
    this.msg.msgRespuesta(this.respuestaSelect.correcta, 'SE OPTUVIERON  ' + valor_por_medo + ' PUNTOS');

    if (this.num_pregunta + 1 > this.num_pregunta_max) {
      this.mostrarResultado(true);
    }
    this.preguntaSelect = this.preguntas[this.num_pregunta];

  }
  async mostrarResultado(mostrar: boolean) {
    this.resultado = mostrar;
    this.quiz = !mostrar;
    this.panel_dificultad = !mostrar;
    let resutado_valor = (((this.num_pregunta_correctas) / (this.num_pregunta_max)) * 100)
    if (resutado_valor <= 49) {
      this.msg_resultado = "¡ SABEMOS QUE PUEDES HACERLO MEJOR!";
    } else if (resutado_valor > 49 && resutado_valor <= 70) {
      this.msg_resultado = "¡ NO ESTA NADA MAL!"
    } else {
      this.msg_resultado = "¡ EXCELENTE APRENDES RAPIDO!"
    }
    let usuario: Usuario[] = await this._usuarioService.getUsuarioWhere('id', this.id_usuario);
    if (usuario.length > 0) {
      usuario[0].puntos = usuario[0].puntos + this.puntos;
      let categoriaSearch: Categoria = await this.cargarCategoria(usuario[0].categoria);
      if (usuario[0].puntos > categoriaSearch.puntos_max) {
        if (categoriaSearch.nivel < 5) {
          let categoriaSiguiente: Categoria = await this.cargarCategoriaSiguiente(categoriaSearch.nivel);
          usuario[0].categoria = categoriaSiguiente.id;
          this.msg.msgSubirrango("SUBUSTE A RANGO " + categoriaSiguiente.nombre, categoriaSiguiente.nivel);
        }
      }
      this._usuarioService.actualizar(usuario[0]);
    }
  }

  async cargarCategoria(id_cate: string) {
    let categoriausuario = await this._categoriaService.getWhereAsync('id', id_cate);
    if (categoriausuario.length > 0) {
      return categoriausuario[0];
    } else {
      return undefined;
    }
  }

  async cargarCategoriaSiguiente(nivel: number) {
    let categoriausuario = await this._categoriaService.getWhereAsync('nivel', nivel + 1);
    if (categoriausuario.length > 0) {
      return categoriausuario[0];
    } else {
      return undefined;
    }
  }

  selectRespuesta(respuesta: Respuesta) {
    this.respuestaSelect = respuesta;
  }

  mostrar(temaSelect: Tema) {
    this.tema = temaSelect;
    this.nombre = this.tema.nombre;
    console.log(this.tema);
    this.fileselectCertificado = null;
    this.quiz = true;
    this.modo = 'EDIT';
  }

  selected(espeSelect: Tema) {
    this.tema = espeSelect;

  }
  async modoQuiz(modo: boolean) {
    this.quiz = modo;
    this.panel_dificultad = !modo;
    this.limpiar();
    await this.listarTemas();

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


}
