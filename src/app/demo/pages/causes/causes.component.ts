import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-causes',
  templateUrl: './causes.component.html',
  styleUrls: []
})
export class CausesComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
