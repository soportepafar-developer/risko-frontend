import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: []
})
export class RolesPermissionsComponent implements OnInit {
  constructor(
  ) { }

  ngOnInit(): void {
  }
}
