import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Project } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { Control, ControlParams } from 'src/app/core/models/Risk/control';
import { ModalRiskComponent } from 'src/app/views/shared/components/modal-risk/modal-risk.component';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html'
})
export class ControlComponent implements OnInit {

  loading = true;
  selectedRow;
  displayedColumns: string[] = ['name', 'type', 'execution', 'qualification',  'actions'];
  dataSource: MatTableDataSource<Control>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  
  params: ControlParams[] = [];

  constructor(
    private controlService: ControlService,
    private router: Router,
    public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getParams();
    this.getAllControls();
  }

  getAllControls() {
      this.controlService.getAll().subscribe(( data => {
         this.initTable(data);
      }
    ));
  }

  AfterViewInit() {

  }

  initTable(project: Control[]){
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

  onResponsible(row: Control){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-process'
    });
  }

  onRisks(row: Control){
    this.matDialog.open(ModalRiskComponent, { 
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });  
  }

  onEdit(row: Control){
    this.router.navigate(['/controls/add-control']);
    this.controlService.sharingData = row;
  }

  openAdd(){
    this.router.navigate(['/controls/add-control']);
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

  getParams(){
    this.controlService.getAllParams().subscribe(( data => {
        this.params = data;
      }
    ));
  }

  getQualification(value: number){
    // Determinar calificación final según el módulo 'Solidity'
    const solidityParams = this.params.filter(p => p.module === 'Solidity');
    return this.getParamCByValue(value, solidityParams);
  }

  getParamCByValue(value: number, items: ControlParams[]): string | null {
    const matchedItem = items.find(item => {
      const from = parseFloat(item.parama);
      const to = parseFloat(item.paramb);
      return value >= from && value <= to;
    });
    return matchedItem ? matchedItem.paramc : null;
  }


}
