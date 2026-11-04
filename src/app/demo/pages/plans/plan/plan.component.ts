import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/shared/components/modal-responsible/modal-responsible.component';
import { ModalGenericComponent } from 'src/app/shared/components/modal-generic/modal-generic.component';
import { ModalRiskComponent } from 'src/app/shared/components/modal-risk/modal-risk.component';
import { Plan } from 'src/app/core/models/Risk/plan';
import { PlanService } from 'src/app/core/services/Riesgo/plan.service';
import { AddActivityComponent } from './add-activity/add-activity.component';

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-plan',
  templateUrl: './plan.component.html'
})
export class PlanComponent implements OnInit {
  loading = true;
  selectedRow;
  displayedColumns: string[] = ['id', 'name', 'type', 'priority', 'status', 'progress', 'budget', 'actions'];
  dataSource: MatTableDataSource<Plan>;
  plansList: Plan[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private planService: PlanService,
    private router: Router,
    public matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getPlans();
  }

  getPlans() {
    this.planService.getAll().subscribe((data: Plan[]) => {
      this.plansList = data;
      this.initTable(data);
    });
  }

  initTable(plan: Plan[]) {
    this.dataSource = new MatTableDataSource(plan);
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

  getPriorityColor(priority: string): string {
    switch ((priority || '').toLowerCase()) {
      case 'alto':
      case 'alta':
        return '#F44336';
      case 'medio':
      case 'media':
        return '#FF9800';
      case 'bajo':
      case 'baja':
        return '#4CAF50';
      default:
        return '#8c8c8c';
    }
  }

  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'completado':
        return '#66BB6A';
      case 'en progreso':
        return '#29B6F6';
      case 'pendiente':
        return '#FFA726';
      case 'vencido':
        return '#EF5350';
      case 'cancelado':
        return '#BDBDBD';
      default:
        return '#1677ff';
    }
  }

  addActivity(row: Plan) {
    console.log(row);
    this.matDialog.open(AddActivityComponent, {
      data: { plan: row },
      width: '75%',
      maxWidth: '75vw',
      disableClose: true,
      id: 'modal-resposible-actividad'
    });
  }

  onProcess(row: Plan) {
    this.matDialog.open(ModalGenericComponent, {
      data: { entity: row.processes, title: 'Procesos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-procesos'
    });
  }

  onEvent(row: Plan) {
    this.matDialog.open(ModalGenericComponent, {
      data: { entity: row.events, title: 'Eventos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-eventos'
    });
  }

  onControl(row: Plan) {
    this.matDialog.open(ModalGenericComponent, {
      data: { entity: row.controls, title: 'Controles' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });
  }

  onResponsible(row: Plan) {
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-responsibles'
    });
  }

  onRisks(row: Plan) {
    this.matDialog.open(ModalRiskComponent, {
      data: { entity: row.risks, title: 'Riesgos' },
      width: '70%',
      maxWidth: '70vw',
      disableClose: true,
      id: 'modal-resposible-control'
    });
  }

  onEdit(row: Plan) {
    this.router.navigate(['/plans/add-plan']);
    this.planService.sharingData = row;
  }

  openAdd() {
    this.router.navigate(['/plans/add-plan']);
  }
}
