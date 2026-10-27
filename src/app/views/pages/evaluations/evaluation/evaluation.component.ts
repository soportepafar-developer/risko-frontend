import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ModalGenericComponent } from 'src/app/views/shared/components/modal-generic/modal-generic.component';
import { ModalRiskComponent } from 'src/app/views/shared/components/modal-risk/modal-risk.component';
import { Evaluation } from 'src/app/core/models/Risk/evaluation';
import { EvaluationService } from 'src/app/core/services/Riesgo/evaluation.service';


@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html'
})
export class EvaluationComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['id', 'name', 'actions'];
  dataSource: MatTableDataSource<Evaluation>;
  eventsList: Evaluation[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
      private evaluationService: EvaluationService,
      private router: Router,
      public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getEvents();
  }

  getEvents(){
    this.evaluationService.getAll().subscribe((data: Evaluation[]) => {
      this.eventsList = data;
      this.initTable(data);
    });
  }

  initTable(event: Evaluation[]){
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


  onControl(row: Evaluation){ 
    this.matDialog.open(ModalGenericComponent, { 
      data: { entity: row.controls, title: 'Controles' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onResponsible(row: Evaluation){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-responsibles'
    });
  }

  onRisks(row: Evaluation){
    this.matDialog.open(ModalRiskComponent, { 
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onEdit(row: Evaluation){
    this.router.navigate(['/evaluations/add-evaluation']);
    this.evaluationService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/evaluations/add-evaluation']);
  }
}
