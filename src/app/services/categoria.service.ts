import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { Rol } from '../models/rol';
import { Categoria } from 'app/models/categoria';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  categoriaCollection: AngularFirestoreCollection<Categoria>;
  categoriaList: Observable<Categoria[]>;
  categoriaDoc: AngularFirestoreDocument<Categoria>;
  categoriaSesion = [] as Categoria;
  rolSesion = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private util: TextTilUtil,
    public dbfairebase: AngularFirestore,
    public storage: AngularFireStorage,
    public dba: AngularFireDatabase) {

  }

  listarFiltro(pageSize: number, nextpage: string, adelante: boolean, tipoSearch: string, ValorSearch: any) {
    console.log("asdasdasdasd")
    let valorVacio = true;
    if (isNaN(ValorSearch)) {
      valorVacio = this.util.isStringVacio(ValorSearch);
    } else {
      valorVacio = this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.categoriaCollection = this.dbfairebase.collection('Categorias', ref => ref.orderBy('id').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.categoriaCollection = this.dbfairebase.collection('Categorias', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.categoriaCollection = this.dbfairebase.collection('Categorias', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.categoriaCollection = this.dbfairebase.collection('Categorias', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.categoriaList = this.categoriaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Categoria;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.categoriaList;
  }

   listar() {
    this.categoriaCollection = this.dbfairebase.collection('Categorias');
    this.categoriaList = this.categoriaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Categoria;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.categoriaList;
  }

  async getListar() {
    let resp: Categoria[] = await new Promise(resolve => {
      this.Listar2().subscribe(categorias => {
        resolve(categorias);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  Listar2() {
    this.categoriaCollection = this.dbfairebase.collection('Categorias',ref => ref.orderBy('nivel'))
    this.categoriaList = this.categoriaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Categoria;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.categoriaList;
  }

 



  async registrar(categoria: Categoria) {
    this.categoriaCollection = this.dbfairebase.collection('Categorias');
    await this.categoriaCollection.add(categoria);
    let resp: Categoria[] = await this.getWhereAsync("nombre", categoria.nombre);
    if (resp.length > 0) {
      this.actualizar(resp[0]);

    }
  }

  async actualizarAsync(categoria: Categoria) {
    console.log(categoria);
    this.actualizar(categoria);
  }

  actualizar(categoria: Categoria) {
    this.categoriaDoc = this.dbfairebase.doc('Categorias/' + categoria.id + "");
    this.categoriaDoc.update(categoria);
  }

  eliminar(categoria: Categoria) {
    this.categoriaDoc = this.dbfairebase.doc('Categorias/' + categoria.id + "");
    this.categoriaDoc.delete();
  }

  async getWhereAsync(where: string, value: any) {
    let resp: Categoria[] = await new Promise(resolve => {
      this.getWhere(where, value).subscribe(categorias => {
        resolve(categorias);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  getWhere(where: string, valor: any) {
    this.categoriaCollection = this.dbfairebase.collection('Categorias',
      ref => ref.where(where, '==', valor))
    this.categoriaList = this.categoriaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Categoria;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.categoriaList;
  }

}
