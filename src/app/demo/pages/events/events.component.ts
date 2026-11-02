import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit } from '@angular/core';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: []
})
export class EventsComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {

  }
}
