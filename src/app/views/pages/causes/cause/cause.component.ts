import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Project } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Cause } from '../../../../core/models/Risk/cause';
import { CauseService } from 'src/app/core/services/Riesgo/cause.service';
import { ModalRiskComponent } from 'src/app/views/shared/components/modal-risk/modal-risk.component';

@Component({
  selector: 'app-cause',
  templateUrl: './cause.component.html'
})
export class CauseComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['name', 'type', 'category', 'actions'];
  dataSource: MatTableDataSource<Cause>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  projects: Project[] = [];	
 
  constructor(
    private causeService: CauseService,
    private router: Router,
    public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.causeService.getAll().subscribe(( data => {
         this.initTable(data);
      }
    ));
  }

  initTable(project: Cause[]){
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

  onRisks(row: Cause){
    this.matDialog.open(ModalRiskComponent, {
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-risk'
    });
  }

  onEdit(row: Cause){
    this.router.navigate(['/causes/add-cause']);
    this.causeService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/causes/add-cause']);
  }

  onDelete(id:number, name: string){

  }


}
