import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: []
})
export class ControlsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
