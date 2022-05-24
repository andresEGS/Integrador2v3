import { Component, OnInit } from '@angular/core';
// import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  // constructor(private _spinnerService: NgxSpinnerService) { }

  ngOnInit() {
    // this._spinnerService.show();
    // setTimeout(() => {
    //   this._spinnerService.hide();
    // }, 2000);
  }

  // showSpinner() {
  //   this._spinnerService.show();
  //   setTimeout(() => {
  //     this._spinnerService.hide();
  //   }, 3000);
  // }

}
