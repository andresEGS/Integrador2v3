import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tipo_archivo } from './tipo_archivo';
import { ArchivoService } from './archivo.service';
import { Instructor } from 'app/models/instructor';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from './usuario.service';
import { Especialidad } from 'app/models/especialidad';
import { Messages } from 'app/utilidades/Messages';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  instructorCollection: AngularFirestoreCollection<Instructor>;
  instructorList: Observable<Instructor[]>;
  instructorDoc: AngularFirestoreDocument<Instructor>;
  instructorSesion = [] as Instructor;
  rolSesion = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private _archivosServicie: ArchivoService,
    private _usuarioService :UsuarioService,
    private util: TextTilUtil,
    private msg: Messages,
     private _router: Router,
     public dbfairebase: AngularFirestore, 
     public dba: AngularFireDatabase,
      private http: HttpClient) {

  }

  async listarFiltro(pageSize:number,nextpage: string, adelante: boolean,tipoSearch:string,ValorSearch:any ) {
    console.log("TIPO:" +tipoSearch+" valor busqueda :" + ValorSearch, "ultimo :" + nextpage, "adelante :" + adelante);
    let valorVacio=true;
    if(isNaN(ValorSearch)){
      valorVacio= this.util.isStringVacio(ValorSearch);
    }else{
      valorVacio= this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }    

     this.instructorList= await this.instructorCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Instructor;
          data.id = a.payload.doc.id;          
          return data;
        });
      }))

     
      
    return this.instructorList;
  }

  async listar() {
    this.instructorCollection = this.dbfairebase.collection('Instructores');
    this.instructorList = this.instructorCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Instructor;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.instructorList;
  }


  listarNombreSiguiente(nombre, ultimoNombre: string, adelante: boolean) {
    console.log("nombre :" + nombre, "ultimo :" + ultimoNombre, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(ultimoNombre)) {
      this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').startAfter(ultimoNombre).limit(4));
        } else {
          this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('id').startAt(ultimoNombre).limit(4));
        }
      } else {
        this.instructorCollection = this.dbfairebase.collection('Instructores', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));

      }
    }    

    this.instructorList = this.instructorCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Instructor;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.instructorList;
  }



  async registrar(instructor: Instructor) {
    this.instructorCollection = this.dbfairebase.collection('Instructores');
    instructor.estado = "PENDIENTE";
    instructor.estado_solicitud = "ENVIADA";
    instructor.estado_firma="ENVIADA";
    instructor.estado_foto="ENVIADA";
    instructor.fecha_create = new Date().getTime();
    this.instructorCollection.add(instructor);
    let resp: Instructor[] = await this.getInstructorWhere("usuario", instructor.usuario);
    if (resp.length > 0) {
      this.actualizar(resp[0]);
    }
    
  }

  async registrarUsuarioFirma(usuario:Usuario, instructor: Instructor,file_firma:File,file_foto:File) {    
    this.instructorCollection = this.dbfairebase.collection('Instructores');
    this._usuarioService.actualizarConFoto(usuario,file_foto);  
    if (file_firma != null) {
      let url = await this._archivosServicie.registrar(Tipo_archivo.firmas, instructor.usuario, file_firma);
      instructor.firma = url;
    }else{
      instructor.firma = "../assets/img/firma2.png";
    }  
    this.registrar(instructor);   
  }
  async actualizarUsuarioFirma(usuario:Usuario, instructor: Instructor,file_firma:File,file_foto:File) {    
    this.instructorCollection = this.dbfairebase.collection('Instructores');
    this._usuarioService.actualizarConFoto(usuario,file_foto);      
    if (file_firma != null) {
      let url = await this._archivosServicie.registrar(Tipo_archivo.firmas, instructor.usuario, file_firma);
      instructor.firma = url;
    } 
    this.actualizar(instructor);   
  }

  actualizar(instructor: Instructor) {
    this.instructorDoc = this.dbfairebase.doc('Instructores/' + instructor.id + "");
    instructor.fecha_update = new Date().getTime();
    this.instructorDoc.update(instructor);
  }

  async actualizarConFirma(instructor: Instructor,file_firma:File) {    
    if (file_firma != null ) {
      let url = await this._archivosServicie.registrar(Tipo_archivo.firmas, instructor.id, file_firma);
      instructor.firma = url;
    }
    this.actualizar(instructor);
  }
  

  eliminar(instructor: Instructor) {
    this.instructorDoc = this.dbfairebase.doc('Instructores/' + instructor.id + "");
    this.instructorDoc.delete();
  }




  async getInstructorWhere(where: string, value: any) {
    let resp: Instructor[] = await new Promise(resolve => {
      this.instructorWhere(where, value).subscribe(instructors => {
        resolve(instructors);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  async listarInstructoresEspecialidad(espeSelec: Especialidad) {
    let instructores = [];
    let instructor = new Instructor;
    let instructorlista: Instructor[] = await this.getInstructorWhere('estado', "APROBADO");
    await instructorlista.forEach(async instructor => {
      var instructorTemp = {
        id: instructor.id,
        nombre_usuario: instructor.nombre_usuario,
        foto_usuario: instructor.foto_usuario,
      }
      instructor.especialidades.forEach(async espec => {
        if (espeSelec.id == espec.id) {
          instructores.push(instructorTemp)
        }
      });

    });
    if (instructores.length <= 0) {
      this.msg.msgWarning('no se encontraron Instrutores para  esta especialiad');
    }
    if (instructores.length == 1) {
      instructor = instructores[0];
    }

    return instructores;

  }
  
  instructorWhere(where: string, valor: any) {
    this.instructorCollection = this.dbfairebase.collection('Instructores',
      ref => ref.where(where, '==', valor))
    this.instructorList = this.instructorCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Instructor;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.instructorList;
  }


}
