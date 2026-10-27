import { GetMenuOptions } from './../../../core/resolvers/user.resolver';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './../../../core/guard/auth.guard';
import { BaseComponent } from '../../layout/base/base.component';
import { RoleGuard } from 'src/app/core/guard/role.guard';
//import { NotificationResolver } from '../../../core/resolvers/notification.resolver';

const routes: Routes = [
  { path: '',
    component: BaseComponent,
    canActivate: [AuthGuard],
    resolve:{
      options: GetMenuOptions,
      //notifications: NotificationResolver
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'users',
        loadChildren: () => import('../users/users.module').then(m => m.UsersModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR'] }
      },
      {
        path: 'password',
        loadChildren: () => import('../password/password.module').then(m => m.PasswordModule),
      },
      {
        path: 'roles',
        loadChildren: () => import('../roles-permissions/roles-permissions.module').then(m => m.RolesPermissionsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR'] }
      },
      {
        path: 'projects',
        loadChildren: () => import('../projects/projects.module').then(m => m.ProjectsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'processes',
        loadChildren: () => import('../processes/processes.module').then(m => m.ProcessesModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'risks',
        loadChildren: () => import('../risks/risks.module').then(m => m.RisksModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'causes',
        loadChildren: () => import('../causes/causes.module').then(m => m.CausesModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'controls',
        loadChildren: () => import('../controls/controls.module').then(m => m.ControlsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'events',
        loadChildren: () => import('../events/events.module').then(m => m.EventsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'plans',
        loadChildren: () => import('../plans/plans.module').then(m => m.PlansModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'evaluations',
        loadChildren: () => import('../evaluations/evaluations.module').then(m => m.EvaluationsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_ANALISTA'] }
      },
      {
        path: 'map',
        loadChildren: () => import('../heat-maps/heat-maps.module').then(m => m.HeatMapsModule),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMINISTRADOR'] }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
