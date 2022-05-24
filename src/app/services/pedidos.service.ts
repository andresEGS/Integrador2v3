import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Pedido } from 'app/models/pedido';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  pedidoCollection: AngularFirestoreCollection<Pedido>;
  pedidoList: Observable<Pedido[]>;
  pedidoDoc: AngularFirestoreDocument<Pedido>;
  // pedidoSelect:Persona = new Persona();
  constructor(public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {

    this.pedidoCollection = this.dbfairebase.collection('pedidos');
  }


  listar() {
    this.pedidoCollection.ref.limitToLast(4);
    this.pedidoList = this.pedidoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pedido;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.pedidoList;
  }

  listarEstado(tipo) {
    this.pedidoCollection = this.dbfairebase.collection('pedidos', ref => ref.where('estado', '==', tipo))
    this.pedidoList = this.pedidoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pedido;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.pedidoList;
  }

  listarClientes(nombre) {
    console.log(nombre);
    if (nombre === "" || nombre === '' || nombre === null || nombre === undefined){
      this.pedidoCollection = this.dbfairebase.collection('pedidos');
      
    }else{
      // this.pedidoCollection = this.dbfairebase.collection('pedidos', ref => ref.where('cliente.nombre', '==', nombre));
      this.pedidoCollection = this.dbfairebase.collection('pedidos', ref => ref.orderBy('cliente.nombre').startAt(nombre).endAt(nombre+'\uf8ff'));
    }
    //  .endAt('cliente.nombre', '==', nombre))
    this.pedidoList = this.pedidoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pedido;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.pedidoList;
  }

  listarEstadosClientes(estado: string, nombre: string) {
    if (nombre === "" || nombre === '' || nombre === null || nombre === undefined){
      this.pedidoCollection = this.dbfairebase.collection('pedidos', ref => ref.where('estado', '==', estado))
    } else {
      this.pedidoCollection = this.dbfairebase.collection('pedidos', ref => ref.where('estado', '==', estado)
      .orderBy('cliente.nombre').startAt(nombre).endAt(nombre+'\uf8ff')
      );
     
    }
    this.pedidoList = this.pedidoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Pedido;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.pedidoList;
  }

  registrar(pedido: Pedido) {
    this.pedidoCollection.add(pedido);
  }

  actualizar(pedido: Pedido): any {
    this.pedidoDoc = this.dbfairebase.doc('pedidos/' + pedido.id + "");
    return this.pedidoDoc.update(pedido);
  }

  eliminar(pedido: Pedido) {
    this.pedidoDoc = this.dbfairebase.doc('pedidos/' + pedido.id + "");
    this.pedidoDoc.delete();
  }

}
