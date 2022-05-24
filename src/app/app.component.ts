import { Component, OnInit} from '@angular/core';
import {NgxSpinnerService} from 'ngx-spinner';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(private _spinnerService: NgxSpinnerService) { }
  

  ngOnInit() {
     this._spinnerService.show();
    setTimeout(() => {
      this._spinnerService.hide();
    }, 2000);
  }
}
