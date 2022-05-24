import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Articulo } from '../models/articulo';
import { AngularFireStorage } from '@angular/fire/storage';
import { ArchivoService } from './archivo.service';
import { Tipo_archivo } from './tipo_archivo';

@Injectable({
  providedIn: 'root'
})
export class ArticuloService {
  articuloCollection: AngularFirestoreCollection<Articulo>;
  articuloList: Observable<Articulo[]>;
  articuloDoc: AngularFirestoreDocument<Articulo>;
  
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
    console.log(ValorSearch)
    if (isNaN(ValorSearch)) {
      valorVacio = this.util.isStringVacio(ValorSearch);
    } else {
      valorVacio = this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.articuloCollection = this.dbfairebase.collection('Articulos', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.articuloCollection = this.dbfairebase.collection('Articulos', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.articuloCollection = this.dbfairebase.collection('Articulos', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.articuloCollection = this.dbfairebase.collection('Articulos', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));
      }
    }

    this.articuloList = this.articuloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Articulo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.articuloList;
  }

  filtroGrupoPrecio(grupo: string, precio: any) {
    console.log(grupo,precio)
    if (!this.util.isStringVacio(grupo) && !this.util.isNumberVacio(precio)) {
      this.articuloCollection = this.dbfairebase.collection('Articulos',ref => ref.where('grupo', '==', grupo).where('precio', '<', precio))
    }else if(!this.util.isNumberVacio(precio) && this.util.isStringVacio(grupo)){
      this.articuloCollection = this.dbfairebase.collection('Articulos',ref => ref.where('precio', '<', precio))
    }else if(!this.util.isStringVacio(grupo) && this.util.isNumberVacio(precio)){
      this.articuloCollection = this.dbfairebase.collection('Articulos',ref => ref.where('grupo', '==', grupo))
    } else{
      this.articuloCollection = this.dbfairebase.collection('Articulos');
    }   
    this.articuloList = this.articuloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Articulo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.articuloList;
  }

  async listar() {
    this.articuloCollection = this.dbfairebase.collection('Articulos');
    this.articuloList = this.articuloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Articulo;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.articuloList;
  }



  async registrar(articulo: Articulo, file_Articulo: File) {
    this.articuloCollection = this.dbfairebase.collection('Articulos');
    articulo.estado = "ACTIVO";
    await this.articuloCollection.add(articulo);
    let resp: Articulo[] = await this.getArticuloWhere("nombre", articulo.nombre);
    if (resp.length > 0) {
      if (file_Articulo != null) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.articulos, resp[0].id, file_Articulo);
        resp[0].imagen = url;
      }else{
        resp[0].imagen = "../assets/img/articulo.png";
      }
      this.actualizar(resp[0]);

    }
  }

  async actualizarArticulo(articulo: Articulo, file_Articulo: File) {
   console.log(articulo);
      if (file_Articulo != null ) {
        let url = await this._archivosServicie.registrar(Tipo_archivo.articulos, articulo.id, file_Articulo);
        articulo.imagen = url;
      }
    
      console.log(articulo);
      this.actualizar(articulo);

    }
  

   actualizar(articulo: Articulo) {
    this.articuloDoc = this.dbfairebase.doc('Articulos/' + articulo.id + "");
    this.articuloDoc.update(articulo);
  }

  eliminar(articulo: Articulo) {
    this.articuloDoc = this.dbfairebase.doc('Articulos/' + articulo.id + "");
    this.articuloDoc.delete();
  }



  async getArticuloWhere(where: string, value: any) {
    let resp: Articulo[] = await new Promise(resolve => {
      this.articuloWhere(where, value).subscribe(articulos => {
        resolve(articulos);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  articuloWhere(where: string, valor: any) {
    this.articuloCollection = this.dbfairebase.collection('Articulos',
      ref => ref.where(where, '==', valor))
    this.articuloList = this.articuloCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Articulo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.articuloList;
  }


}
