import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ModalGenericComponent } from 'src/app/views/shared/components/modal-generic/modal-generic.component';
import { Events } from 'src/app/core/models/Risk/event';
import { EventService } from 'src/app/core/services/Riesgo/event.service';
import { ModalRiskComponent } from 'src/app/views/shared/components/modal-risk/modal-risk.component';


@Component({
  selector: 'app-event',
  templateUrl: './event.component.html'
})
export class EventComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Events>;
  eventsList: Events[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
      private eventService: EventService,
      private router: Router,
      public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(){
    this.eventService.getAll().subscribe((data: Events[]) => {
      this.eventsList = data;
      this.initTable(data);
    });
  }

  initTable(event: Events[]){
    this.dataSource = new MatTableDataSource(event);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.loading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onProcess(row: Events){ 
    this.matDialog.open(ModalGenericComponent, {
      data: { entity: row.processes, title: 'Procesos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-procesos'
    });
  }

  onCause(row: Events){
    this.matDialog.open(ModalGenericComponent, { 
      data: { entity: row.causes, title: 'Causas' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-causas'
    });
  }

  onControl(row: Events){ 
    this.matDialog.open(ModalGenericComponent, { 
      data: { entity: row.controls, title: 'Controles' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onResponsible(row: Events){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-responsibles'
    });
  }

  onRisks(row: Events){
    this.matDialog.open(ModalRiskComponent, { 
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onEdit(row: Events){
    this.router.navigate(['/events/add-event']);
    this.eventService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/events/add-event']);
  }
}
