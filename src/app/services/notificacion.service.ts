import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { ArchivoService } from './archivo.service';
import { Notificacion } from 'app/models/notificacion';
import { Usuario } from 'app/models/usuario';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  notificacionCollection: AngularFirestoreCollection<Notificacion>;
  notificacionList: Observable<Notificacion[]>;
  notificacionDoc: AngularFirestoreDocument<Notificacion>;
  notificacionSesion = [] as Notificacion;
  rolSesion = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private _archivosServicie: ArchivoService,
    private _usuarioService: UsuarioService,
    private util: TextTilUtil,
    private _router: Router,
    public dbfairebase: AngularFirestore,
    public dba: AngularFireDatabase,
    private http: HttpClient) {

  }

  async listarFiltro(pageSize: number, nextpage: string, adelante: boolean, tipoSearch: string, ValorSearch: any) {
    console.log("TIPO:" + tipoSearch + " valor busqueda :" + ValorSearch, "ultimo :" + nextpage, "adelante :" + adelante);
    let valorVacio = true;
    if (isNaN(ValorSearch)) {
      valorVacio = this.util.isStringVacio(ValorSearch);
    } else {
      valorVacio = this.util.isNumberVacio(ValorSearch);
    }
    if (valorVacio && this.util.isStringVacio(nextpage)) {
      this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').limit(pageSize));
    } if (!valorVacio && this.util.isStringVacio(nextpage)) {
      this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.where(tipoSearch, '==', ValorSearch).orderBy('id').limit(pageSize))
     }else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').startAfter(nextpage).limit(pageSize));
        } else {
          this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.notificacionList = await this.notificacionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificacion;
          data.id = a.payload.doc.id;
          return data;
        });
      }))



    return this.notificacionList;
  }

  async listar() {
    this.notificacionCollection = this.dbfairebase.collection('Notificaciones');
    this.notificacionList = this.notificacionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificacion;
          data.id = a.payload.doc.id;

          return data;
        }

        );
      }))
    return this.notificacionList;
  }


  listarNombreSiguiente(nombre, ultimoNombre: string, adelante: boolean) {
    console.log("nombre :" + nombre, "ultimo :" + ultimoNombre, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(ultimoNombre)) {
      this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').startAfter(ultimoNombre).limit(4));
        } else {
          this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('id').startAt(ultimoNombre).limit(4));
        }
      } else {
        this.notificacionCollection = this.dbfairebase.collection('Notificaciones', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));

      }
    }

    this.notificacionList = this.notificacionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificacion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.notificacionList;
  }



  async registrar(notificacion: Notificacion) {
    this.notificacionCollection = this.dbfairebase.collection('Notificaciones');
    notificacion.estado = 0;
    notificacion.fecha_create = new Date().getTime();
    this.notificacionCollection.add(notificacion);
    // let resp: Notificacion[] = await this.getNotificacion(notificacion);
    // if (resp.length > 0) {
    //   this.actualizar(resp[0]);
    // }

  }



  async cerarNotificacionMasiva(usuarioRemite: Usuario, titulo: string,mensaje: string, rolDestino: string,url:string,id:string) {
   
    let listaUser = await this._usuarioService.listarRoles2(rolDestino);    
    await listaUser.forEach(async usuario => {
      let notificacion = {} as Notificacion;
      notificacion.estado = 0;
      notificacion.usuario_remite = usuarioRemite.id;
      notificacion.foto_remite = usuarioRemite.foto;
      notificacion.titulo =titulo;
      notificacion.msg =  mensaje ;
      notificacion.usuario_destino = usuario.id;
      notificacion.foto_destino = usuario.foto;
      notificacion.url=url;
      notificacion.id_url=id;      
      if (usuario.id != usuarioRemite.id) {
        await this.cerarNotificacion(notificacion);
      }
     });
  }

  async cerarNotificacioDirecta(usuarioRemite:Usuario,titulo: string,mensaje:string,usuarioDestino:Usuario,url:string,id:string) {
    let notificacion = {} as Notificacion;
    notificacion.estado = 0;
    notificacion.usuario_remite = usuarioRemite.id;
    notificacion.foto_remite = usuarioRemite.foto;
    notificacion.titulo =titulo;
    notificacion.msg =  mensaje ;
    notificacion.usuario_destino = usuarioDestino.id;
    notificacion.foto_destino = usuarioDestino.foto;
    notificacion.url=url;
    notificacion.id_url=id;
    
    if (usuarioDestino.id != usuarioRemite.id) {
      await this.cerarNotificacion(notificacion);
    }
  }

  async cerarNotificacion(notificacion: Notificacion) {
    this.registrar(notificacion);
  }



  actualizar(notificacion: Notificacion) {
    this.notificacionDoc = this.dbfairebase.doc('Notificaciones/' + notificacion.id + "");
    this.notificacionDoc.update(notificacion);
  }

  eliminar(notificacion: Notificacion) {
    this.notificacionDoc = this.dbfairebase.doc('Notificaciones/' + notificacion.id + "");
    this.notificacionDoc.delete();
  }

  async getNotificacionWhere(where: string, value: any) {
    let resp: Notificacion[] = await new Promise(resolve => {
      this.notificacionWhere(where, value).subscribe(notificacions => {
        resolve(notificacions);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  async getNotificacion(notificaicon: Notificacion) {
    let resp: Notificacion[] = await new Promise(resolve => {
      this.notificacionwEquals(notificaicon).subscribe(notificacions => {
        resolve(notificacions);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  notificacionwEquals(notificaicon: Notificacion) {
    this.notificacionCollection = this.dbfairebase.collection('Notificaciones',
      ref => ref.where('estado', '==', notificaicon.estado)
        .where('msg', '==', notificaicon.msg)
        .where('usuario_destino', '==', notificaicon.usuario_destino)
        .where('usuario_remite', '==', notificaicon.usuario_remite)
        .where('fecha_create', '==', notificaicon.fecha_create))
    this.notificacionList = this.notificacionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificacion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.notificacionList;
  }

  notificacionWhere(where: string, valor: any) {
    this.notificacionCollection = this.dbfairebase.collection('Notificaciones',
     ref => ref.where(where, '==', valor).where('estado', '==', 0))     
      
    this.notificacionList = this.notificacionCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Notificacion;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))      
    
    return this.notificacionList;
  }

  getReporte(tipo: string, lista: string, nameImage: string, object?: Object): Observable<any> {
    let parameters = new URLSearchParams();
    for (let property in object) {
      parameters.set(property, object[property]);
    }
    const httpOptions = {
      /* 'responseType'  : 'arraybuffer' as 'json' */
      'responseType': 'blob' as 'json'        //This also worked
    };

    return this.http.get<any>(`http://localhost:8080/ReportApi/api/diplomas?name_report=${tipo}&lista=${lista}&nameImage=${nameImage}`);
  }
}
