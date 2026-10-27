import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CodePreviewModule } from '../../partials/code-preview/code-preview.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { FeatherIconModule } from '../../../core/feather-icon/feather-icon.module';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SharedModule } from '../../shared/shared.module';
import { PlansComponent } from './plans.component';
import { PlanComponent } from './plan/plan.component';
import { AddPlanComponent } from './add-plan/add-plan.component';
import { AddActivityComponent } from './plan/add-activity/add-activity.component';



const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


const routes: Routes = [
  {
    path: '',
    component: PlansComponent,
    children: [
      {
        path: '',
        redirectTo: 'plan',
        pathMatch: 'full'
      },
      {
        path: 'plan',
        component: PlanComponent
      },
      {
        path: 'add-plan',
        component: AddPlanComponent
      },
    ]
  }
]

@NgModule({
  declarations: [PlansComponent, PlanComponent, AddPlanComponent, AddActivityComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CodePreviewModule,
    NgbModule,
    PerfectScrollbarModule,
    FormsModule,
    FeatherIconModule,
    SharedModule
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class PlansModule { }
