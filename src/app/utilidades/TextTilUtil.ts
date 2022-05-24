import { Injectable } from "@angular/core";
import { CicloService } from "app/services/ciclo.service";
import {NgbDate, NgbCalendar} from '@ng-bootstrap/ng-bootstrap';
import * as CryptoJS from 'crypto-js';
import { Ciclo } from "app/models/ciclo";
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
const headers = new HttpHeaders()
    .set('Content-Type', 'undefined')
    .set('Access-Control-Allow-Origin', '*')
    .set('Access-Control-Allow-Methods', 'POST')
    .set('Access-Control-Allow-Headers', 'Origin')
    .set('Access-Control-Allow-Credentials', 'true');


@Injectable()
export class TextTilUtil {
    constructor() {
       
    }

  

    public jsonToDate(json: any): Date {
        console.log('ejecutando jsonToDate ++')
        console.log('entra--->' + JSON.stringify(json))
        let midate: Date;
        midate = new Date(json.year, json.month-1, json.day);
        console.log('sale--->' + midate)
        return midate
    }

    public dateToJson(fecha: Date): any {
        console.log('ejecutando dateToJson ---')
        console.log('entra--->' + fecha)
        let midate = {
            year: fecha.getFullYear(),
            month: fecha.getMonth()+1,
            day: fecha.getDate(),
        };
        console.log('sale--->' + JSON.stringify(midate))
        return midate;
    }

    public isStringVacio(valor: string): boolean {
        
        var vacio = false
        if (valor === null|| valor === undefined ||  valor.trim() === "" || valor.trim() === ''  ) {
            vacio = true;
        }
        console.log('entra String--->' + valor+' vacio:'+vacio)
        return vacio;
    }
    public isNumberVacio(valor: number): boolean {
        var vacio = false
        
        if ( valor === null ||valor === undefined  || valor === 0 ) {
            vacio = true;
        }
        
        console.log('entra numeric--->' + valor+' vacio:'+vacio)
        return vacio;
    }

    public valorStrint(valor: number): string {
        return new Intl.NumberFormat().format(valor);
    }

    

    public encriptar(text: string) {
        return CryptoJS.AES.encrypt(text, 'text-til').toString();
    }

    public desencriptar(text: string): string {
        return CryptoJS.AES.decrypt(text, 'text-til').toString(CryptoJS.enc.Utf8);
    }

    public encriptarSession(variable: string, text: string): void {
        sessionStorage.setItem(variable, this.encriptar(text));
    }

    public desencriptarSession(variable: string): any {
        let cryptoJSON = localStorage.getItem(variable)
        let result
        if (cryptoJSON != null) {
            result = JSON.parse(this.desencriptar(cryptoJSON));
        } else {
            result = 'no se encontro informacion';
            console.log(result);
        }
        return result;
    }

    async  getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();
        return new Promise((resolve, reject) => {
          var reader  = new FileReader();
          reader.addEventListener("load", function () {
              resolve(reader.result);
          }, false);
      
          reader.onerror = () => {
            return reject(this);
          };
          reader.readAsDataURL(blob);
        })
      }

      getFileOfBase64(dataurl:string,filename:string,format:string ) {        
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        let file = new File([u8arr], filename, {type: format})
        console.log(file);
        return file;
      }

      toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
      
        xhr.onload = function () {
            var reader = new FileReader();
            
            reader.onloadend = function () {
                
                callback(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
  
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

}