import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-risks',
  templateUrl: './risks.component.html',
  styleUrls: []
})
export class RisksComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
