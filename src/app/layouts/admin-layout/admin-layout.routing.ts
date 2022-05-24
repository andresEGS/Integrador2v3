import { Routes } from '@angular/router';

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
import { AuthGuard } from 'app/utilidades/AuthGuard';
import { RolesComponent } from 'app/roles/roles.component';
import { UsuariosComponent } from 'app/usuarios/usuarios.component';
import { ArticulosComponent } from "app/articulos/articulos.component";
import { InstructorComponent } from 'app/instructor/instructor.component';
import { ValidarSolicitudComponent } from 'app/instructor/solicitar/validar.component';
import { MenuComponent } from 'app/menu/menu.component';
import { CiclosComponent } from 'app/ciclos/ciclos.component';
import { TemaComponent } from 'app/temas/temas.component';
import { TemaUsuarioComponent } from 'app/teama_usuario/tema_usuario.component';
import { PreguntasComponent } from 'app/preguntas/preguntas.component';
import { PreguntasUsuarioComponent } from 'app/preguntas_usuario/preguntas_usuario.component';
import { RanckingComponent } from 'app/rancking/ranking.component';
import { CarritoComponent } from 'app/carrito/carrito.component';
import { TiendaComponent } from 'app/tienda/tienda.component';
import { MicarritoComponent } from 'app/micarrito/micarrito.component';

export const AdminLayoutRoutes: Routes = [
    // {
    //   path: '',
    //   children: [ {
    //     path: 'dashboard',
    //     component: DashboardComponent
    // }]}, {
    // path: '',
    // children: [ {
    //   path: 'userprofile',
    //   component: UserProfileComponent
    // }]
    // }, {
    //   path: '',
    //   children: [ {
    //     path: 'icons',
    //     component: IconsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'notifications',
    //         component: NotificationsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'maps',
    //         component: MapsComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'typography',
    //         component: TypographyComponent
    //     }]
    // }, {
    //     path: '',
    //     children: [ {
    //         path: 'upgrade',
    //         component: UpgradeComponent
    //     }]
    // }
    { path: 'principal', component: PrincipalComponent ,canActivate: [AuthGuard]},
    
    
    
    { path: 'carrito', component: CarritoComponent,canActivate: [AuthGuard]},
    { path: 'tienda', component: TiendaComponent,canActivate: [AuthGuard]},
    { path: 'micarrito', component: MicarritoComponent,canActivate: [AuthGuard]},
    { path: 'pedidos', component: PedidosComponent,canActivate: [AuthGuard]},
    
    
    
    
    { path: 'tema', component: TemaComponent,canActivate: [AuthGuard] },
    { path: 'tema_usuario', component: TemaUsuarioComponent,canActivate: [AuthGuard] },
    { path: 'preguntas', component: PreguntasComponent,canActivate: [AuthGuard] },
    { path: 'preguntas_usuario', component: PreguntasUsuarioComponent,canActivate: [AuthGuard] },
    { path: 'rangos', component: PreguntasUsuarioComponent,canActivate: [AuthGuard] },
    { path: 'ranking', component: RanckingComponent,canActivate: [AuthGuard] },
    { path: 'articulos', component: ArticulosComponent,canActivate: [AuthGuard]},
   
    


    { path: 'roles', component: RolesComponent ,canActivate: [AuthGuard]},
    { path: 'user-profile', component: UserProfileComponent,canActivate: [AuthGuard] },
    { path: 'usuarios', component: UsuariosComponent,canActivate: [AuthGuard] },
    { path: 'validar-solicitud', component: ValidarSolicitudComponent,canActivate: [AuthGuard] },
    { path: 'menu', component: MenuComponent ,canActivate: [AuthGuard]},
    { path: 'ciclo', component: CiclosComponent ,canActivate: [AuthGuard]},

    
    



    { path: 'piezas', component: PiezasComponent,canActivate: [AuthGuard]},
    
    { path: 'dashboard', component: DashboardComponent,canActivate: [AuthGuard] },
        
    
    
    { path: 'table-list', component: TableListComponent,canActivate: [AuthGuard]},
    { path: 'typography', component: TypographyComponent,canActivate: [AuthGuard] },
    { path: 'icons', component: IconsComponent,canActivate: [AuthGuard]},
    { path: 'maps', component: MapsComponent,canActivate: [AuthGuard]},
    { path: 'notifications', component: NotificationsComponent,canActivate: [AuthGuard]},
    { path: 'upgrade', component: UpgradeComponent,canActivate: [AuthGuard]},
];
