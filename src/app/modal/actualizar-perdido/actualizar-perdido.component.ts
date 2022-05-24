import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-actualizar-perdido',
  templateUrl: './actualizar-perdido.component.html',
  styleUrls: ['./actualizar-perdido.component.css']
})
export class ActualizarPerdidoComponent implements OnInit {

  constructor(private modalService: NgbModal, public activeModal: NgbActiveModal) { }

  open() {
    alert('si hace')
  }
  ngOnInit() {
  }

}
