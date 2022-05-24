import { Component, OnInit } from '@angular/core';
import { async } from '@angular/core/testing';
import { Especialidad } from 'app/models/especialidad';
import { Instructor } from 'app/models/instructor';
import { Notificacion } from 'app/models/notificacion';
import { Usuario } from 'app/models/usuario';
import { EspecialidadService } from 'app/services/especialidad.service';
import { InstructorService } from 'app/services/instructor.service';
import { NotificacionService } from 'app/services/notificacion.service';
import { UsuarioService } from 'app/services/usuario.service';
import { Messages } from 'app/utilidades/Messages';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
// import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs-compat/operator/debounceTime';
import { filter } from 'rxjs-compat/operator/filter';

@Component({
  selector: 'app-instructor',
  templateUrl: './instructor.component.html',
  styleUrls: ['./instructor.component.css']
})
export class InstructorComponent implements OnInit {
  public usuario = {} as Usuario;
  public instructor = {} as Instructor;

  public identificacion: number;
  public solicitud_enviada = false;
  public especialidades = [];
  // public especialidadesSelect = [];
  public especialidadesSolicitadas = [];
  Solicitadas = [];
  public especialidad = {} as Especialidad;
  public max_especialidades_defect = 2;

  public email;
  public login;
  public session;
  public url = "../assets/img/faces/logo.png";
  public urlfirma = "../assets/img/firma2.png";
  public fileselect: File;
  public fileselectFirma: File;
  private modo = 'REG';
  public id;

  constructor(
    // private _spinnerService: NgxSpinnerService,
    private util: TextTilUtil,
    private msg: Messages,
    public _usuarioService: UsuarioService,
    public _instructorService: InstructorService,
    public _notificacionService: NotificacionService,
    public _especialidadService: EspecialidadService) { }

  ngOnInit() {
    this.session = this._usuarioService.checkLogin();

    if (this.session) {
      this.usuario = this._usuarioService.getUsuarioSesion();
      // this._spinnerService.show();
      this.getusuarioPerfile();
    }
    this._especialidadService.especilidadWhere('estado', 'ACTIVO').subscribe(lista => {
      this.especialidades = lista;
    });
  }


  async getusuarioPerfile() {

    let usuIdentificacion: Usuario[] = await this._usuarioService.getUsuarioWhere("id", this.usuario.id);

    if (usuIdentificacion.length == 0) {
      this.msg.msgWarning('EL USUARIO NO ESTA REGISTRADO');
    } else {
      this.usuario = usuIdentificacion[0];
      this.instructor.usuario = this.usuario.id;
      this.instructor.nombre_usuario = this.usuario.nombre +" "+this.usuario.apellidos;
      this.identificacion = this.usuario.identificacion;
      this.instructor.foto_usuario = this.usuario.foto;
      this.login = this.usuario.login;
      this.email = this.usuario.email;
      if (this.usuario.foto == null) {
        this.usuario.foto = this.url;
      } else {
        this.url = this.usuario.foto;
      }
      let instructor: Instructor[] = await this._instructorService.getInstructorWhere("usuario", this.usuario.id);
      if (instructor.length == 0) {
        this.instructor.perfil = "";
        this.instructor.especialidades = [];
        this.solicitud_enviada = false;
        this.instructor.max_especialidades = this.max_especialidades_defect;
        // this.msg.msgWarning('No se ha enviado ninguna solicitud');
      } else {
        this.instructor = instructor[0];
        this.solicitud_enviada = true;
        this.urlfirma = this.instructor.firma
        this.max_especialidades_defect = this.instructor.max_especialidades;
        this.cargarEspecialidades();

      }
      // this._spinnerService.hide();
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
        estado: espe.estado,
        temporal: false,
      }
      this.especialidadesSolicitadas.push(especialidadTemp);
      // this.especialidadesSelect.push(especialidad);  
    });
  }

  cancelFile(event) {
    this.fileselect = null;
    this.url = "../assets/img/faces/logo.png";
    this.usuario.foto = this.url;
  }

  onFileSelected(event) {
    this.fileselect = <File>event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      if (this.validarImagen(event.target.files[0])) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.url = event.target.result;
          this.instructor.estado_foto = "ENVIADA";
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  cancelFileFirma(event) {
    this.fileselectFirma = null;
    this.urlfirma = "../assets/img/firma2.png";
    this.instructor.firma = this.urlfirma;
  }
  validarImagen(file: File): boolean {
    var valido = false
    if (file.type == 'image/png' || file.type == 'image/jpeg') {
      valido = true;
    } else {
      this.msg.msgDanger('Solo se aceptan imagnes JPEG,JPG ó PNG');
      return valido
    }
    console.log(file);
    if (file.size <= 1000000) {
      valido = true;
    } else {
      valido = false;
      this.msg.msgDanger('Se estan cargando ' + file.size/1000000 + 'MB recuerde que La Imagen debe pesar 1MB o menos ');

      return valido
    }

    return valido
  }

  onFileSelectedFirma(event) {
    this.fileselectFirma = <File>event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      if (this.validarImagen(event.target.files[0])) {
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.urlfirma = event.target.result;
          this.instructor.estado_firma = "ENVIADA";
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  async agregarEspecialidadSolicitudInstructor() {
    var pos = -1;
    var encontro = false;

    this.instructor.especialidades.forEach(async espe => {
      if (!encontro) {
        if (this.especialidad.id === espe.id) {
          encontro = true;
        }
        pos++;
      }
    });
    if (!encontro) { pos = -1 }
    if (this.instructor.especialidades.length >= this.max_especialidades_defect) {
      this.msg.msgWarning('Solo puede solicitar ' + this.max_especialidades_defect + ' especialidades');
    } else {

      console.log(pos);
      if (pos == -1) {
        // this.especialidadesSelect.push(this.especialidad)
        var especialidad = {
          id: this.especialidad.id,
          observacion: "",
          estado: "ENVIADA"
        }
        this.instructor.especialidades.push(especialidad);
        this.especialidad = {} as Especialidad;
      } else {
        this.msg.msgWarning('Especiliad ' + this.especialidad.nombre + ' ya esta en la lista de seleccion');

      }
    }
  }
  async agregarEspecialidadSolicitud() {
    var pos = -1;
    var encontro = false;

    this.especialidadesSolicitadas.forEach(async espe => {
      if (!encontro) {
        if (this.especialidad.id === espe.id) {
          encontro = true;
        }
        pos++;
      }
    });
    if (!encontro) { pos = -1 }
    if (this.especialidadesSolicitadas.length >= this.max_especialidades_defect) {
      this.msg.msgWarning('Solo puede solicitar ' + this.max_especialidades_defect + ' especialidades');
    } else {
      console.log(pos);
      if (pos == -1) {
        var especialidadTemp = {
          id: this.especialidad.id,
          nombre: this.especialidad.nombre,
          parche: this.especialidad.parche,
          observacion: "",
          estado: "ENVIADA",
          temporal: true
        }
        var especialidad = {
          id: this.especialidad.id,
          observacion: "",
          estado: "ENVIADA"
        }
        this.instructor.especialidades.push(especialidad);
        this.especialidadesSolicitadas.push(especialidadTemp);
        this.especialidad = {} as Especialidad;
      } else {
        this.msg.msgWarning('Especiliad ' + this.especialidad.nombre + ' ya esta en la lista de seleccion');

      }
    }

  }
  eliminarEspecialidad(especialidad: Especialidad) {
    console.log(especialidad);
    // var pos = this.especialidadesSelect.indexOf(especialidad);
    var pos_esp = this.especialidadesSolicitadas.indexOf(especialidad.id);
    // this.especialidadesSelect.splice(pos, 1);
    this.instructor.especialidades.splice(pos_esp, 1);

  }
  eliminarEspecialidadSolicitada(especialidad: any) {
    // console.log(especialidad);
    var pos_solicitada = -1;
    var pos = -1;
    var encontro = false;
    var instructor_encontro = false;
    this.especialidadesSolicitadas.forEach(async espe => {
      if (!encontro) {
        if (especialidad.id === espe.id) {
          encontro = true;
        }
        pos_solicitada++;
      }
    });
    if (encontro) {
      this.especialidadesSolicitadas.splice(pos_solicitada, 1);
      this.instructor.especialidades.splice(pos_solicitada, 1);
    }
    // this.instructor.especialidades.forEach(async espe => {
    //   if(!instructor_encontro) {
    //   if(especialidad.id===espe.id){
    //     enconinstructor_encontrotro = true;
    //   }
    //   pos++;
    // }   
    // });
    // if(instructor_encontro){
    //   this.especialidadesSolicitadas.splice(pos_solicitada,1);
    // }
  }

  // solicitarEspecialidad(espec_solicitud:any){  
  //   console.log(espec_solicitud);
  //   var especialidad = {
  //     id: espec_solicitud.id,
  //     observacion: "",
  //     estado: "ENVIADA"
  //   }   
  //   this.instructor.especialidades.push(especialidad);
  //   console.log(this.instructor);
  //   this.enviarSolicitudFirma();   
  // }

  validarInstructor(): boolean {
    let valido = true;
    if (this.fileselect == null && this.url == "../assets/img/faces/logo.png") {
      this.msg.msgWarning('INGRESE FOTO DE INSTRUCTOR');
      valido = false;
      return valido;
    }
    if (this.fileselectFirma == null && this.urlfirma == "../assets/img/firma2.png") {
      this.msg.msgWarning('INGRESE FIRMA DE INSTRUCTOR');
      valido = false;
      return valido;
    }
    if (this.instructor.perfil.trim() === "" || this.instructor.perfil === null || this.instructor.perfil === undefined) {
      this.msg.msgWarning('INGRESE PERFIL DEL INSTRUCTOR');
      valido = false;
      return valido;
    }

    if (this.instructor.especialidades.length <= 0) {
      this.msg.msgWarning('Seleccione  una especialidad');
      valido = false;
      return valido;
    }

    if (this.usuario.telefono === "" || this.usuario.telefono === null || this.usuario.telefono === undefined) {
      this.msg.msgWarning('INGRESE NUEMERO CELULAR');
      valido = false;
      return valido;
    }
    return valido;
  }

  async submit() {
    let valido = await this.validarInstructor();
    if (valido) {
      console.log(this.instructor);
      if (this.modo == 'REG') {
        // this._spinnerService.show();
        await this._instructorService.registrarUsuarioFirma(this.usuario, this.instructor, this.fileselectFirma, this.fileselect);
        let notificacionstring = await this.cargarNotificacion(this.instructor, this.usuario, "instructor");
        // this._spinnerService.hide();
        this.msg.msgSuccess('Solicitud Enviada Con Exito!');
        await this._notificacionService.cerarNotificacionMasiva(this.usuario, "Solicitud Instructor de " + this.usuario.nombre + " " + this.usuario.apellidos, notificacionstring.toString(), "ADMINISTRADOR", "/validar-solicitud", this.instructor.id);
        this.getusuarioPerfile();
      }


    }

  }

  async enviarSolicitudFirma() {
    this.modo = 'MODIF';
    let valido = await this.validarInstructor();
    if (valido) {
      // this._spinnerService.show();
      this.instructor.estado = "PENDIENTE"
      this.instructor.estado_solicitud = "PENDIENTE"
      await this._instructorService.actualizarUsuarioFirma(this.usuario, this.instructor, this.fileselectFirma, this.fileselect);
      let notificacion = await this.cargarNotificacion(this.instructor, this.usuario, "especialidad");
      this.msg.msgSuccess("Solicitud Modificada Con Exito!");
      // this._spinnerService.hide();
      await this._notificacionService.cerarNotificacionMasiva(this.usuario, "Solicitud especialidad de " + this.usuario.nombre + " " + this.usuario.apellidos, notificacion, "ADMINISTRADOR", "/validar-solicitud", this.instructor.id);
      this.getusuarioPerfile();
    }
  }

  async cargarNotificacion(instructor: Instructor, usuario: Usuario, tipo: string) {
    var msg: string;
    msg = "";
    var cont = 0;
    var especialidades = "";
    await this.especialidadesSolicitadas.forEach(async espe => {
      if (espe.estado === "ENVIADA") {
        cont++;
        if (especialidades.length > 0) {
          especialidades = await especialidades + "," + espe.nombre
        } else {
          especialidades = await espe.nombre
        }
      }

    });

    msg = " " + usuario.nombre + " " + usuario.apellidos + " ha realizado una solicitud  para " + tipo + " ";
    if (cont == 1) {
      msg= msg + "con la especalidad de " + especialidades + " ";
    } else {
      msg=msg + "con " + instructor.especialidades.length + " especalidades  ";
    }
    return msg
  }

}


