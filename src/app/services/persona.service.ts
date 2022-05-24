import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Persona } from '../models/persona';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  personaCollection: AngularFirestoreCollection<Persona>;
  personaList: Observable<Persona[]>;
  personaDoc: AngularFirestoreDocument<Persona>;
  // personaSelect:Persona = new Persona();
  constructor(public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {


  }


  listar() {
    this.personaCollection = this.dbfairebase.collection('personas');
    this.personaList = this.personaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Persona;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.personaList;
  }

  listarTipo(tipo) {
    this.personaCollection = this.dbfairebase.collection('personas', ref => ref.where('tipo', '==', tipo))
    this.personaList = this.personaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Persona;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.personaList;
  }

  listarnombre(nombre) {
    this.personaCollection = this.dbfairebase.collection('personas', ref => ref.where('nombres', '==', nombre))
    this.personaList = this.personaCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Persona;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.personaList;
  }

  registrar(persona: Persona) {
    this.personaCollection.add(persona);
  }

  actualizar(persona: Persona) {
    this.personaDoc = this.dbfairebase.doc('personas/' + persona.id + "");
    this.personaDoc.update(persona);
  }

  eliminar(persona: Persona) {
    this.personaDoc = this.dbfairebase.doc('personas/' + persona.id + "");
    this.personaDoc.delete();
  }

}
