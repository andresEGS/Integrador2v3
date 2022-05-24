import { Injectable } from '@angular/core';
import { formatDate } from "@angular/common";
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2'

//Modelos

declare var $: any;

@Injectable()
export class Messages {


    constructor() {

    }


    showNotification(type, from, align, msg) {
        // const type = ['', 'info', 'success', 'warning', 'danger'];

        $.notify({
            icon: "notifications",
            message: msg

        }, {
            type: type,
            timer: 3000,
            placement: {
                from: from,
                align: align
            },
            template: '<div data-notify="" style="z-index: 2000;" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
                '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss" >  <i class="material-icons">close</i></button>' +
                '<i class="material-icons" data-notify="icon">notifications</i> ' +
                '<span data-notify="title">{1}</span> ' +
                '<span data-notify="message">{2}</span>' +
                '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                '</div>' +
                '<a href="{3}" target="{4}" data-notify="url"></a>' +
                '</div>'
        });


    }

    msgWarning(msg: string) {
        Swal.fire({
            position: 'center',
            icon: 'warning',
            title: 'ALERTA!',
            text: msg,
            timer: 3500

        })
        // this.showNotification('warning', 'top', 'cencet', msg);
    }
    msgWarningmodal(msg: string, modal: boolean) {
        if (modal) {
            this.msgWarning(msg);
        }
        else {
            this.showNotification('warning', 'top', 'cencet', msg);
        }
        // 
    }
    msgDanger(msg: string) {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'ERROR',
            text: msg,
            timer: 3500

        })
        // this.showNotification('danger', 'top', 'cencet', msg);
    }
    msgSuccess(msg: string) {
        Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: msg,
            showConfirmButton: false,
            timer: 1500
        })
        // this.showNotification('success', 'top', 'cencet', msg);
    }
    msgSuccessCenter(msg: string) {
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: msg,
            showConfirmButton: false,
            timer: 5500
        })
        // this.showNotification('success', 'top', 'cencet', msg);
    }
    msgInfo(msg: string) {
        this.showNotification('info', 'top', 'cencet', msg);
    }

    msgRespuesta(correcta: boolean, msg: string) {
        if (correcta) { 
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'EXCELENTE',
                text: msg,
                showConfirmButton: false,
                timer: 2500
            })

        } else { 
            Swal.fire({
                position: 'center',
                icon: 'error',
                title: 'MEJOR SUERTE EN LA SIGUEINTE',
                text: msg,
                showConfirmButton: false,
                timer: 2500
    
            })
        }
       
    
}

msgSubirrango( msg: string,nivel:number) {    
        Swal.fire({
            position: 'center',
            imageUrl: './assets/img/rango'+(nivel+1)+'.png',
            title: 'FELICITACIONES!!!',
            text: msg,
            showConfirmButton: false,
            timer: 4500
        })

     
   

}

msgInfoModal(msg: string) {
    Swal.fire(msg)
}

}