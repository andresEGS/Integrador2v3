import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Especialidad } from 'app/models/especialidad';
import { AngularFireStorage } from '@angular/fire/storage';
import { ArchivoService } from './archivo.service';
import { Tipo_archivo } from './tipo_archivo';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  especilidadCollection: AngularFirestoreCollection<Especialidad>;
  especilidadList: Observable<Especialidad[]>;
  especilidadDoc: AngularFirestoreDocument<Especialidad>;
  especilidadSesion = [] as Especialidad;
  rolSesion = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private util: TextTilUtil,
    private _archivosServicie: ArchivoService,
    private _router: Router,
    public dbfairebase: AngularFirestore,
    public storage: AngularFireStorage,
    public dba: AngularFireDatabase,
    private http: HttpClient) {

  }

  listarFiltro(pageSize: number, nextpage: string, adelante: boolean, tipoSearch: string, ValorSearch: any) {
    let valorVacio = true;
    if (isNaN(ValorSearch)) {
      valorVacio = this.util.isStringVacio(ValorSearch);
    } else {
      valorVacio = this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.especilidadCollection = this.dbfairebase.collection('Especialidades', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.especilidadCollection = this.dbfairebase.collection('Especialidades', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.especilidadCollection = this.dbfairebase.collection('Especialidades', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.especilidadCollection = this.dbfairebase.collection('Especialidades', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.especilidadList = this.especilidadCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Especialidad;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.especilidadList;
  }

  async listar() {
    this.especilidadCollection = this.dbfairebase.collection('Especialidades');
    this.especilidadList = this.especilidadCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Especialidad;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.especilidadList;
  }



  async registrar(especilidad: Especialidad, file_especialidad: File, file_certifiacdo: File) {
    this.especilidadCollection = this.dbfairebase.collection('Especialidades');
    especilidad.estado = "ACTIVO";
    await this.especilidadCollection.add(especilidad);
    let resp: Especialidad[] = await this.getEspecialidadWhere("nombre", especilidad.nombre);
    if (resp.length > 0) {
      if (file_especialidad != null) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.especialidades, resp[0].id, file_especialidad);
        resp[0].parche = url;
      }else{
        resp[0].parche = "../assets/img/especialidad.png";
      }
      if (file_certifiacdo != null) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.certificado, resp[0].id, file_certifiacdo);
        resp[0].certificado = url;
      }else{
        resp[0].certificado = "../assets/img/certificado.jpg";
      }
      this.actualizar(resp[0]);

    }
  }

  async actualizarEspecialidad(especilidad: Especialidad, file_especialidad: File,file_certifiacdo: File) {
   console.log(especilidad);
      if (file_especialidad != null ) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.especialidades, especilidad.id, file_especialidad);
        especilidad.parche = url;
      }
      if (file_certifiacdo != null ) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.certificado, especilidad.id, file_certifiacdo);
        especilidad.certificado = url;
      }
      console.log(especilidad);
      this.actualizar(especilidad);

    }
  

   actualizar(especilidad: Especialidad) {
    this.especilidadDoc = this.dbfairebase.doc('Especialidades/' + especilidad.id + "");
    this.especilidadDoc.update(especilidad);
  }

  eliminar(especilidad: Especialidad) {
    this.especilidadDoc = this.dbfairebase.doc('Especialidades/' + especilidad.id + "");
    this.especilidadDoc.delete();
  }



  async getEspecialidadWhere(where: string, value: any) {
    let resp: Especialidad[] = await new Promise(resolve => {
      this.especilidadWhere(where, value).subscribe(especilidads => {
        resolve(especilidads);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  especilidadWhere(where: string, valor: any) {
    this.especilidadCollection = this.dbfairebase.collection('Especialidades',
      ref => ref.where(where, '==', valor))
    this.especilidadList = this.especilidadCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Especialidad;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.especilidadList;
  }

  getReporte(tipo: string, lista: string, nameImage: string, object?: Object): Observable<any> {
    let parameters = new URLSearchParams();
    for (let property in object) {
      parameters.set(property, object[property]);
    }
    const httpOptions = {
      /* 'responseType'  : 'arraybuffer' as 'json' */
      'responseType': 'blob' as 'json'        //This also worked
    };

    return this.http.get<any>(`http://localhost:8080/ReportApi/api/diplomas?name_report=${tipo}&lista=${lista}&nameImage=${nameImage}`);
  }
}
