import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Menu } from 'app/models/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  rolCollection: AngularFirestoreCollection<Menu>;
  rolList: Observable<Menu[]>;
  rolDoc: AngularFirestoreDocument<Menu>;
  // rolSelect:Persona = new Persona();
  constructor(public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {


  }


  listar() {
    this.rolCollection = this.dbfairebase.collection('Menu');
    this.rolList = this.rolCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Menu;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.rolList;
  }

 

  getId(id:string) {
    this.rolCollection = this.dbfairebase.collection('Menu', ref => ref.where('id', '==', id))
    this.rolList = this.rolCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Menu;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.rolList;
  }

  registrar(rol: Menu) {
    this.rolCollection.add(rol);
  }

  actualizar(rol: Menu) {
    this.rolDoc = this.dbfairebase.doc('Menu/' + rol.id + "");
    this.rolDoc.update(rol);
  }

  eliminar(rol: Menu) {
    this.rolDoc = this.dbfairebase.doc('Menu/' + rol.id + "");
    this.rolDoc.delete();
  }

}
