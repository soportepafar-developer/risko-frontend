import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-reports',
  template: '<router-outlet></router-outlet>'
})
export class ReportsComponent {}

