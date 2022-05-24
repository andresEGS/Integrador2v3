import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Usuario } from '../models/usuario';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tipo_archivo } from './tipo_archivo';
import { ArchivoService } from './archivo.service';
import { API } from './ApiConf';
import { CategoriaService } from './categoria.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  usuarioCollection: AngularFirestoreCollection<Usuario>;
  usuarioCollectionGrupo: AngularFirestoreCollectionGroup<Usuario>;
  usuarioList: Observable<Usuario[]>;
  usuarioDoc: AngularFirestoreDocument<Usuario>;
  usuarioSesion = [] as Usuario;
  rolSesion = [] as Rol;
  rolChange = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor(private _archivosServicie: ArchivoService, public _categoriaService: CategoriaService, private util: TextTilUtil, private _router: Router, public dbfairebase: AngularFirestore, public dba: AngularFireDatabase, private http: HttpClient) {

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
      this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy("puntos", "desc").limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy("puntos", "desc").startAfter(nextpage).limit(pageSize));
        } else {
          this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy("puntos", "desc").startAt(nextpage).limit(pageSize));
        }
      } else {
        this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff'));

      }
    }

    this.usuarioList = this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.usuarioList;
  }

  listar() {
    this.usuarioCollection = this.dbfairebase.collection('Usuarios');
    this.usuarioList = this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.usuarioList;
  }

  async listarAsync() {
    let resp: Usuario[] = await new Promise(resolve => {
      this.listar().subscribe(usuarios => {
        resolve(usuarios);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  async listarRoles(rolDestino: string) {
    var listaUsuarios = await this.listarAsync();
    var listaUsuariosRol: Usuario[] = [];
    // (await listaUsuarios).subscribe(lista => {
    listaUsuarios.forEach(async usuario => {
      if (usuario.roles) {
        await usuario.roles.forEach(async rol => {
          console.log("Los roles de " + usuario.nombre + " son:" + rol.nombre + " = " + rolDestino);
          if (rol.nombre === rolDestino) {
            await listaUsuariosRol.push(usuario);
          }
        });
      }

    });
    // })     


    return await listaUsuariosRol;
  }

  async listarRoles2(rolDestino: string) {
    // var listaUsuariosRol: any[]=await 

    this.usuarioCollection = this.dbfairebase.collection('Usuarios');

    this.usuarioList = await this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }
        );
      }));

    let resp: Usuario[] = await new Promise(resolve => {
      let result: Usuario[];
      result = [];
      this.usuarioList.subscribe(async usuarios => {
        usuarios.forEach(async usuario => {
          if (usuario.roles) {
            await usuario.roles.forEach(async rol => {
              console.log("Los roles son:" + rol.nombre + " = " + rolDestino);
              if (rol.nombre === rolDestino) {
                await result.push(usuario);
                await resolve(result);
              }
            });
          }
        });

      },
        error => {
          return error
        });
    });

    return resp;
  }


  listarNombreSiguiente(nombre, ultimoNombre: string, adelante: boolean) {
    console.log("nombre :" + nombre, "ultimo :" + ultimoNombre, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(ultimoNombre)) {
      this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('id').startAfter(ultimoNombre).limit(4));
        } else {
          this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('id').startAt(ultimoNombre).limit(4));
        }
      } else {
        this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));
        // if (adelante) {
        //   this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff').startAfter(ultimoNombre).limit(4));
        // } else {
        //   this.usuarioCollection = this.dbfairebase.collection('Usuarios', ref => ref.orderBy('nombre').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff').startAt(ultimoNombre).limit(4));
        // }
      }
    }

    this.usuarioList = this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.usuarioList;
  }

  getusuarionombre() {
    var citiesRef = this.dbfairebase.collection('Usuarios');
    this.dba.database.ref('/usuarios').once('value');
  }

  async setUsuarioSesion(usu:Usuario) {
    let usuario : Usuario[]= await this.getUsuarioWhere('id',usu.id);
    if(usuario.length>0){    
    var user = {
      id: usuario[0].id,
      nombre: usuario[0].nombre,
      apellidos: usuario[0].apellidos,
      email: usuario[0].email,
      login: usuario[0].login,
      foto: usuario[0].foto,
      roles: usuario[0].roles,
      puntos: usuario[0].puntos,
      categoria: usuario[0].categoria
    }
    sessionStorage.setItem(SESSION.usuarioSesion, this.util.encriptar(JSON.stringify(user)));
  }
  }

  getUsuarioSesion() {
    let sesiontemporal = localStorage.getItem(SESSION.sesiontemporal)
    let cryptoJSUsuario = "";
    if (sesiontemporal === 'true') {
      cryptoJSUsuario = localStorage.getItem(SESSION.usuarioSesion)
    } else {
      cryptoJSUsuario = sessionStorage.getItem(SESSION.usuarioSesion)
    }

    if (cryptoJSUsuario != null) {
      let usuarioSesion = JSON.parse(this.util.desencriptar(cryptoJSUsuario));
      this.usuarioSesion = usuarioSesion;
    } else {
      this.usuarioSesion = null;
    }
    return this.usuarioSesion;
  }

  setRolSession(rol: Rol) {
    console.log(rol);
    let sesiontemporal = localStorage.getItem(SESSION.rolSesion)
    if (sesiontemporal === 'true') {
      localStorage.setItem(SESSION.rolSesion, this.util.encriptar(JSON.stringify(rol)));
    } else {
      sessionStorage.setItem(SESSION.rolSesion, this.util.encriptar(JSON.stringify(rol)));
    }
    this._router.navigateByUrl("/principal");
  }

  getRolSesion() {
    let sesiontemporal = localStorage.getItem(SESSION.sesiontemporal)
    let cryptoJSRol = "";
    if (sesiontemporal === 'true') {
      cryptoJSRol = localStorage.getItem(SESSION.rolSesion)
    } else {
      cryptoJSRol = sessionStorage.getItem(SESSION.rolSesion)
    }
    if (cryptoJSRol != null) {
      let rolSesion = JSON.parse(this.util.desencriptar(cryptoJSRol));
      this.rolSesion = rolSesion;
    } else {
      this.rolSesion = null;
    }
    return this.rolSesion;
  }

  getRolChange() {
    let sesiontemporal = localStorage.getItem(SESSION.rolChange)
    let cryptoJSRol = "";
    if (sesiontemporal === 'true') {
      cryptoJSRol = localStorage.getItem(SESSION.rolChange)
    } else {
      cryptoJSRol = sessionStorage.getItem(SESSION.rolChange)
    }
    if (cryptoJSRol != null) {
      let rolChange_ = JSON.parse(this.util.desencriptar(cryptoJSRol));
      this.rolChange = rolChange_;
    } else {
      this.rolChange = null;
    }
    return this.rolChange;
  }

  setRolChange(rol: Rol) {
    let sesiontemporal = localStorage.getItem(SESSION.rolChange)
    if (sesiontemporal === 'true') {
      localStorage.setItem(SESSION.rolChange, this.util.encriptar(JSON.stringify(rol)));
    } else {
      sessionStorage.setItem(SESSION.rolChange, this.util.encriptar(JSON.stringify(rol)));
    }
  }

  checkLogin(): boolean {
    if (this.getUsuarioSesion() !== null) {
      return this.isLoggedIn = true;
    } else {
      return this.isLoggedIn = false;
    }
  }

  logOut() {
    localStorage.clear();
    sessionStorage.clear();
    this._router.navigate(['/login']);
  }

  async registrar(usuario: Usuario) {
    this.usuarioCollection = this.dbfairebase.collection('Usuarios');
    usuario.estado = "ACTIVO";
    usuario.fecha_create = new Date().getTime();
    usuario.puntos = 100;
    usuario.categoria = 'APRENDIZ';
    usuario.puntos = 100;

    let categoriausuario = await this._categoriaService.getWhereAsync('nivel', 0);
    if (categoriausuario.length > 0) {
      usuario.categoria = categoriausuario[0].id;
    }
    await this.usuarioCollection.add(usuario);
    let resp: Usuario[] = await this.getUsuarioWhere("identificacion", usuario.identificacion);
    if (resp.length > 0) {
      this.actualizar(resp[0]);
    }
  }

  actualizar(usuario: Usuario) {
    this.usuarioDoc = this.dbfairebase.doc('Usuarios/' + usuario.id + "");
    usuario.fecha_update = new Date().getTime();
    this.usuarioDoc.update(usuario);
  }

  async actualizarConFoto(usuario: Usuario, file_foto: File) {

    if (file_foto != null) {
      let url = await this._archivosServicie.registrar(Tipo_archivo.fotos, usuario.id, file_foto);
      usuario.foto = url;
    }
    this.actualizar(usuario);
  }


  eliminar(usuario: Usuario) {
    this.usuarioDoc = this.dbfairebase.doc('Usuarios/' + usuario.id + "");
    this.usuarioDoc.delete();
  }

  login(login: string, password: string, where: string) {
    this.usuarioCollection = this.dbfairebase.collection('Usuarios',
      ref => ref.where(where, '==', login)
        .where('password', '==', password))
    this.usuarioList = this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.usuarioList;
  }


  async getUsuarioWhere(where: string, value: any) {
    let resp: Usuario[] = await new Promise(resolve => {
      this.usuarioWhere(where, value).subscribe(usuarios => {
        resolve(usuarios);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  usuarioWhere(where: string, valor: any) {
    this.usuarioCollection = this.dbfairebase.collection('Usuarios',
      ref => ref.where(where, '==', valor))
    this.usuarioList = this.usuarioCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Usuario;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.usuarioList;
  }




}
