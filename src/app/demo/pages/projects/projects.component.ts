import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: []
})
export class ProjectsComponent implements OnInit {
  constructor(
  ) { }

  ngOnInit(): void {
  }
}
