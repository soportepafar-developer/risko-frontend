import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: []
})
export class PlansComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
