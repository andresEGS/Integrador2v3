import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tema } from '../models/tema';
import { Pregunta } from 'app/models/pregunta';
import { AngularFireStorage } from '@angular/fire/storage';
import { ArchivoService } from './archivo.service';
import { Tipo_archivo } from './tipo_archivo';
import { TemaService } from './tema.service';

@Injectable({
  providedIn: 'root'
})
export class PreguntaService {
  preguntaCollection: AngularFirestoreCollection<Pregunta>;
  preguntaList: Observable<Pregunta[]>;
  preguntaDoc: AngularFirestoreDocument<Pregunta>;
  preguntaSesion = [] as Pregunta;
  rolSesion = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private util: TextTilUtil,
    private _temaService: TemaService,
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
      this.preguntaCollection = this.dbfairebase.collection('Preguntas', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.preguntaCollection = this.dbfairebase.collection('Preguntas', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.preguntaCollection = this.dbfairebase.collection('Preguntas', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.preguntaCollection = this.dbfairebase.collection('Preguntas', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.preguntaList = this.preguntaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pregunta;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.preguntaList;
  }

  async listar() {
    this.preguntaCollection = this.dbfairebase.collection('Preguntas');
    this.preguntaList = this.preguntaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pregunta;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.preguntaList;
  }



  async registrar(pregunta: Pregunta) {
    this.preguntaCollection = this.dbfairebase.collection('Preguntas');
    await this.preguntaCollection.add(pregunta);
    let resp: Pregunta[] = await this.getWhereAsync("nombre", pregunta.nombre);
    let tema:Tema[] = await this._temaService.getWhereAsync("id",pregunta.tema);
    let cant: Pregunta[] = await this.getWhereAsync("tema", pregunta.tema);
    if (cant.length > 0) {
      tema[0].cont_preguntas=cant.length;
      this._temaService.actualizar(tema[0]);

    }

    if (resp.length > 0) {
      this.actualizar(resp[0]);

    }
  }

  async actualizarAsync(pregunta: Pregunta) {
    console.log(pregunta);
    this.actualizar(pregunta);
  }

  actualizar(pregunta: Pregunta) {
    this.preguntaDoc = this.dbfairebase.doc('Preguntas/' + pregunta.id + "");
    this.preguntaDoc.update(pregunta);
  }

  eliminar(pregunta: Pregunta) {
    this.preguntaDoc = this.dbfairebase.doc('Preguntas/' + pregunta.id + "");
    this.preguntaDoc.delete();
  }

  async getWhereAsync(where: string, value: any) {
    let resp: Pregunta[] = await new Promise(resolve => {
      this.getWhere(where, value).subscribe(preguntas => {
        resolve(preguntas);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  getWhere(where: string, valor: any) {
    this.preguntaCollection = this.dbfairebase.collection('Preguntas',
      ref => ref.where(where, '==', valor))
    this.preguntaList = this.preguntaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pregunta;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.preguntaList;
  }

  async getListaTemaDificultadAsync(tema:string ,opr: any, dificultad:string) {
    console.log(tema+"-----------")
    let resp: Pregunta[] = await new Promise(resolve => {
      this.getListaTemaDificultad(tema,opr,dificultad).subscribe(temas => {
        resolve(temas);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  getListaTemaDificultad(tema:string ,opr: any, dificultad :string) {
    this.preguntaCollection = this.dbfairebase.collection('Preguntas',
      ref => ref.where('tema','==',tema).where('dificultad', opr, dificultad))
    this.preguntaList = this.preguntaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pregunta;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.preguntaList;
  }

}
