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
import { ControlsComponent } from './controls.component';
import { ControlComponent } from './control/control.component';
import { AddControlComponent } from './add-control/add-control.component';
import { AddParamsComponent } from './add-params/add-params.component';


const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


const routes: Routes = [
  {
    path: '',
    component: ControlsComponent,
    children: [
      {
        path: '',
        redirectTo: 'control',
        pathMatch: 'full'
      },
      {
        path: 'control',
        component:ControlComponent
      },
      {
        path: 'add-control',
        component: AddControlComponent
      },
      {
        path: 'params',
        component: AddParamsComponent
      }
    ]
  }
]

@NgModule({
  declarations: [ControlsComponent, ControlComponent, AddControlComponent, AddParamsComponent],
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
export class ControlsModule { }
