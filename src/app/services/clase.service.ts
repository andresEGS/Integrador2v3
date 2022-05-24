import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreCollectionGroup, AngularFirestoreDocument } from '@angular/fire/firestore';

import { Observable, combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Clase } from '../models/clase';
import { SESSION } from './session';
import { Router } from '@angular/router';
import { TextTilUtil } from 'app/utilidades/TextTilUtil';
import { HttpClient } from '@angular/common/http';
import { Rol } from '../models/rol';
import { Tipo_archivo } from './tipo_archivo';
import { ArchivoService } from './archivo.service';

@Injectable({
  providedIn: 'root'
})
export class ClaseService {
  claseCollection: AngularFirestoreCollection<Clase>;
  claseCollectionGrupo: AngularFirestoreCollectionGroup<Clase>;
  claseList: Observable<Clase[]>;
  claseDoc: AngularFirestoreDocument<Clase>;
  claseSesion = [] as Clase;
  rolSesion = [] as Rol;
  rolChange = [] as Rol;
  isLoggedIn: boolean = false;
  redirectUrl: string;


  constructor( private util: TextTilUtil, public dbfairebase: AngularFirestore, public dba: AngularFireDatabase, private http: HttpClient) {

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
      this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('anio').limit(pageSize));
    } else {
      if (this.util.isStringVacio(ValorSearch)) {
        if (adelante) {
          this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('anio').startAfter(nextpage).limit(pageSize));
        } else {
          this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('anio').startAt(nextpage).limit(pageSize));
        }
      } else {
        this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('anio').orderBy(tipoSearch).startAt(ValorSearch).endAt(ValorSearch + '\uf8ff').limit(pageSize));

      }
    }

    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }

  listar() {
    this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('fecha_inicio',"desc"));
    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
                }

        );
      }))
    return this.claseList;
  }

  async listarAsync() {
    let resp: Clase[] = await new Promise(resolve => {
      this.listar().subscribe(clases => {
        resolve(clases);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  
 
  listarNombreSiguiente(nombre, nombreindicador: string, adelante: boolean) {
    console.log("nombre :" + nombre, "indicador :" + nombreindicador, "adelante :" + adelante);
    if (this.util.isStringVacio(nombre) && this.util.isStringVacio(nombreindicador)) {
      this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('id').limit(4));
    } else {
      if (this.util.isStringVacio(nombre)) {
        if (adelante) {
          this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('id').startAfter(nombreindicador).limit(4));
        } else {
          this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('id').startAt(nombreindicador).limit(4));
        }
      } else {
        this.claseCollection = this.dbfairebase.collection('Clases', ref => ref.orderBy('grupo').orderBy('id').startAt(nombre).endAt(nombre + '\uf8ff'));
      }
    }

    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }

  getclasenombre() {
    var citiesRef = this.dbfairebase.collection('Clases');
    this.dba.database.ref('/clases').once('value');
  }


  async registrar(clase: Clase) {
    this.claseCollection = this.dbfairebase.collection('Clases');
    clase.estado = "ACTIVA";
    clase.fecha_create = new Date().getTime();
    this.claseCollection.add(clase);
    let buscar: Clase[] = await this.getClase(clase);
    if (buscar.length == 0) {
      this.claseCollection.add(clase);
      let resp: Clase[] = await this.getClase(clase);
      if (resp.length > 0) {
        this.actualizar(resp[0]);
      }
    } else {
      this.actualizar(buscar[0]);
    }
  }

  actualizar(clase: Clase) {
    this.claseDoc = this.dbfairebase.doc('Clases/' + clase.id + "");
    this.claseDoc.update(clase);
  }
  async actualizarClase(clase: Clase,alumno:any) {
    this.claseDoc = this.dbfairebase.doc('Clases/' + clase.id + "");
    let resp: Clase[] = await this.getClase(clase);
    if (resp.length > 0) {
      resp[0].alumnos.push(alumno);
      this.actualizar(resp[0]);
    }
  }




  eliminar(clase: Clase) {
    this.claseDoc = this.dbfairebase.doc('Clases/' + clase.id + "");
    this.claseDoc.delete();
  }




  async getClaseWhere(where: string, value: any) {
    let resp: Clase[] = await new Promise(resolve => {
      this.claseWherePromesa(where, value).subscribe(clases => {
        resolve(clases);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  async ListarClaseAnioCiclo(anio: number, ciclo: string) {
    let resp: Clase[] = await new Promise(resolve => {
      this.clasesAnioCilo(anio, ciclo).subscribe(clases => {
        resolve(clases);
      },
        error => {
          return error
        });
    });
    return resp;
  }
  async ListarClaseAnioCicloInstructorEspecialidad(clase:Clase) {
    let resp: Clase[] = await new Promise(resolve => {
      this.clasesAnioCiloInstructorEspecialidad(clase).subscribe(clases => {
        resolve(clases);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  claseWherePromesa(where: string, valor: any) {
    this.claseCollection = this.dbfairebase.collection('Clases',
      ref => ref.where(where, '==', valor))
    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }


  async getClase(clase: Clase) {
    let resp: Clase[] = await new Promise(resolve => {
      this.claseEquals(clase).subscribe(clase => {
        resolve(clase);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  claseEquals(clase: Clase) {
    this.claseCollection = this.dbfairebase.collection('Clases',
      ref => ref.where('anio', '==', clase.anio)
        .where('grupo', '==', clase.grupo)
        .where('instructor', '==', clase.instructor)
        .where('especialidad', '==', clase.especialidad)
        .where('ciclo', '==', clase.ciclo))
    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }
  clasesAnioCilo(anio: number,ciclo :string) {
    this.claseCollection = this.dbfairebase.collection('Clases',
      ref => ref.where('anio', '==', anio)
        .where('ciclo', '==', ciclo))
    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }
  clasesAnioCiloInstructorEspecialidad(clase:Clase) {
    this.claseCollection = this.dbfairebase.collection('Clases',
      ref => ref.where('anio', '==', clase.anio)
        .where('ciclo', '==', clase.ciclo)
        .where('instructor', '==', clase.instructor)
        .where('especialidad', '==', clase.especialidad))
    this.claseList = this.claseCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Clase;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.claseList;
  }
}
