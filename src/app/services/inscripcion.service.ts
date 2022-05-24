import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Inscripcion } from '../models/inscripcion';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tipo_archivo } from './tipo_archivo';
import { ArchivoService } from './archivo.service';
import { Clase } from 'app/models/clase';
import { Usuario } from 'app/models/usuario';
import { Instructor } from 'app/models/instructor';
import { NotificacionService } from './notificacion.service';
import { ESTADO_CLASE, ESTADO_INSCRIPCION } from './estados';
import { UsuarioService } from './usuario.service';
import { InstructorService } from './instructor.service';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  inscripcionCollection: AngularFirestoreCollection<Inscripcion>;
  inscripcionCollectionGrupo: AngularFirestoreCollectionGroup<Inscripcion>;
  inscripcionList: Observable<Inscripcion[]>;
  inscripcionDoc: AngularFirestoreDocument<Inscripcion>;
  inscripcionSesion = [] as Inscripcion;
  rolSesion = [] as Rol;
  rolChange = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private util: TextTilUtil,
    public _notificacionService: NotificacionService,
    public _usuarioService: UsuarioService,
    public _instructorService: InstructorService,
    public dbfairebase: AngularFirestore,
    public dba: AngularFireDatabase,
    private http: HttpClient) {

  }

  listarFiltro(pageSize: number, nextpage: string, adelante: boolean, tipoSearch: string, ValorSearch: any) {
    console.log("nombre :" + ValorSearch, "ultimo :" + nextpage, "adelante :" + adelante);
    let valorVacio = true;
    if (isNaN(ValorSearch)) {
      valorVacio = this.util.isStringVacio(ValorSearch);
    } else {
      valorVacio = this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('anio').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('anio').startAfter(nextpage).limit(pageSize));
        } else {
          this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('anio').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('anio').orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff').limit(pageSize));

      }
    }

    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }

  listar() {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('fecha_create'));
    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }

  async listarAsync() {
    let resp: Inscripcion[] = await new Promise(resolve => {
      this.listar().subscribe(inscripcions => {
        resolve(inscripcions);
      },
        error => {
          return error
        });
    });
    return resp;
  }


  listarNombreSiguiente(nombre, nombreindicador: string, adelante: boolean) {
    console.log("nombre :" + nombre, "indicador :" + nombreindicador, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(nombreindicador)) {
      this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('id').startAfter(nombreindicador).limit(4));
        } else {
          this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('id').startAt(nombreindicador).limit(4));
        }
      } else {
        this.inscripcionCollection = this.dbfairebase.collection('Inscripciones', ref => ref.orderBy('grupo').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));
      }
    }

    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }

  getinscripcionnombre() {
    var citiesRef = this.dbfairebase.collection('Inscripciones');
    this.dba.database.ref('/inscripcions').once('value');
  }


  async registrar(clase: Clase, usuario: Usuario) {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones');
    let inscripcion = {} as Inscripcion;
    inscripcion.especialidad = clase.especialidad;
    inscripcion.especialidad_imagen = clase.especialidad_imagen;
    inscripcion.especialidad_nombre = clase.especialidad_nombre;
    inscripcion.instructor = clase.instructor;
    inscripcion.instructor_foto = clase.instructor_foto;
    inscripcion.instructor_nombre = clase.instructor_nombre;
    inscripcion.clase = clase.id;
    inscripcion.usuario = usuario.id;
    inscripcion.usuario_foto = usuario.foto;
    inscripcion.usuario_nombre = usuario.nombre + " " + usuario.apellidos;
    inscripcion.estado = "PENDIENTE";
    inscripcion.clase_estado = clase.estado;
    inscripcion.fecha_create = new Date().getTime();
    inscripcion.url_classroom_alumno= await clase.url_classroom_alumno;
    let buscar: Inscripcion[] = await this.getInscripcion(inscripcion);
    if (buscar.length == 0) {
      this.inscripcionCollection.add(inscripcion);
      let resp: Inscripcion[] = await this.getInscripcion(inscripcion);
      if (resp.length > 0) {
        this.actualizar(resp[0]);
      }
    } else {
      this.actualizar(buscar[0]);
    }
  }

  actualizar(inscripcion: Inscripcion) {
    this.inscripcionDoc = this.dbfairebase.doc('Inscripciones/' + inscripcion.id + "");
    inscripcion.fecha_update = new Date().getTime();
    this.inscripcionDoc.update(inscripcion);
    
  }

  async actualizarporCLase(clase: Clase) {
    console.log(clase);
    await clase.alumnos.forEach(async alumno => {
      let inscripcion = {} as Inscripcion;
      inscripcion.clase = await clase.id;
      inscripcion.usuario = await alumno.id_alumno;
      let inscripciones: Inscripcion[] = await this.getInscripcion(inscripcion);

      if (alumno.estado == ESTADO_INSCRIPCION.pendiente && clase.estado == ESTADO_CLASE.cursando) {
        inscripciones[0].estado = ESTADO_INSCRIPCION.rechazado;
      } else {
        inscripciones[0].estado = await alumno.estado;
      }
      inscripciones[0].clase_estado = await clase.estado;
      inscripciones[0].url_classroom_alumno= await clase.url_classroom_alumno;
      await this.actualizar(inscripciones[0]);     
      this.notificarClaseInscripncion(clase,inscripciones[0]);
    });


  }
  async notificarClaseInscripncion(clase: Clase,inscripcion :Inscripcion){
    let instructor: Instructor[]  = await this._instructorService.getInstructorWhere('id', inscripcion.instructor); 
      let buscar: Usuario[] = await this._usuarioService.getUsuarioWhere("id",instructor[0].usuario);
      let usuarioRemite = buscar[0];
      let buscar2: Usuario[] = await this._usuarioService.getUsuarioWhere("id", inscripcion.usuario);
      let usuarioDestino = buscar2[0];
      
       
      // Enviar notificacion cuando se le cambie el estado a los estudaintes aceptados
      if (clase.estado == ESTADO_CLASE.activa && inscripcion.estado == ESTADO_INSCRIPCION.aceptado ) {
        await this._notificacionService.cerarNotificacioDirecta(usuarioRemite, "No muestra por ahora", "Se le ha cambiado su estado a: " + inscripcion.estado + " en la especialidad de " + inscripcion.especialidad_nombre, usuarioDestino, "/mis-especialidades", inscripcion.id);
      }
      // Enviar notificacion cuando inicie la clase a los estudantes rechazados    
      if (clase.estado == ESTADO_CLASE.cursando && inscripcion.estado == ESTADO_INSCRIPCION.rechazado ) {
        await this._notificacionService.cerarNotificacioDirecta(usuarioRemite, "No muestra por ahora", "Se le ha cambiado su estado a: " + inscripcion.estado + " en la especialidad de " + inscripcion.especialidad_nombre, usuarioDestino, "/mis-especialidades", inscripcion.id);
      }
      // Enviar notificacion cuando inicie la clase a los estudantes aceptados
      if (clase.estado == ESTADO_CLASE.cursando && inscripcion.estado==ESTADO_INSCRIPCION.aceptado) {
        await this._notificacionService.cerarNotificacioDirecta(usuarioRemite, "No muestra por ahora", "Ha iniciado la clase de la especialidad de " + inscripcion.especialidad_nombre, usuarioDestino, "/mis-especialidades", inscripcion.id);
      }
      // Enviar notificacion cuando finalize la clase a los estudantes     
      if (clase.estado == ESTADO_CLASE.finalizada && inscripcion.estado != ESTADO_INSCRIPCION.rechazado ) {
        await this._notificacionService.cerarNotificacioDirecta(usuarioRemite, "No muestra por ahora", "Ha Finalizado la clase de la especialidad de " + inscripcion.especialidad_nombre, usuarioDestino, "/mis-especialidades", inscripcion.id);
      }
  }




  eliminar(inscripcion: Inscripcion) {
    this.inscripcionDoc = this.dbfairebase.doc('Inscripciones/' + inscripcion.id + "");
    this.inscripcionDoc.delete();
  }




  async getInscripcionWhere(where: string, value: any) {
    let resp: Inscripcion[] = await new Promise(resolve => {
      this.inscripcionWherePromesa(where, value).subscribe(inscripcions => {
        resolve(inscripcions);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  async ListarInscripcionAnioCiclo(anio: number, ciclo: string) {
    let resp: Inscripcion[] = await new Promise(resolve => {
      this.inscripcionsAnioCilo(anio, ciclo).subscribe(inscripcions => {
        resolve(inscripcions);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  inscripcionWherePromesa(where: string, valor: any) {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones',
      ref => ref.where(where, '==', valor))
    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }


  async getInscripcion(inscripcion: Inscripcion) {
    let resp: Inscripcion[] = await new Promise(resolve => {
      this.inscripcionEquals(inscripcion).subscribe(inscripcion => {
        resolve(inscripcion);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  async getInscripcionClaseInstructor(clase: string, instructor: string) {
    let resp: Inscripcion[] = await new Promise(resolve => {
      this.inscripcionsClaseInstructor(clase, instructor).subscribe(inscripcion => {
        resolve(inscripcion);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  inscripcionEquals(inscripcion: Inscripcion) {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones',
      ref => ref.where('clase', '==', inscripcion.clase)
        .where('usuario', '==', inscripcion.usuario))
    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }
  inscripcionsAnioCilo(anio: number, ciclo: string) {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones',
      ref => ref.where('anio', '==', anio)
        .where('ciclo', '==', ciclo))
    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }

  inscripcionsClaseInstructor(clase: string, instructor: string) {
    this.inscripcionCollection = this.dbfairebase.collection('Inscripciones',
      ref => ref.where('clase', '==', clase)
        .where('instructor', '==', instructor))
    this.inscripcionList = this.inscripcionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Inscripcion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.inscripcionList;
  }
}
