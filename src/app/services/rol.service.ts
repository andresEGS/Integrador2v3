import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Rol } from 'app/models/rol';

@Injectable({
  providedIn: 'root'
})
export class RolService {

  rolCollection: AngularFirestoreCollection<Rol>;
  rolList: Observable<Rol[]>;
  rolDoc: AngularFirestoreDocument<Rol>;
  // rolSelect:Persona = new Persona();
  constructor(public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {


  }


  listar() {
    this.rolCollection = this.dbfairebase.collection('Roles');
    this.rolList = this.rolCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Rol;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.rolList;
  }

 

  getId(id:string) {
    this.rolCollection = this.dbfairebase.collection('Roles', ref => ref.where('id', '==', id))
    this.rolList = this.rolCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Rol;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.rolList;
  }

  async getRolWhere(where: string, value: any) {
    let resp: Rol[] = await new Promise(resolve => {
      this.RolWhere(where, value).subscribe(roles => {
        resolve(roles);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  RolWhere(where: string, valor: any) {
    console.log("ROLWERW")
    this.rolCollection= this.dbfairebase.collection('Roles',
      ref => ref.where(where, '==', valor))
      this.rolList = this.rolCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Rol;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.rolList;
  }

  registrar(rol: Rol) {
    this.rolCollection.add(rol);
  }

  actualizar(rol: Rol) {
    this.rolDoc = this.dbfairebase.doc('Roles/' + rol.id + "");
    this.rolDoc.update(rol);
  }

  eliminar(rol: Rol) {
    this.rolDoc = this.dbfairebase.doc('Roles/' + rol.id + "");
    this.rolDoc.delete();
  }

}
