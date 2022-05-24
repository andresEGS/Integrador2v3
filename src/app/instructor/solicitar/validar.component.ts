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
import { InstructorService } from 'app/services/instructor.service';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from 'app/services/usuario.service';
import { Instructor } from 'app/models/instructor';
import { NotificacionService } from 'app/services/notificacion.service';
import { ActivatedRoute } from '@angular/router';
import { Rol } from 'app/models/rol';


@Component({
  selector: 'app-validarSolicitud',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css']
})
export class ValidarSolicitudComponent implements OnInit {
  public findParam = 'PENDIENTE';
  public findValue = '';
  public siguiente = "";
  public pagina = 0;
  public paginador = true;
  public adelante = true;
  public pagesize = 4;
  public nextpage = "";
  public anterior = [];
  public nombre;
  public usuario = {} as Usuario;
  public instructor = {} as Instructor;
  public especialidad = {} as Especialidad;
  public especialidadesSolicitadas = [];
  public instructores: any[]
  private resultado = false;
  private registrar = false;
  public frame: ElementRef;
  public base64;
  private id;

  constructor(
    private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    private route: ActivatedRoute,
    private msg: Messages,
    private _instructorService: InstructorService,
    private _notificacionService: NotificacionService,
    private _usuarioService: UsuarioService,
    private _rolService:RolService,
    public _especialidadService: EspecialidadService) { }

   ngOnInit() {
    this.usuario = this._usuarioService.getUsuarioSesion();
    this.listarFiltro("estado", "PENDIENTE");
    this.limpiar();
    
  
    this.mostrarNotificaion();
  
  }






  async listarFiltro(tiposearch: string, valorfind: any) {
    let lista = await this._instructorService.listarFiltro(this.pagesize, this.nextpage, this.adelante, tiposearch, valorfind);
    lista.subscribe(async instructores => {
      this.instructores = await instructores;
      // this.instructores.forEach(async instructor => {
      //   let buscar: Usuario[] = await this._usuarioService.getUsuarioWhere("id", instructor.usuario);
      //   let usuario = buscar[0];
      //   instructor.nombre_usuario = usuario.nombre;
      //   instructor.foto_usuario = usuario.foto;
      // });
      if (instructores.length == 0) {
        this.resultado = true;
      } else {
        this.resultado = false
        this.siguiente = this.instructores[instructores.length - 1].id;
      }
    });

  }
  async listarsiguiente(siguiente: boolean) {
    this.adelante = siguiente;
    if (siguiente) {
      this.nextpage = this.siguiente;

      this.pagina = this.pagina + 1;
      let valorvector = this.instructores[0].id;
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
      this.listarFiltro("estado", this.findParam);
      this.paginador = true;
    } else {
      this.paginador = false;
      this.pagina = 0;
      this.anterior = [];
      this.nextpage = "";
      this.adelante = true;
      switch (this.findParam) {
        case 'PENDIENTE':
          this.listarFiltro("estado", "PENDIENTE");
          break;
        case 'APROBADO':
          this.listarFiltro("estado", "APROBADO");
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
    this.nombre = "";
    if(this.instructor.id != undefined){
    let instructor: Instructor[] = await this._instructorService.getInstructorWhere("id", this.instructor.id);
    this.mostrar(instructor[0]);
    }
    this.util.toDataURL(this.usuario.foto, function (dataUrl) {
      console.log(dataUrl)
    })
    await this.util.getBase64ImageFromUrl(this.usuario.foto).then(result => this.base64 = result).catch(err => console.error(err));
    console.log(this.base64);
    this.util.getFileOfBase64(this.base64,this.usuario.apellidos+".png","png");
  }
  async mostrarNotificaion(){
   
    this.route.queryParams.filter( params => params.id).subscribe( async params => {
      this.id = params.id;
      if(this.id){
        let instructor : Instructor[] = await this._instructorService.getInstructorWhere("id", this.id);
        this.mostrar(instructor[0]);
      }
    }
  );
  }

  contarespecialidades(siguiente: boolean) {
    let cont = this.instructor.max_especialidades;
    if (siguiente) {
      this.instructor.max_especialidades = cont + 1;

    } else {
      this.instructor.max_especialidades = cont - 1;

    }
  }

  mostrar(instructorselect: Instructor) {
    this.instructor = instructorselect;
    console.log(this.instructor);
    this.getusuarioPerfile(instructorselect);
    this.registrar = true;
  }
  async getusuarioPerfile(instructor: Instructor) {
  

    let usuIdentificacion: Usuario[] = await this._usuarioService.getUsuarioWhere("id", instructor.usuario);
    

    if (usuIdentificacion.length == 0) {
      this.msg.msgWarning('EL USUARIO NO ESTA REGISTRADO');
    } else {
      let usuario = usuIdentificacion[0];
      this.instructor.foto_usuario = usuario.foto;
      this.instructor.telefono = usuario.telefono;
      this.instructor.nombre_usuario = usuario.nombre + " " + usuario.apellidos;

      this.cargarEspecialidades();
      this._spinnerService.hide();
    }
  }

  cargarEspecialidades() {
    this.especialidadesSolicitadas = [];
    this.instructor.especialidades.forEach(async espe => {
      let buscar: Especialidad[] = await this._especialidadService.getEspecialidadWhere("id", espe.id);
      let especialidad = buscar[0];
      var especialidadTemp = {
        id: espe.id,
        nombre: especialidad.nombre,
        parche: especialidad.parche,
        observacion: espe.observacion,
        estado: espe.estado
      }
      this.especialidadesSolicitadas.push(especialidadTemp);
    });
  }

  aprobarFoto(aprobar: boolean) {
    if (aprobar)
      this.instructor.estado_foto = "APROBADA";
    else
      this.instructor.estado_foto = "RECHAZADA";
  }

  aprobarFirma(aprobar: boolean) {
    if (aprobar)
      this.instructor.estado_firma = "APROBADA";
    else
      this.instructor.estado_firma = "RECHAZADA";
  }

  aprobarEspecialidad(especialidad: any, aprobar: boolean) {
    if (aprobar) {
      especialidad.estado = "APROBADA";
    } else {
      especialidad.estado = "RECHAZADA";
    }
    // console.log(this.instructor);
  }


  modoRegistro(modo: boolean) {
    this.registrar = modo;    
  }

  eliminar() {
    this._especialidadService.eliminar(this.especialidad);
    this.msg.msgInfo('SE ELIMINO EL USUARIO CORRECTAMENTE');
    this.limpiar();

  }
  async validarinstructor() {
    let valido = true;
  if(this.instructor.estado_firma=="APROBADA" && this.instructor.estado_foto=="APROBADA"){
    this.instructor.estado="APROBADO";
    this.instructor.estado_solicitud="APROBADA";
 
  }else{
    this.instructor.estado="PENDIENTE";
    this.instructor.estado_solicitud="PENDIENTE";
  }
  
    this.instructor.especialidades = [];
   var encontro=false;
   await this.especialidadesSolicitadas.forEach(async espe => { var especialidadTemp = {
        id: espe.id,
        observacion: espe.observacion,
        estado: espe.estado
      }
      if(especialidadTemp.estado != "APROBADA"){
         encontro= await true;
      }
      this.instructor.especialidades.push(especialidadTemp);
    });
    console.log(encontro);
    if(encontro){
      this.instructor.estado="PENDIENTE";
      this.instructor.estado_solicitud="PENDIENTE";
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarinstructor();
    if (valido) {
      this._spinnerService.show();
      console.log(this.instructor);

      await this._instructorService.actualizar(this.instructor);
      let buscar: Usuario[] = await this._usuarioService.getUsuarioWhere("id", this.instructor.usuario);
      let usuarioDestino = buscar[0];
      let rolaweit: Rol[] = await this._rolService.getRolWhere("nombre", "INSTRUCTOR");
      let rolInstructor = {} as Rol;
      rolInstructor = rolaweit[0];
      let encontro=false;
      encontro= usuarioDestino.roles.some( rol => { console.log(rol.id +" == "+ rolInstructor.id);
          return  rol.id == rolInstructor.id;          
      });    
      if(!encontro){
        usuarioDestino.roles.push(rolInstructor);
      }
      if(this.instructor.estado=="APROBADO"){
        this._usuarioService.actualizar(usuarioDestino);
        await this._notificacionService.cerarNotificacioDirecta(this.usuario,"Solicitud Verificada por:"+this.usuario.nombre +" "+this.usuario.apellidos,"Felicitaciones yá se le asignó el rol de Instructor",usuarioDestino,"/solicitud-instructor","");
      }else{
      let notificacion=await  this.cargarNotificacion(this.instructor,this.usuario,"especialidad");
      await this._notificacionService.cerarNotificacioDirecta(this.usuario,"Solicitud Verificada por:"+this.usuario.nombre +" "+this.usuario.apellidos,notificacion,usuarioDestino,"/solicitud-instructor","");
    }
      this.limpiar();
      this._spinnerService.hide();
      this.msg.msgSuccess('Guardado Exitoso!');

    }
  }

  async cargarNotificacion(instructor : Instructor,usuario :Usuario,tipo:string){
    var msg :string ;
    msg="";
    msg =this.usuario.nombre+" "+this.usuario.apellidos+" ha realizado una respuesta a la solicitud tu solicitud";
   return msg
  }

  async changeestado() {
    this._spinnerService.show();
    if (this.especialidad.estado == "ACTIVO") {
      this.especialidad.estado = "INACTIVO";
    } else {
      this.especialidad.estado = "ACTIVO";
    }
    await this._instructorService.actualizar(this.especialidad);
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
