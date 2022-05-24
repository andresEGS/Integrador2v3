import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tema } from 'app/models/tema';
import { AngularFireStorage } from '@angular/fire/storage';
import { ArchivoService } from './archivo.service';
import { Tipo_archivo } from './tipo_archivo';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  temaCollection: AngularFirestoreCollection<Tema>;
  temaList: Observable<Tema[]>;
  temaDoc: AngularFirestoreDocument<Tema>;
  temaSesion = [] as Tema;
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
      this.temaCollection = this.dbfairebase.collection('Temas', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.temaCollection = this.dbfairebase.collection('Temas', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.temaCollection = this.dbfairebase.collection('Temas', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.temaCollection = this.dbfairebase.collection('Temas', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.temaList = this.temaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Tema;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.temaList;
  }

  async listar() {
    this.temaCollection = this.dbfairebase.collection('Temas');
    this.temaList = this.temaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Tema;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.temaList;
  }



  async registrar(tema: Tema) {
    this.temaCollection = this.dbfairebase.collection('Temas');
    await this.temaCollection.add(tema);
    let resp: Tema[] = await this.getWhereAsync("nombre", tema.nombre);
    if (resp.length > 0) {
      this.actualizar(resp[0]);

    }
  }

  async actualizarAsync(tema: Tema) {
    console.log(tema);
    this.actualizar(tema);
  }

  actualizar(tema: Tema) {
    this.temaDoc = this.dbfairebase.doc('Temas/' + tema.id + "");
    this.temaDoc.update(tema);
  }

  eliminar(tema: Tema) {
    this.temaDoc = this.dbfairebase.doc('Temas/' + tema.id + "");
    this.temaDoc.delete();
  }

  async getWhereAsync(where: string, value: any) {
    let resp: Tema[] = await new Promise(resolve => {
      this.getWhere(where, value).subscribe(temas => {
        resolve(temas);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  getWhere(where: string, valor: any) {
    this.temaCollection = this.dbfairebase.collection('Temas',
      ref => ref.where(where, '==', valor))
    this.temaList = this.temaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Tema;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.temaList;
  }

  async getListaPuntosAsync(value: any) {
    let resp: Tema[] = await new Promise(resolve => {
      this.getListaPuntos(value).subscribe(temas => {
        resolve(temas);
      },
        error => {
          return error
        });
    });
    return resp;
  }


  getListaPuntos(valor: any) {
    this.temaCollection = this.dbfairebase.collection('Temas',
      ref => ref.where('puntos', '<=', valor).orderBy("puntos", "asc"))
    this.temaList = this.temaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Tema;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.temaList;
  }

 

}
