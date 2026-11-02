import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: []
})
export class EvaluationsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
