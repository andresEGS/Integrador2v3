import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Ciclo } from '../models/ciclo';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tipo_archivo } from './tipo_archivo';
import { ArchivoService } from './archivo.service';

@Injectable({
  providedIn: 'root'
})
export class CicloService {
  cicloCollection: AngularFirestoreCollection<Ciclo>;
  cicloCollectionGrupo: AngularFirestoreCollectionGroup<Ciclo>;
  cicloList: Observable<Ciclo[]>;
  cicloDoc: AngularFirestoreDocument<Ciclo>;
  cicloSesion = [] as Ciclo;
  rolSesion = [] as Rol;
  rolChange = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private _archivosServicie: ArchivoService, private util: TextTilUtil, private _router: Router, public dbfairebase: AngularFirestore, public dba: AngularFireDatabase, private http: HttpClient) {

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
      this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('anio').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('anio').startAfter(nextpage).limit(pageSize));
        } else {
          this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('anio').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('anio').orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff').limit(pageSize));

      }
    }

    this.cicloList = this.cicloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Ciclo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.cicloList;
  }

  listar() {
    this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('anio'));
    this.cicloList = this.cicloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Ciclo;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.cicloList;
  }
  async ListaCiclo() {
    let resp: Ciclo[] = await new Promise(resolve => {
      this.listar().subscribe(ciclo => {
        resolve(ciclo);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  public async listarAnios(){
    var anios=[];
    var anio_add=2021;
    anios.push(anio_add);
    let listaCiclos: Ciclo[]= await this.ListaCiclo();
    listaCiclos.forEach(async ciclo => {
        var encontro=false;
        anios.forEach(async anio=>{
          if(anio==ciclo.anio){
            encontro= true;
          }
        })
        if(!encontro){
          await anios.push(ciclo.anio);
        }
        });
    return anios
  }

 
  listarNombreSiguiente(nombre, ultimoNombre: string, adelante: boolean) {
    console.log("nombre :" + nombre, "ultimo :" + ultimoNombre, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(ultimoNombre)) {
      this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('id').startAfter(ultimoNombre).limit(4));
        } else {
          this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('id').startAt(ultimoNombre).limit(4));
        }
      } else {
        this.cicloCollection = this.dbfairebase.collection('Ciclos', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));
     
      }
    }

    this.cicloList = this.cicloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Ciclo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.cicloList;
  }

  getciclonombre() {
    var citiesRef = this.dbfairebase.collection('Ciclos');
    this.dba.database.ref('/ciclos').once('value');
  }


  async registrar(ciclo: Ciclo) {
    this.cicloCollection = this.dbfairebase.collection('Ciclos');
    ciclo.estado = "ACTIVO";
    ciclo.fecha_create = new Date().getTime();
    this.cicloCollection.add(ciclo);
    let resp: Ciclo[] = await this.getCiclo(ciclo);
    if (resp.length > 0) {
      this.actualizar(resp[0]);
    }
  }

  actualizar(ciclo: Ciclo) {
    this.cicloDoc = this.dbfairebase.doc('Ciclos/' + ciclo.id + "");
    this.cicloDoc.update(ciclo);
  }




  eliminar(ciclo: Ciclo) {
    this.cicloDoc = this.dbfairebase.doc('Ciclos/' + ciclo.id + "");
    this.cicloDoc.delete();
  }




  async getCicloWhere(where: string, value: any) {
    let resp: Ciclo[] = await new Promise(resolve => {
      this.cicloWhere(where, value).subscribe(ciclos => {
        resolve(ciclos);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  cicloWhere(where: string, valor: any) {
    this.cicloCollection = this.dbfairebase.collection('Ciclos',
      ref => ref.where(where, '==', valor))
    this.cicloList = this.cicloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Ciclo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.cicloList;
  }


  async getCiclo(ciclo: Ciclo) {
    let resp: Ciclo[] = await new Promise(resolve => {
      this.cicloEquals(ciclo).subscribe(ciclo => {
        resolve(ciclo);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  cicloEquals(ciclo: Ciclo) {
    this.cicloCollection = this.dbfairebase.collection('Ciclos',
      ref => ref.where('anio', '==', ciclo.anio)
        .where('consecutivo', '==', ciclo.consecutivo))
    this.cicloList = this.cicloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Ciclo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.cicloList;
  }
}
