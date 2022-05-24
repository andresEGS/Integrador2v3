import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Pieza } from 'app/models/pieza';

@Injectable({
  providedIn: 'root'
})
export class PiezasService {

  piezaCollection: AngularFirestoreCollection<Pieza>;
  piezaList: Observable<Pieza[]>;
  piezaDoc: AngularFirestoreDocument<Pieza>;
  // piezaSelect:Persona = new Persona();
  constructor(public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {


  }


  listar() {
    this.piezaCollection = this.dbfairebase.collection('piezas');
    this.piezaList = this.piezaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pieza;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.piezaList;
  }

  listarSexo(sexo) {
    
    this.piezaCollection = this.dbfairebase.collection('piezas', ref => ref.where('sexo', 'in', [sexo,'U'] ))
    // .where('sexo', 'in',)
    this.piezaList = this.piezaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pieza;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.piezaList;
  }

  listarnombre(nombre) {
    this.piezaCollection = this.dbfairebase.collection('piezas', ref => ref.where('nombre', '==', nombre))
    this.piezaList = this.piezaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pieza;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.piezaList;
  }

  registrar(pieza: Pieza) {
    this.piezaCollection.add(pieza);
  }

  actualizar(pieza: Pieza) {
    this.piezaDoc = this.dbfairebase.doc('piezas/' + pieza.id + "");
    this.piezaDoc.update(pieza);
  }

  eliminar(pieza: Pieza) {
    this.piezaDoc = this.dbfairebase.doc('piezas/' + pieza.id + "");
    this.piezaDoc.delete();
  }

}
