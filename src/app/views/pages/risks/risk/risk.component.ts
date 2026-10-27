import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { ModalGenericComponent } from 'src/app/views/shared/components/modal-generic/modal-generic.component';
import { Risk } from 'src/app/core/models/Risk/risk';
import { HeatmapItem } from 'src/app/core/models/Risk/impacto-frecuencia';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';

@Component({
  selector: 'app-risk',
  templateUrl: './risk.component.html'
})
export class RiskComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['id', 'name', 'impact', 'frequency', 'inherente', 'actions'];
  dataSource: MatTableDataSource<Risk>;

  heatmapItem: HeatmapItem[] = [];
  risksList: Risk[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
      private riskService: RiskService,
      private impactService: ImpactService,
      private router: Router,
      public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getRisks();
    this.getMapaCalor();
  }

  getRisks(){
    this.riskService.getAll().subscribe((data: Risk[]) => {
      this.risksList = data;
      this.initTable(data);
    });
  }

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  initTable(risk: Risk[]){
    this.dataSource = new MatTableDataSource(risk);
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

  onProcess(row: Risk){ 
    this.matDialog.open(ModalGenericComponent, {
      data: { entity: row.processes, title: 'Procesos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-procesos'
    });
  }

  onCause(row: Risk){
    this.matDialog.open(ModalGenericComponent, { 
      data: { entity: row.causes, title: 'Causas' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-causas'
    });
  }

  onControl(row: Risk){ 
    this.matDialog.open(ModalGenericComponent, { 
      data: { entity: row.controls, title: 'Controles' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onResponsible(row: Risk){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-responsibles'
    });
  }

  onEdit(row: Risk){
    this.router.navigate(['/risks/add-risk']);
    this.riskService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/risks/add-risk']);
  }

  getInherenteData(row: any): { value: string, color: string } | null {
    const match = this.heatmapItem.find(item =>
      item.impacto === row.impact && item.frecuencia === row.frequency
    );

    if (match) {
      return {
        value: match.inherente,
        color: match.colorInherente
      };
    }
    return null;
  }

}
