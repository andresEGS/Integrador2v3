import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule ,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';


import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TableListComponent } from './table-list/table-list.component';
import { TypographyComponent } from './typography/typography.component';
import { IconsComponent } from './icons/icons.component';
import { MapsComponent } from './maps/maps.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import {
  AgmCoreModule
} from '@agm/core';
import { AngularFireModule } from '@angular/fire';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { environment } from 'environments/environment';
import { LoginComponent } from './login/login.component';
import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule, AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { AuthGuard } from './utilidades/AuthGuard';
import { RedirectIfLoggedInGuard } from './utilidades/RedirectIfLoggedInGuard';
import { Messages } from './utilidades/Messages';
import { HttpClientModule } from '@angular/common/http';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { Page404Component } from './page404/page404.component';
import { NgxSpinnerModule,NgxSpinnerService } from 'ngx-spinner';


import {
  MatButtonModule,
  MatInputModule,
  MatRippleModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSelectModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatRadioModule,
  MatListModule,
  MatIconModule,
  MatSliderModule  

} from '@angular/material';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'angular-bootstrap-md';
import { NgbModule,NgbProgressbar,NgbProgressbarConfig } from '@ng-bootstrap/ng-bootstrap';
import { TextTilUtil } from './utilidades/TextTilUtil';
import { ActualizarPerdidoComponent } from './modal/actualizar-perdido/actualizar-perdido.component';
import { AlertModule } from 'ngx-alerts';
import * as Hammer from 'hammerjs';
import { LoadingComponent } from './loading/loading.component';
import { CicloService } from './services/ciclo.service';



export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL },
    'pinch': { enable: false },
    'rotate': { enable: false }
  };
}


@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatRippleModule,
    MatInputModule,    
    MatSelectModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatListModule,
    ModalModule,
    NgbModule,
    MatIconModule,    
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    ReactiveFormsModule,
    HttpModule, 
    ComponentsModule,
    MatRadioModule,
    HttpClientModule,
    RouterModule,
    MatSliderModule,
    AngularFireModule.initializeApp(environment.firebase),
    //  AlertModule.forRoot({ maxMessages: 5, timeout: 5000 }),
    MDBBootstrapModule.forRoot(),
    // NgxSpinnerModule,
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
    })
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
    Page404Component,
    ActualizarPerdidoComponent,
    LoadingComponent

  ],
  providers: [
    AuthGuard,
    RedirectIfLoggedInGuard,
    AngularFirestore,
    AngularFireDatabase,
    Messages,
    CicloService,
    TextTilUtil,
    NgxSpinnerService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
