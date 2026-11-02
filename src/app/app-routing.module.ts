// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminLayout } from './theme/layouts/admin-layout/admin-layout.component';
import { GuestLayoutComponent } from './theme/layouts/guest-layout/guest-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/default',
        loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./demo/component/basic-component/typography/typography.component').then((c) => c.TypographyComponent)
      },
      {
        path: 'color',
        loadComponent: () => import('./demo/component/basic-component/color/color.component').then((c) => c.ColorComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/others/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./demo/pages/users/components/users/users.component').then((c) => c.UsersComponent)
      },
      {
        path: 'users/add-user',
        loadComponent: () => import('./demo/pages/users/components/add-user/add-user.component').then((c) => c.AddUserComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./demo/pages/roles-permissions/roles-permissions.component').then((c) => c.RolesPermissionsComponent),
        children: [
          { path: '', redirectTo: 'rol', pathMatch: 'full' },
          {
            path: 'rol',
            loadComponent: () => import('./demo/pages/roles-permissions/roles/roles.component').then((c) => c.RolesComponent)
          },
          {
            path: 'add-rol',
            loadComponent: () => import('./demo/pages/roles-permissions/rol-store/rol-store.component').then((c) => c.RolStoreComponent)
          }
        ]
      },
      {
        path: 'password',
        loadComponent: () => import('./demo/pages/password/password.component').then((c) => c.PasswordComponent),
        children: [
          { path: '', redirectTo: 'change-pass', pathMatch: 'full' },
          {
            path: 'change-pass',
            loadComponent: () => import('./demo/pages/password/change-pass/change-pass.component').then((c) => c.ChangePassComponent)
          }
        ]
      },
      {
        path: 'projects',
        loadComponent: () => import('./demo/pages/projects/projects.component').then((c) => c.ProjectsComponent),
        children: [
          { path: '', redirectTo: 'project', pathMatch: 'full' },
          {
            path: 'project',
            loadComponent: () => import('./demo/pages/projects/project/project.component').then((c) => c.ProjectComponent)
          },
          {
            path: 'add-project',
            loadComponent: () => import('./demo/pages/projects/add-project/add-project.component').then((c) => c.AddProjectComponent)
          }
        ]
      },
      {
        path: 'processes',
        loadComponent: () => import('./demo/pages/processes/processes.component').then((c) => c.ProcessesComponent),
        children: [
          { path: '', redirectTo: 'process', pathMatch: 'full' },
          {
            path: 'process',
            loadComponent: () => import('./demo/pages/processes/process/process.component').then((c) => c.ProcessComponent)
          },
          {
            path: 'add-process',
            loadComponent: () => import('./demo/pages/processes/add-process/add-process.component').then((c) => c.AddProcessComponent)
          }
        ]
      },
      {
        path: 'risks',
        loadComponent: () => import('./demo/pages/risks/risks.component').then((c) => c.RisksComponent),
        children: [
          { path: '', redirectTo: 'risk', pathMatch: 'full' },
          {
            path: 'risk',
            loadComponent: () => import('./demo/pages/risks/risk/risk.component').then((c) => c.RiskComponent)
          },
          {
            path: 'add-risk',
            loadComponent: () => import('./demo/pages/risks/add-risk/add-risk.component').then((c) => c.AddRiskComponent)
          }
        ]
      },
      {
        path: 'causes',
        loadComponent: () => import('./demo/pages/causes/causes.component').then((c) => c.CausesComponent),
        children: [
          { path: '', redirectTo: 'cause', pathMatch: 'full' },
          {
            path: 'cause',
            loadComponent: () => import('./demo/pages/causes/cause/cause.component').then((c) => c.CauseComponent)
          },
          {
            path: 'add-cause',
            loadComponent: () => import('./demo/pages/causes/add-cause/add-cause.component').then((c) => c.AddCauseComponent)
          }
        ]
      },
      {
        path: 'controls',
        loadComponent: () => import('./demo/pages/controls/controls.component').then((c) => c.ControlsComponent),
        children: [
          { path: '', redirectTo: 'control', pathMatch: 'full' },
          {
            path: 'control',
            loadComponent: () => import('./demo/pages/controls/control/control.component').then((c) => c.ControlComponent)
          },
          {
            path: 'add-control',
            loadComponent: () => import('./demo/pages/controls/add-control/add-control.component').then((c) => c.AddControlComponent)
          },
          {
            path: 'params',
            loadComponent: () => import('./demo/pages/controls/add-params/add-params.component').then((c) => c.AddParamsComponent)
          }
        ]
      },
      {
        path: 'events',
        loadComponent: () => import('./demo/pages/events/events.component').then((c) => c.EventsComponent),
        children: [
          { path: '', redirectTo: 'event', pathMatch: 'full' },
          {
            path: 'event',
            loadComponent: () => import('./demo/pages/events/event/event.component').then((c) => c.EventComponent)
          },
          {
            path: 'add-event',
            loadComponent: () => import('./demo/pages/events/add-event/add-event.component').then((c) => c.AddEventComponent)
          }
        ]
      },
      {
        path: 'plans',
        loadComponent: () => import('./demo/pages/plans/plans.component').then((c) => c.PlansComponent),
        children: [
          { path: '', redirectTo: 'plan', pathMatch: 'full' },
          {
            path: 'plan',
            loadComponent: () => import('./demo/pages/plans/plan/plan.component').then((c) => c.PlanComponent)
          },
          {
            path: 'add-plan',
            loadComponent: () => import('./demo/pages/plans/add-plan/add-plan.component').then((c) => c.AddPlanComponent)
          }
        ]
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./demo/pages/evaluations/evaluations.component').then((c) => c.EvaluationsComponent),
        children: [
          { path: '', redirectTo: 'evaluation', pathMatch: 'full' },
          {
            path: 'evaluation',
            loadComponent: () => import('./demo/pages/evaluations/evaluation/evaluation.component').then((c) => c.EvaluationComponent)
          },
          {
            path: 'add-evaluation',
            loadComponent: () =>
              import('./demo/pages/evaluations/add-evaluation/add-evaluation.component').then((c) => c.AddEvaluationComponent)
          }
        ]
      },
      {
        path: 'map',
        loadComponent: () => import('./demo/pages/heat-maps/heat-maps.component').then((c) => c.HeatMapsComponent),
        children: [
          { path: '', redirectTo: 'map', pathMatch: 'full' },
          {
            path: 'map',
            loadComponent: () => import('./demo/pages/heat-maps/heat-map/heat-map.component').then((c) => c.HeatMapComponent)
          }
        ]
      }
    ]
  },
  {
    path: '',
    component: GuestLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./demo/pages/authentication/auth-login/auth-login.component').then((c) => c.AuthLoginComponent)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./demo/pages/authentication/auth-register/auth-register.component').then((c) => c.AuthRegisterComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
