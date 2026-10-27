import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Project } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ProcessService } from 'src/app/core/services/Riesgo/process.service';
import { Process } from 'src/app/core/models/Risk/process';
import { ModalRiskComponent } from 'src/app/views/shared/components/modal-risk/modal-risk.component';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html'
})
export class ProcessComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['code', 'name', 'type', 'category', 'actions'];
  dataSource: MatTableDataSource<Process>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
 
  constructor(
    private processService: ProcessService,
    private router: Router,
    public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.processService.getAll().subscribe(( data => {
         this.initTable(data);
      }
    ));
  }

  initTable(project: Process[]){
    this.dataSource = new MatTableDataSource(project);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.loading = false;
    this.paginator._intl.itemsPerPageLabel = 'Filas';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onResponsible(row: Process){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-process'
    });
  }

  onRisks(row: Process){
    this.matDialog.open(ModalRiskComponent, {
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-risk'
    });
  }

  onEdit(row: Process){
    this.router.navigate(['/processes/add-process']);
    this.processService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/processes/add-process']);
  }

  onDelele(id:number, name: string){

  }

  getType(type: number): string {
    switch (type) {
      case 1:
        return 'Estratégico';
      case 2:
        return 'Medular';
      case 3:
        return 'Apoyo';
    }
  }

  getCategory(category: number): string {
    switch (category) {
      case 1:
        return 'Macroprocesos';
      case 2:
        return 'Procesos';
      case 3:
        return 'Subprocesos';
    }
  }

}
