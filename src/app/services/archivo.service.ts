import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { Archivo } from '../models/archivo';
import { map } from 'rxjs/operators';
import { Especialidad } from 'app/models/especialidad';
import { HttpClient } from '@angular/common/http';
import { API } from './ApiConf';
import { Clase } from 'app/models/clase';
import { Instructor } from 'app/models/instructor';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class ArchivoService {
  archivoCollection: AngularFirestoreCollection<Archivo>;
  archivosList: Observable<Archivo[]>;
  archivoDoc: AngularFirestoreDocument<Archivo>;
  constructor( public dbfairebase: AngularFirestore,
    private http: HttpClient,
    private _spinnerService: NgxSpinnerService,
    public storage: AngularFireStorage) {
      this.archivoCollection = this.dbfairebase.collection('Archivos');
     }

  private basePath: string = '/Archivos';


  //Tarea para subir archivo
  
  public registrarCloudStorage(tipo_archivo:string,nombreArchivo: string, dato: any) {
    // return this.storage.upload(nombreArchivo, dato);
  return this.storage.upload(tipo_archivo+"/"+nombreArchivo, dato);
  }

  

  toDataURL(callback) {
   
    this.storage.ref('FIRMAS/F7ib8e6QWEk5cAfl1Vbn.png').getDownloadURL().subscribe(function(url) {
      // `url` is the download URL for 'images/stars.jpg'
    
      // This can be downloaded directly:
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        var blob = xhr.response;
        var reader = new FileReader();
            
        reader.onloadend = function () {
            
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.send();
    
      // Or inserted into an <img> element:
      var img = document.getElementById('myimg');
    })
 
}

  public eliminarCloudStorage(tipo_archivo:string,nombreArchivo: string) {
    // return this.storage.upload(nombreArchivo, dato);
    return this.storage.ref(tipo_archivo+"/"+nombreArchivo).delete();
  }

  //Referencia del archivo
  async  referenciaCloudStorage(tipo_archivo:string,nombreArchivo: string) {
    console.log(tipo_archivo+"/"+nombreArchivo);
    return this.storage.ref(tipo_archivo+"/"+nombreArchivo);
  }

  async registrar(tipo_archivo:string,nombre:string,archivo: any) {    
    this.archivoCollection = this.dbfairebase.collection('Archivos');
    let archivebd={}as Archivo;
    await this.registrarCloudStorage(tipo_archivo,nombre+".png",archivo);
    let referencia = await this.referenciaCloudStorage(tipo_archivo,nombre+".png");
    let resp = await new Promise(resolve => {
      referencia.getDownloadURL().subscribe(url => {
        resolve(url);
      },
        error => {
          return error
        });
    });
     return resp+"";
     
  }


  actualizar(proyecto: Archivo) {
    this.archivoDoc = this.dbfairebase.doc('Archivos/' + proyecto.id + "");
    this.archivoDoc.get
    this.archivoDoc.update(proyecto);
  }

  eliminar(proyecto: Archivo) {
    this.archivoDoc = this.dbfairebase.doc('Archivos/' + proyecto.id + "");
    this.archivoDoc.delete();
  }


  listar() {
    this.archivoCollection = this.dbfairebase.collection('Archivos');
    this.archivosList = this.archivoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Archivo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.archivosList;
  }

  getarchivo(tipo: string, nombre: string) {
    this.archivoCollection = this.dbfairebase.collection('Archivos',
      ref => ref.where('nombre', '==', nombre)
        .where('tipo', '==', tipo))
   this.archivosList = this.archivoCollection.snapshotChanges().pipe(
      map(action => {
        return action.map(a => {
          const data = a.payload.doc.data() as Archivo;
          data.id = a.payload.doc.id;
          return data;
        }

        );
      }))
    return this.archivosList;
  }

  async getArchivoAsync(tipo: string, nombre: any) {
    let resp: Archivo[] = await new Promise(resolve => {
      this.getarchivo(tipo, nombre).subscribe(archivos => {
        resolve(archivos);
      },
        error => {
          return error
        });
    });
    return resp;
  }

  async generacionMasiva(especialidad :Especialidad,clase :Clase, instructor:Instructor,lista, tipo) {
    try{ 
      console.log(especialidad);
      console.log(clase);
      console.log(instructor);
      console.log(lista);
      console.log(tipo);

      await  this._spinnerService.show();
    let object = {}
    let urlCertificado = especialidad.certificado;
    let re = /\./gi;
    let result = urlCertificado.replace('token', "token_certificado");
    let resp = await this.getReporte(clase.especialidad_nombre, JSON.stringify(lista), 'fondo', object, tipo, instructor.firma, result, clase.fecha_cierre + "").toPromise();
    if (resp) {
      let newPdfWindow = window.open("", "Print");
      let content = encodeURIComponent(resp.byteString);
      let iframeStart = "<\iframe width='100%' height='100%' src='data:application/pdf;base64,";
      let iframeEnd = "'><\/iframe>";
      newPdfWindow.document.write(iframeStart + content + iframeEnd);
    }
    
    await  this._spinnerService.hide();
    return resp;
   } catch (error) {
    console.log(error);
    await  this._spinnerService.hide();
  }
  }

  getReporte(name_report: string, lista: string, nameImage: string, object?: Object, tipo?: string, file_firma_istructor?: string,certificado_url?:string,fecha_cierre?:string): Observable<any> {
    let parameters = new URLSearchParams();
    for (let property in object) {
      parameters.set(property, object[property]);
    }
    const httpOptions = {
      /* 'responseType'  : 'arraybuffer' as 'json' */
      headers: {
        'Content-Type': 'multipart/form-data;boundary='
      },
      'responseType': 'blob' as 'json'        //This also worked
    };
     return this.http.get<any>(API.host+`diplomas?name_report=${name_report}&lista=${lista}&nameImage=${nameImage}&tipo=${tipo}&file_firma_istructor=${file_firma_istructor}&certificado_url=${certificado_url}&fecha_fin=${fecha_cierre}`);
  }

 
}