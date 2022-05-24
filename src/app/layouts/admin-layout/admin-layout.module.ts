import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { MapsComponent } from '../../maps/maps.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { UpgradeComponent } from '../../upgrade/upgrade.component';


import { PrincipalComponent } from 'app/principal/principal.component';
import { PiezasComponent } from 'app/piezas/piezas.component';
import { PedidosComponent } from 'app/pedidos/pedidos.component';
import { UsuariosComponent } from 'app/usuarios/usuarios.component';
import { GraficasComponent } from 'app/graficas/graficas.component';

// import { NgxSpinnerModule } from 'ngx-spinner';

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
  MatGridListModule,
  MatTabsModule,
  MatButtonToggleModule,
  MatProgressBarModule,
  MatSliderModule,
  MatProgressSpinnerModule
  
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'angular-bootstrap-md';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RolesComponent } from 'app/roles/roles.component';
import { EspecialidadComponent } from 'app/especialidades/especialidades.component';
import { InstructorComponent } from 'app/instructor/instructor.component';
import { ValidarSolicitudComponent } from 'app/instructor/solicitar/validar.component';
import { MenuComponent } from 'app/menu/menu.component';
import { CiclosComponent } from 'app/ciclos/ciclos.component';
import { TemaComponent } from 'app/temas/temas.component';
import { TemaUsuarioComponent } from 'app/teama_usuario/tema_usuario.component';
import { PreguntasComponent } from 'app/preguntas/preguntas.component';
import { PreguntasUsuarioComponent } from 'app/preguntas_usuario/preguntas_usuario.component';
import { RanckingComponent } from 'app/rancking/ranking.component';
import { ArticulosComponent } from 'app/articulos/articulos.component';
import { CarritoComponent } from 'app/carrito/carrito.component';
import { TiendaComponent } from 'app/tienda/tienda.component';
import { MicarritoComponent } from 'app/micarrito/micarrito.component';


@NgModule({
  imports: [
    RouterModule.forChild(AdminLayoutRoutes),
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
    MatRadioModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatListModule,
    ModalModule,
    MatIconModule,
    MatGridListModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatSliderModule
    // NgxSpinnerModule,
  ],
  declarations: [
    PrincipalComponent,
    TemaComponent,
    TemaUsuarioComponent,
    ArticulosComponent,
    CarritoComponent,
    TiendaComponent,
    MicarritoComponent,
    PreguntasComponent,
    PreguntasUsuarioComponent,   
    PiezasComponent,
    RolesComponent,
    PedidosComponent,
    UsuariosComponent,
    EspecialidadComponent,
    RanckingComponent,
    MenuComponent,
    CiclosComponent,
    GraficasComponent,
    DashboardComponent,
    UserProfileComponent,
    InstructorComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    ValidarSolicitudComponent,
    MapsComponent,
    NotificationsComponent,
    UpgradeComponent
    
  ]
})

export class AdminLayoutModule {}
