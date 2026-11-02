import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-heat-maps',
  templateUrl: './heat-maps.component.html',
  styleUrls: []
})
export class HeatMapsComponent implements OnInit {
  constructor(
  ) { }

  ngOnInit(): void {
  }
}
