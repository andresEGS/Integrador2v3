import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Carrito } from 'app/models/carrito';
import { ArticuloService } from './articulo.service';
import { DetalleCarrito } from 'app/models/detalle_carrito';

@Injectable({
  providedIn: 'root'
})
export class CarritosService {

  carritoCollection: AngularFirestoreCollection<Carrito>;
  carritoList: Observable<Carrito[]>;
  carritoDoc: AngularFirestoreDocument<Carrito>;
  // carritoSelect:Persona = new Persona();
  constructor(private _articuloServicie: ArticuloService,public dbfairebase: AngularFirestore
    , public db: AngularFireDatabase) {

    this.carritoCollection = this.dbfairebase.collection('Carritos');
  }


  listar() {
    this.carritoCollection.ref.limitToLast(4);
    this.carritoList = this.carritoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Carrito;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.carritoList;
  }

  listarEstado(estado) {
    console.log(estado);
    this.carritoCollection = this.dbfairebase.collection('Carritos', ref => ref.where('estado', '==', estado));
    this.carritoList = this.carritoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Carrito;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.carritoList;
  }

 

  getCarrito(id_cliente,estado) {
    console.log(id_cliente,estado);
    this.carritoCollection = this.dbfairebase.collection('Carritos', ref => ref.where("cliente.id", "==", id_cliente).where("estado", "==", estado)); 
    this.carritoList = this.carritoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Carrito;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.carritoList;
  }

  async getCarritoAsync(id_cliente: string, estado: any) {
    let resp: Carrito[] = await new Promise(resolve => {
      this.getCarrito(id_cliente, estado).subscribe(lista => {
        resolve(lista);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  listarMisCarritos(id_cliente: string) {
    console.log(id_cliente);
    this.carritoCollection = this.dbfairebase.collection('Carritos', ref => ref.where('cliente.id', '==', id_cliente))   
    this.carritoList = this.carritoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Carrito;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.carritoList;
  }

  registrar(carrito: Carrito) {
    carrito.fecha_create = new Date().getTime();
    carrito.fecha_update= new Date().getTime();     
    this.valorTotal(carrito);
    this.carritoCollection.add(carrito);
  }
 

  actualizar(carrito: Carrito): any {
    this.carritoDoc = this.dbfairebase.doc('Carritos/' + carrito.id + "");
    carrito.fecha_update= new Date().getTime();
    this.valorTotal(carrito);
    return this.carritoDoc.update(carrito);
  }

  aprobarCarrito(carrito: Carrito){
    for(let detalle of carrito.articulos){
      this.actualizarArticulo(detalle);
    } 
    carrito.estado=Carrito.DESPACHO;
    this.actualizar(carrito);
  }


  eliminar(carrito: Carrito) {
    this.carritoDoc = this.dbfairebase.doc('Carritos/' + carrito.id + "");
    this.carritoDoc.delete();
  }



  actualizarArticulo(detalle:DetalleCarrito): any {
    let articulo = detalle.articulo;
    articulo.cantidad=articulo.cantidad-detalle.cantidad;
    if(articulo.cantidad<=0){
      articulo.estado="INACTIVO";
    } 
    console.log(articulo);   
    this._articuloServicie.actualizar(articulo);
  }

  valorTotal(carrito: Carrito){
    let valor_total=0;
    for(let detalle of carrito.articulos){
      valor_total=valor_total+detalle.valor_total;
    }
    carrito.valor=valor_total; 
  }

}
