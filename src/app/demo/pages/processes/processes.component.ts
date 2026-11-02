import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: []
})
export class ProcessesComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
