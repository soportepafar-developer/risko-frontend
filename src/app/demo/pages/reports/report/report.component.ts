import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { Risk } from 'src/app/core/models/Risk/risk';
import { Control } from 'src/app/core/models/Risk/control';
import { Events } from 'src/app/core/models/Risk/event';
import { Plan } from 'src/app/core/models/Risk/plan';
import { Process } from 'src/app/core/models/Risk/process';
import { HeatmapItem } from 'src/app/core/models/Risk/impacto-frecuencia';

import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { EventService } from 'src/app/core/services/Riesgo/event.service';
import { PlanService } from 'src/app/core/services/Riesgo/plan.service';
import { ProcessService } from 'src/app/core/services/Riesgo/process.service';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';

export type ReportTab = 'risks' | 'controls' | 'events' | 'plans' | 'processes';

@Component({
  selector: 'app-report',
  imports: [...MATERIAL_FORMS, NgApexchartsModule],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  activeTab: ReportTab = 'risks';
  loading = false;

  // Datos crudos
  risks: Risk[] = [];
  controls: Control[] = [];
  events: Events[] = [];
  plans: Plan[] = [];
  processes: Process[] = [];
  heatmapItems: HeatmapItem[] = [];

  // Filtros
  searchTerm = '';
  selectedProcessId: number | null = null;
  selectedLevel = '';
  selectedState = '';
  selectedType = '';

  // DataSources para tablas Material
  dataSourceRisks = new MatTableDataSource<any>([]);
  dataSourceControls = new MatTableDataSource<any>([]);
  dataSourceEvents = new MatTableDataSource<any>([]);
  dataSourcePlans = new MatTableDataSource<any>([]);
  dataSourceProcesses = new MatTableDataSource<any>([]);

  // Columnas por reporte
  displayedColumnsRisks: string[] = ['code', 'name', 'process', 'impact', 'frequency', 'inherentLevel', 'controls', 'residualLevel'];
  displayedColumnsControls: string[] = ['name', 'executionType', 'isDocument', 'hasEvidence', 'solidityDesign', 'solidityExecution', 'solidityResult', 'risks'];
  displayedColumnsEvents: string[] = ['name', 'whereOcurred', 'discoveryDate', 'criticality', 'state', 'generateLoss', 'process'];
  displayedColumnsPlans: string[] = ['name', 'type', 'priority', 'status', 'progress', 'budget', 'dates', 'activities'];
  displayedColumnsProcesses: string[] = ['code', 'name', 'type', 'category', 'risksCount', 'responsibles'];

  @ViewChild('paginatorRisks') paginatorRisks: MatPaginator;
  @ViewChild('paginatorControls') paginatorControls: MatPaginator;
  @ViewChild('paginatorEvents') paginatorEvents: MatPaginator;
  @ViewChild('paginatorPlans') paginatorPlans: MatPaginator;
  @ViewChild('paginatorProcesses') paginatorProcesses: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  // Gráficos ApexCharts
  readonly donutChartOptions: any = {
    chart: { type: 'donut', height: 260, fontFamily: 'inherit', toolbar: { show: false } },
    legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '13px' },
    dataLabels: { enabled: true, formatter: (val: number) => `${Math.round(val)}%` },
    stroke: { width: 2, colors: ['#ffffff'] },
    plotOptions: { pie: { donut: { size: '65%' } } }
  };

  // Series y labels de gráficos
  riskChartSeries: number[] = [0, 0, 0, 0];
  riskChartLabels: string[] = ['Crítico', 'Alto', 'Medio', 'Bajo'];
  riskChartColors: string[] = ['#e53935', '#fb8c00', '#fdd835', '#43a047'];

  planChartSeries: number[] = [0, 0, 0];
  planChartLabels: string[] = ['Completado', 'En progreso', 'Pendiente'];
  planChartColors: string[] = ['#10b981', '#2196f3', '#f59e0b'];

  controlChartSeries: number[] = [0, 0, 0];
  controlChartLabels: string[] = ['Solidez Alta', 'Solidez Media', 'Solidez Baja'];
  controlChartColors: string[] = ['#10b981', '#fb8c00', '#e53935'];

  reportDate = new Date();

  constructor(
    private riskService: RiskService,
    private controlService: ControlService,
    private eventService: EventService,
    private planService: PlanService,
    private processService: ProcessService,
    private impactService: ImpactService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;

    // Cargar mapa de calor para niveles
    this.impactService.getMapaCalor().subscribe({
      next: (data) => {
        this.heatmapItems = data || [];
        this.loadRisks();
      },
      error: () => this.loadRisks()
    });

    // Cargar procesos
    this.processService.getAll().subscribe({
      next: (data) => {
        this.processes = data || [];
        this.applyProcessFilter();
      }
    });

    // Cargar controles
    this.controlService.getAll().subscribe({
      next: (data) => {
        this.controls = data || [];
        this.applyControlFilter();
        this.updateControlChart();
      }
    });

    // Cargar eventos
    this.eventService.getAll().subscribe({
      next: (data) => {
        this.events = data || [];
        this.applyEventFilter();
      }
    });

    // Cargar planes
    this.planService.getAll().subscribe({
      next: (data) => {
        this.plans = data || [];
        this.applyPlanFilter();
        this.updatePlanChart();
      }
    });
  }

  loadRisks() {
    this.riskService.getAll().subscribe({
      next: (data) => {
        this.risks = data || [];
        this.applyRiskFilter();
        this.updateRiskChart();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectTab(tab: ReportTab) {
    this.activeTab = tab;
    this.resetFilters(false);
    setTimeout(() => {
      this.rebindPaginators();
    }, 100);
  }

  rebindPaginators() {
    if (this.activeTab === 'risks' && this.paginatorRisks) {
      this.dataSourceRisks.paginator = this.paginatorRisks;
    } else if (this.activeTab === 'controls' && this.paginatorControls) {
      this.dataSourceControls.paginator = this.paginatorControls;
    } else if (this.activeTab === 'events' && this.paginatorEvents) {
      this.dataSourceEvents.paginator = this.paginatorEvents;
    } else if (this.activeTab === 'plans' && this.paginatorPlans) {
      this.dataSourcePlans.paginator = this.paginatorPlans;
    } else if (this.activeTab === 'processes' && this.paginatorProcesses) {
      this.dataSourceProcesses.paginator = this.paginatorProcesses;
    }
  }

  // --- Filtros ---
  onFilterChange() {
    switch (this.activeTab) {
      case 'risks':
        this.applyRiskFilter();
        break;
      case 'controls':
        this.applyControlFilter();
        break;
      case 'events':
        this.applyEventFilter();
        break;
      case 'plans':
        this.applyPlanFilter();
        break;
      case 'processes':
        this.applyProcessFilter();
        break;
    }
  }

  resetFilters(triggerFilter = true) {
    this.searchTerm = '';
    this.selectedProcessId = null;
    this.selectedLevel = '';
    this.selectedState = '';
    this.selectedType = '';
    if (triggerFilter) {
      this.onFilterChange();
    }
  }

  applyRiskFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.risks.filter((risk) => {
      const matchText =
        !term ||
        (risk.name && risk.name.toLowerCase().includes(term)) ||
        (risk.description && risk.description.toLowerCase().includes(term)) ||
        (risk.code && risk.code.toLowerCase().includes(term));

      const matchProcess =
        !this.selectedProcessId ||
        (risk.processes && risk.processes.some((p: any) => p.id === this.selectedProcessId));

      const level = this.getRiskLevel(risk).label;
      const matchLevel = !this.selectedLevel || level.toLowerCase() === this.selectedLevel.toLowerCase();

      return matchText && matchProcess && matchLevel;
    });

    this.dataSourceRisks = new MatTableDataSource(filtered);
    if (this.paginatorRisks) {
      this.dataSourceRisks.paginator = this.paginatorRisks;
    }
  }

  applyControlFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.controls.filter((ctrl) => {
      const matchText =
        !term ||
        (ctrl.name && ctrl.name.toLowerCase().includes(term)) ||
        (ctrl.description && ctrl.description.toLowerCase().includes(term));

      const matchType = !this.selectedType || ctrl.executionType === this.selectedType;

      const solidity = this.getControlSolidityLevel(ctrl).label;
      const matchLevel = !this.selectedLevel || solidity.toLowerCase() === this.selectedLevel.toLowerCase();

      return matchText && matchType && matchLevel;
    });

    this.dataSourceControls = new MatTableDataSource(filtered);
    if (this.paginatorControls) {
      this.dataSourceControls.paginator = this.paginatorControls;
    }
  }

  applyEventFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.events.filter((ev) => {
      const matchText =
        !term ||
        (ev.name && ev.name.toLowerCase().includes(term)) ||
        (ev.description && ev.description.toLowerCase().includes(term)) ||
        (ev.whereOcurred && ev.whereOcurred.toLowerCase().includes(term));

      const matchProcess =
        !this.selectedProcessId ||
        (ev.processes && ev.processes.some((p: any) => p.id === this.selectedProcessId));

      const matchLevel = !this.selectedLevel || ev.criticality === this.selectedLevel;
      const matchState = !this.selectedState || ev.state === this.selectedState;

      return matchText && matchProcess && matchLevel && matchState;
    });

    this.dataSourceEvents = new MatTableDataSource(filtered);
    if (this.paginatorEvents) {
      this.dataSourceEvents.paginator = this.paginatorEvents;
    }
  }

  applyPlanFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.plans.filter((plan) => {
      const matchText =
        !term ||
        (plan.name && plan.name.toLowerCase().includes(term)) ||
        (plan.description && plan.description.toLowerCase().includes(term));

      const matchState = !this.selectedState || plan.status === this.selectedState;
      const matchType = !this.selectedType || plan.type === this.selectedType;
      const matchPriority = !this.selectedLevel || plan.priority === this.selectedLevel;

      return matchText && matchState && matchType && matchPriority;
    });

    this.dataSourcePlans = new MatTableDataSource(filtered);
    if (this.paginatorPlans) {
      this.dataSourcePlans.paginator = this.paginatorPlans;
    }
  }

  applyProcessFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.processes.filter((proc) => {
      const matchText =
        !term ||
        (proc.name && proc.name.toLowerCase().includes(term)) ||
        (proc.code && proc.code.toLowerCase().includes(term)) ||
        (proc.description && proc.description.toLowerCase().includes(term));

      const matchType = !this.selectedType || String(proc.type) === String(this.selectedType);

      return matchText && matchType;
    });

    this.dataSourceProcesses = new MatTableDataSource(filtered);
    if (this.paginatorProcesses) {
      this.dataSourceProcesses.paginator = this.paginatorProcesses;
    }
  }

  // --- Cálculos y Helpers ---
  getRiskLevel(risk: Risk): { label: string; color: string } {
    if (risk.inherentLevel && risk.inherentColor) {
      return { label: risk.inherentLevel, color: risk.inherentColor };
    }

    if (this.heatmapItems && this.heatmapItems.length > 0) {
      const item = this.heatmapItems.find(
        (h) => h.impacto === risk.impact && h.frecuencia === risk.frequency
      );
      if (item && item.inherente) {
        return {
          label: item.inherente,
          color: item.color || item.colorInherente || '#2196f3'
        };
      }
    }

    const score = (risk.impact || 1) * (risk.frequency || 1);
    if (score >= 20) return { label: 'Crítico', color: '#e53935' };
    if (score >= 12) return { label: 'Alto', color: '#fb8c00' };
    if (score >= 6) return { label: 'Medio', color: '#fdd835' };
    return { label: 'Bajo', color: '#43a047' };
  }

  getResidualLevel(risk: Risk): { label: string; color: string } {
    if (risk.residualLevel && risk.residualColor) {
      return { label: risk.residualLevel, color: risk.residualColor };
    }

    // Si tiene controles mitigantes, calculamos reducción
    if (risk.controls && risk.controls.length > 0) {
      const inherent = this.getRiskLevel(risk);
      switch (inherent.label) {
        case 'Crítico':
          return { label: 'Alto', color: '#fb8c00' };
        case 'Alto':
          return { label: 'Medio', color: '#fdd835' };
        case 'Medio':
          return { label: 'Bajo', color: '#43a047' };
        default:
          return { label: 'Bajo', color: '#43a047' };
      }
    }

    return this.getRiskLevel(risk);
  }

  getControlSolidityLevel(ctrl: Control): { label: string; color: string } {
    const res = ctrl.solidityResult || ctrl.solidityExecution || ctrl.solidityDesign || '';
    const resLower = res.toLowerCase();

    if (resLower.includes('alto') || resLower.includes('fuerte') || resLower.includes('óptimo')) {
      return { label: 'Alta', color: '#10b981' };
    }
    if (resLower.includes('medio') || resLower.includes('moderado')) {
      return { label: 'Media', color: '#fb8c00' };
    }
    if (resLower.includes('bajo') || resLower.includes('débil')) {
      return { label: 'Baja', color: '#e53935' };
    }

    const pct = parseFloat(ctrl.percentageResult || ctrl.percentageExecution || '0');
    if (pct >= 75) return { label: 'Alta', color: '#10b981' };
    if (pct >= 40) return { label: 'Media', color: '#fb8c00' };
    return { label: 'Baja', color: '#e53935' };
  }

  getProcessTypeName(type: any): string {
    const num = Number(type);
    if (num === 1) return 'Estratégico';
    if (num === 2) return 'Medular';
    if (num === 3) return 'Apoyo';
    return type || 'N/A';
  }

  getProcessCategoryName(category: any): string {
    const num = Number(category);
    if (num === 1) return 'Macroprocesos';
    if (num === 2) return 'Procesos';
    if (num === 3) return 'Subprocesos';
    return category || 'N/A';
  }

  getProcessNames(entities?: Process[]): string {
    if (!entities || entities.length === 0) return '—';
    return entities.map((p) => p.name).join(', ');
  }

  getControlNames(entities?: Control[]): string {
    if (!entities || entities.length === 0) return '0 Controles';
    return entities.map((c) => c.name).join(', ');
  }

  // --- Actualización de Gráficos ---
  updateRiskChart() {
    let crit = 0;
    let alto = 0;
    let med = 0;
    let baj = 0;

    this.risks.forEach((r) => {
      const lvl = this.getRiskLevel(r).label;
      if (lvl === 'Crítico') crit++;
      else if (lvl === 'Alto') alto++;
      else if (lvl === 'Medio') med++;
      else baj++;
    });

    this.riskChartSeries = [crit, alto, med, baj];
  }

  updatePlanChart() {
    let comp = 0;
    let prog = 0;
    let pend = 0;

    this.plans.forEach((p) => {
      const st = (p.status || '').toLowerCase();
      if (st.includes('complet') || st.includes('cerrad')) comp++;
      else if (st.includes('progres') || st.includes('curso') || st.includes('ejecuc')) prog++;
      else pend++;
    });

    this.planChartSeries = [comp, prog, pend];
  }

  updateControlChart() {
    let alt = 0;
    let med = 0;
    let baj = 0;

    this.controls.forEach((c) => {
      const lvl = this.getControlSolidityLevel(c).label;
      if (lvl === 'Alta') alt++;
      else if (lvl === 'Media') med++;
      else baj++;
    });

    this.controlChartSeries = [alt, med, baj];
  }

  // --- KPIs Dinámicos según el tab activo ---
  get kpi1(): { label: string; value: string | number; color: string } {
    switch (this.activeTab) {
      case 'risks':
        return { label: 'Total Riesgos', value: this.risks.length, color: '#023e8a' };
      case 'controls':
        return { label: 'Total Controles', value: this.controls.length, color: '#023e8a' };
      case 'events':
        return { label: 'Total Eventos', value: this.events.length, color: '#023e8a' };
      case 'plans':
        return { label: 'Total Planes', value: this.plans.length, color: '#023e8a' };
      case 'processes':
        return { label: 'Total Procesos', value: this.processes.length, color: '#023e8a' };
    }
  }

  get kpi2(): { label: string; value: string | number; color: string } {
    switch (this.activeTab) {
      case 'risks': {
        const crit = this.risks.filter((r) => this.getRiskLevel(r).label === 'Crítico').length;
        return { label: 'Riesgos Críticos', value: crit, color: '#e53935' };
      }
      case 'controls': {
        const alt = this.controls.filter((c) => this.getControlSolidityLevel(c).label === 'Alta').length;
        return { label: 'Solidez Alta', value: alt, color: '#10b981' };
      }
      case 'events': {
        const crit = this.events.filter((e) => (e.criticality || '').toLowerCase().includes('alta') || (e.criticality || '').toLowerCase().includes('muy')).length;
        return { label: 'Eventos Críticos', value: crit, color: '#e53935' };
      }
      case 'plans': {
        const avg = this.plans.length > 0 ? Math.round(this.plans.reduce((acc, p) => acc + (p.progress || 0), 0) / this.plans.length) : 0;
        return { label: 'Avance Promedio', value: `${avg}%`, color: '#2196f3' };
      }
      case 'processes': {
        const est = this.processes.filter((p) => Number(p.type) === 1).length;
        return { label: 'Estratégicos', value: est, color: '#2196f3' };
      }
    }
  }

  get kpi3(): { label: string; value: string | number; color: string } {
    switch (this.activeTab) {
      case 'risks': {
        const alt = this.risks.filter((r) => this.getRiskLevel(r).label === 'Alto').length;
        return { label: 'Riesgos Altos', value: alt, color: '#fb8c00' };
      }
      case 'controls': {
        const auto = this.controls.filter((c) => (c.executionType || '').toLowerCase().includes('auto')).length;
        return { label: 'Automáticos', value: auto, color: '#2196f3' };
      }
      case 'events': {
        const loss = this.events.filter((e) => (e.generateLoss || '').toLowerCase() === 'si').length;
        return { label: 'Con Pérdida', value: loss, color: '#fb8c00' };
      }
      case 'plans': {
        const comp = this.plans.filter((p) => (p.status || '').toLowerCase().includes('complet') || (p.status || '').toLowerCase().includes('cerrad')).length;
        return { label: 'Completados', value: comp, color: '#10b981' };
      }
      case 'processes': {
        const med = this.processes.filter((p) => Number(p.type) === 2).length;
        return { label: 'Medulares', value: med, color: '#00897b' };
      }
    }
  }

  get kpi4(): { label: string; value: string | number; color: string } {
    switch (this.activeTab) {
      case 'risks': {
        const withCtrl = this.risks.filter((r) => r.controls && r.controls.length > 0).length;
        const pct = this.risks.length > 0 ? Math.round((withCtrl / this.risks.length) * 100) : 0;
        return { label: '% Mitigados', value: `${pct}%`, color: '#10b981' };
      }
      case 'controls': {
        const withEv = this.controls.filter((c) => c.hasEvidence === 1).length;
        return { label: 'Con Evidencia', value: withEv, color: '#5e35b1' };
      }
      case 'events': {
        const mit = this.events.filter((e) => (e.state || '').toLowerCase().includes('mitig') || (e.state || '').toLowerCase().includes('cerr')).length;
        return { label: 'Mitigados', value: mit, color: '#10b981' };
      }
      case 'plans': {
        const totalBudget = this.plans.reduce((acc, p) => acc + (p.budget || 0), 0);
        return { label: 'Presupuesto Total', value: `$${totalBudget.toLocaleString()}`, color: '#5e35b1' };
      }
      case 'processes': {
        const apo = this.processes.filter((p) => Number(p.type) === 3).length;
        return { label: 'De Apoyo', value: apo, color: '#fb8c00' };
      }
    }
  }

  // --- Exportación a Excel Nativo (.xlsx) con auto-ajuste de columnas ---
  exportToExcel() {
    let filename = '';
    let sheetName = '';
    let data: any[] = [];

    switch (this.activeTab) {
      case 'risks':
        filename = `Reporte_Matriz_Riesgos_${this.getFormattedDate()}.xlsx`;
        sheetName = 'Matriz de Riesgos';
        data = this.dataSourceRisks.data.map((r, i) => ({
          'Código': r.code || `R-${i + 1}`,
          'Riesgo': r.name || '',
          'Descripción': r.description || '',
          'Procesos Asociados': this.getProcessNames(r.processes),
          'Impacto': r.impact || 1,
          'Frecuencia': r.frequency || 1,
          'Nivel Inherente': this.getRiskLevel(r).label,
          'Controles Asociados': this.getControlNames(r.controls),
          'Nivel Residual': this.getResidualLevel(r).label
        }));
        break;

      case 'controls':
        filename = `Reporte_Controles_Solidez_${this.getFormattedDate()}.xlsx`;
        sheetName = 'Solidez de Controles';
        data = this.dataSourceControls.data.map((c) => ({
          'Control': c.name || '',
          'Descripción': c.description || '',
          'Tipo de Ejecución': c.executionType || 'Manual',
          'Documentado': c.isDocument || 'No',
          'Tiene Evidencia': c.hasEvidence === 1 ? 'Sí' : 'No',
          'Solidez Diseño': `${c.solidityDesign || '—'} (${c.percentageDesign || '0%'})`,
          'Solidez Ejecución': `${c.solidityExecution || '—'} (${c.percentageExecution || '0%'})`,
          'Solidez Global': this.getControlSolidityLevel(c).label,
          'Riesgos que Mitiga': c.risks ? c.risks.length : 0
        }));
        break;

      case 'events':
        filename = `Reporte_Eventos_Incidentes_${this.getFormattedDate()}.xlsx`;
        sheetName = 'Eventos de Pérdida';
        data = this.dataSourceEvents.data.map((e) => ({
          'Evento / Incidente': e.name || '',
          'Descripción': e.description || '',
          'Lugar / Área': e.whereOcurred || '—',
          'Fecha Descubrimiento': e.discoveryDate ? new Date(e.discoveryDate).toLocaleDateString() : '—',
          'Criticidad': e.criticality || 'Baja',
          'Estado': e.state || 'Identificado',
          'Genera Pérdida': e.generateLoss || 'No',
          'Procesos Afectados': this.getProcessNames(e.processes)
        }));
        break;

      case 'plans':
        filename = `Reporte_Planes_Accion_${this.getFormattedDate()}.xlsx`;
        sheetName = 'Planes de Acción';
        data = this.dataSourcePlans.data.map((p) => ({
          'Plan de Acción': p.name || '',
          'Descripción': p.description || '',
          'Tipo': p.type || 'Preventivo',
          'Prioridad': p.priority || 'Medio',
          'Estado': p.status || 'Pendiente',
          '% Avance': `${p.progress || 0}%`,
          'Presupuesto ($)': p.budget || 0,
          'Fecha Inicio': p.startDate ? new Date(p.startDate).toLocaleDateString() : '—',
          'Fecha Límite': p.endDate ? new Date(p.endDate).toLocaleDateString() : '—',
          'N° Tareas': p.activities ? p.activities.length : 0
        }));
        break;

      case 'processes':
        filename = `Reporte_Procesos_${this.getFormattedDate()}.xlsx`;
        sheetName = 'Cobertura Procesos';
        data = this.dataSourceProcesses.data.map((pr) => ({
          'Código': pr.code || '—',
          'Proceso': pr.name || '',
          'Descripción': pr.description || '',
          'Tipo': this.getProcessTypeName(pr.type),
          'Categoría': this.getProcessCategoryName(pr.category),
          'Riesgos Asociados': pr.risks ? pr.risks.length : 0,
          'Responsables': (pr.responsibles && pr.responsibles.length > 0) ? pr.responsibles[0].fullName : '—'
        }));
        break;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // Ajuste automático de ancho de columnas para presentación óptima
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      const colWidths = keys.map((key) => {
        let maxLen = key.length;
        data.forEach((row) => {
          const val = row[key];
          const len = val ? String(val).length : 0;
          if (len > maxLen) maxLen = len;
        });
        return { wch: Math.min(Math.max(maxLen + 3, 12), 45) };
      });
      worksheet['!cols'] = colWidths;
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };

    XLSX.writeFile(workbook, filename);
  }

  // --- Exportación a CSV / Excel con UTF-8 BOM ---
  exportToCsv() {
    let filename = '';
    let headers: string[] = [];
    let rows: any[][] = [];

    switch (this.activeTab) {
      case 'risks':
        filename = `Reporte_Matriz_Riesgos_${this.getFormattedDate()}.csv`;
        headers = ['Código', 'Nombre del Riesgo', 'Procesos Asociados', 'Impacto', 'Frecuencia', 'Nivel Inherente', 'Controles Asociados', 'Nivel Residual Estimado'];
        rows = this.dataSourceRisks.data.map((r, i) => [
          r.code || `R-${i + 1}`,
          `"${(r.name || '').replace(/"/g, '""')}"`,
          `"${this.getProcessNames(r.processes).replace(/"/g, '""')}"`,
          r.impact || 0,
          r.frequency || 0,
          this.getRiskLevel(r).label,
          `"${(r.controls && r.controls.length > 0 ? r.controls.map((c: any) => c.name).join('; ') : 'Ninguno').replace(/"/g, '""')}"`,
          this.getResidualLevel(r).label
        ]);
        break;

      case 'controls':
        filename = `Reporte_Controles_Solidez_${this.getFormattedDate()}.csv`;
        headers = ['Nombre del Control', 'Tipo de Ejecución', 'Documentado', 'Tiene Evidencia', 'Solidez Diseño', 'Solidez Ejecución', 'Solidez Resultado', 'Riesgos Mitigados'];
        rows = this.dataSourceControls.data.map((c) => [
          `"${(c.name || '').replace(/"/g, '""')}"`,
          c.executionType || '—',
          c.isDocument || '—',
          c.hasEvidence === 1 ? 'Sí' : 'No',
          c.solidityDesign || '—',
          c.solidityExecution || '—',
          c.solidityResult || '—',
          c.risks ? c.risks.length : 0
        ]);
        break;

      case 'events':
        filename = `Reporte_Eventos_Incidentes_${this.getFormattedDate()}.csv`;
        headers = ['Evento / Incidente', 'Lugar', 'Fecha Descubrimiento', 'Criticidad', 'Estado', 'Genera Pérdida', 'Procesos'];
        rows = this.dataSourceEvents.data.map((e) => [
          `"${(e.name || '').replace(/"/g, '""')}"`,
          `"${(e.whereOcurred || '').replace(/"/g, '""')}"`,
          e.discoveryDate ? new Date(e.discoveryDate).toLocaleDateString() : '—',
          e.criticality || '—',
          e.state || '—',
          e.generateLoss || '—',
          `"${this.getProcessNames(e.processes).replace(/"/g, '""')}"`
        ]);
        break;

      case 'plans':
        filename = `Reporte_Planes_Accion_${this.getFormattedDate()}.csv`;
        headers = ['Plan de Acción', 'Tipo', 'Prioridad', 'Estado', '% Avance', 'Presupuesto ($)', 'Fecha Inicio', 'Fecha Límite', 'N° Tareas'];
        rows = this.dataSourcePlans.data.map((p) => [
          `"${(p.name || '').replace(/"/g, '""')}"`,
          p.type || '—',
          p.priority || '—',
          p.status || '—',
          `${p.progress || 0}%`,
          p.budget || 0,
          p.startDate ? new Date(p.startDate).toLocaleDateString() : '—',
          p.endDate ? new Date(p.endDate).toLocaleDateString() : '—',
          p.activities ? p.activities.length : 0
        ]);
        break;

      case 'processes':
        filename = `Reporte_Procesos_${this.getFormattedDate()}.csv`;
        headers = ['Código', 'Nombre del Proceso', 'Tipo', 'Categoría', 'Riesgos Asociados'];
        rows = this.dataSourceProcesses.data.map((pr) => [
          pr.code || '—',
          `"${(pr.name || '').replace(/"/g, '""')}"`,
          this.getProcessTypeName(pr.type),
          this.getProcessCategoryName(pr.category),
          pr.risks ? pr.risks.length : 0
        ]);
        break;
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getFormattedDate(): string {
    const d = new Date();
    return `${d.getFullYear()}${('0' + (d.getMonth() + 1)).slice(-2)}${('0' + d.getDate()).slice(-2)}`;
  }

  printReport() {
    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const html = this.generatePrintableHtml();
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 1500);
    }, 350);
  }

  generatePrintableHtml(): string {
    let reportTitle = '';
    let recordCount = 0;
    let thead = '';
    let tbody = '';

    switch (this.activeTab) {
      case 'risks':
        reportTitle = 'Matriz de Riesgos Identificados';
        recordCount = this.dataSourceRisks.data.length;
        thead = `
          <tr>
            <th style="width: 70px;">Código</th>
            <th>Riesgo</th>
            <th>Procesos Asociados</th>
            <th style="text-align: center; width: 65px;">Impacto</th>
            <th style="text-align: center; width: 75px;">Frecuencia</th>
            <th style="text-align: center; width: 105px;">Nivel Inherente</th>
            <th>Controles Asociados</th>
            <th style="text-align: center; width: 105px;">Nivel Residual</th>
          </tr>`;
        tbody = this.dataSourceRisks.data.map((r, i) => {
          const inh = this.getRiskLevel(r);
          const res = this.getResidualLevel(r);
          const ctrlNames = this.getControlNames(r.controls);
          return `
            <tr>
              <td><strong>${r.code || ('R-' + (i + 1))}</strong></td>
              <td>
                <strong>${r.name || ''}</strong>
                ${r.description ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${r.description}</div>` : ''}
              </td>
              <td>${this.getProcessNames(r.processes)}</td>
              <td style="text-align: center;">${r.impact || 1}</td>
              <td style="text-align: center;">${r.frequency || 1}</td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${inh.color};">${inh.label}</span>
              </td>
              <td>
                ${!r.controls || r.controls.length === 0 ? '<span style="color: #94a3b8;">Sin Control</span>' : `<span style="font-weight: 600; color: #0284c7;">${ctrlNames}</span>`}
              </td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${res.color};">${res.label}</span>
              </td>
            </tr>`;
        }).join('');
        break;

      case 'controls':
        reportTitle = 'Evaluación y Solidez de Controles';
        recordCount = this.dataSourceControls.data.length;
        thead = `
          <tr>
            <th>Control</th>
            <th>Tipo Ejecución</th>
            <th>Documentado</th>
            <th style="text-align: center; width: 75px;">Evidencia</th>
            <th>Diseño</th>
            <th>Ejecución</th>
            <th style="text-align: center; width: 105px;">Solidez Global</th>
            <th style="text-align: center; width: 75px;">Riesgos Mitiga</th>
          </tr>`;
        tbody = this.dataSourceControls.data.map((c) => {
          const sol = this.getControlSolidityLevel(c);
          return `
            <tr>
              <td>
                <strong>${c.name || ''}</strong>
                ${c.description ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${c.description}</div>` : ''}
              </td>
              <td>${c.executionType || 'Manual'}</td>
              <td>${c.isDocument || 'No'}</td>
              <td style="text-align: center;">${c.hasEvidence === 1 ? '<span style="color: #10b981; font-weight: bold;">Sí</span>' : '<span style="color: #94a3b8;">No</span>'}</td>
              <td>${c.solidityDesign || '—'} (${c.percentageDesign || '0%'})</td>
              <td>${c.solidityExecution || '—'} (${c.percentageExecution || '0%'})</td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${sol.color};">${sol.label}</span>
              </td>
              <td style="text-align: center;">${c.risks ? c.risks.length : 0}</td>
            </tr>`;
        }).join('');
        break;

      case 'events':
        reportTitle = 'Eventos e Incidentes de Pérdida';
        recordCount = this.dataSourceEvents.data.length;
        thead = `
          <tr>
            <th>Evento / Incidente</th>
            <th>Lugar / Área</th>
            <th>Fecha Descubrimiento</th>
            <th style="text-align: center; width: 90px;">Criticidad</th>
            <th style="text-align: center; width: 95px;">Estado</th>
            <th style="text-align: center; width: 90px;">Genera Pérdida</th>
            <th>Procesos Afectados</th>
          </tr>`;
        tbody = this.dataSourceEvents.data.map((e) => {
          const critColor = e.criticality === 'Alta' || e.criticality === 'Muy Alta' ? '#ef4444' : e.criticality === 'Media' ? '#f59e0b' : '#10b981';
          return `
            <tr>
              <td>
                <strong>${e.name || ''}</strong>
                ${e.description ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${e.description}</div>` : ''}
              </td>
              <td>${e.whereOcurred || '—'}</td>
              <td>${e.discoveryDate ? new Date(e.discoveryDate).toLocaleDateString() : '—'}</td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${critColor};">${e.criticality || 'Baja'}</span>
              </td>
              <td style="text-align: center;">
                <span class="badge-soft" style="background: #e0f2fe; color: #0369a1;">${e.state || 'Identificado'}</span>
              </td>
              <td style="text-align: center;">${e.generateLoss === 'Si' ? '<strong style="color: #dc2626;">Sí</strong>' : '<span style="color: #94a3b8;">No</span>'}</td>
              <td>${this.getProcessNames(e.processes)}</td>
            </tr>`;
        }).join('');
        break;

      case 'plans':
        reportTitle = 'Seguimiento de Planes de Acción';
        recordCount = this.dataSourcePlans.data.length;
        thead = `
          <tr>
            <th>Plan de Acción</th>
            <th>Tipo</th>
            <th style="text-align: center; width: 85px;">Prioridad</th>
            <th style="text-align: center; width: 95px;">Estado</th>
            <th style="text-align: center; width: 80px;">% Avance</th>
            <th style="text-align: right; width: 100px;">Presupuesto</th>
            <th>Plazo (Inicio - Fin)</th>
            <th style="text-align: center; width: 65px;">Tareas</th>
          </tr>`;
        tbody = this.dataSourcePlans.data.map((p) => {
          const prioColor = p.priority === 'Alta' ? '#ef4444' : (p.priority === 'Medio' || p.priority === 'Media') ? '#f59e0b' : '#3b82f6';
          const stColor = p.status === 'Completado' ? '#10b981' : p.status === 'En progreso' ? '#3b82f6' : '#f59e0b';
          return `
            <tr>
              <td>
                <strong>${p.name || ''}</strong>
                ${p.description ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${p.description}</div>` : ''}
              </td>
              <td>${p.type || 'Preventivo'}</td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${prioColor};">${p.priority || 'Medio'}</span>
              </td>
              <td style="text-align: center;">
                <span class="badge" style="background-color: ${stColor};">${p.status || 'Pendiente'}</span>
              </td>
              <td style="text-align: center;">
                <strong>${p.progress || 0}%</strong>
              </td>
              <td style="text-align: right;">${p.budget ? '$' + Number(p.budget).toLocaleString() : '$0'}</td>
              <td>${p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'} - ${p.endDate ? new Date(p.endDate).toLocaleDateString() : '—'}</td>
              <td style="text-align: center;">${p.activities ? p.activities.length : 0}</td>
            </tr>`;
        }).join('');
        break;

      case 'processes':
        reportTitle = 'Cobertura y Mapa de Procesos';
        recordCount = this.dataSourceProcesses.data.length;
        thead = `
          <tr>
            <th style="width: 80px;">Código</th>
            <th>Proceso</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th style="text-align: center; width: 110px;">Riesgos Asociados</th>
            <th>Responsables</th>
          </tr>`;
        tbody = this.dataSourceProcesses.data.map((pr) => {
          return `
            <tr>
              <td><strong>${pr.code || '—'}</strong></td>
              <td>
                <strong>${pr.name || ''}</strong>
                ${pr.description ? `<div style="color: #64748b; font-size: 10px; margin-top: 2px;">${pr.description}</div>` : ''}
              </td>
              <td>${this.getProcessTypeName(pr.type)}</td>
              <td>${this.getProcessCategoryName(pr.category)}</td>
              <td style="text-align: center;">${pr.risks ? pr.risks.length : 0}</td>
              <td>${(pr.responsibles && pr.responsibles.length > 0) ? pr.responsibles[0].fullName : '—'}</td>
            </tr>`;
        }).join('');
        break;
    }

    if (!tbody) {
      tbody = `<tr><td colspan="10" style="text-align: center; padding: 20px; color: #94a3b8;">No hay registros para mostrar con los filtros aplicados.</td></tr>`;
    }

    const now = new Date();
    const formattedDateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RISKO - ${reportTitle}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700;800&display=swap">
  <style>
    @page {
      size: landscape;
      margin: 10mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Public Sans', sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 12px 14px;
      font-size: 11px;
      background: #ffffff;
    }
    .header-box {
      width: 100%;
      border-bottom: 2.5px solid #023e8a;
      padding-bottom: 12px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #023e8a;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .brand-sub {
      font-size: 10px;
      color: #64748b;
      margin: 2px 0 0;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
    }
    .report-heading {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 6px 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }
    .record-pill {
      display: inline-block;
      background: #f0f7ff;
      border: 1px solid #bae6fd;
      color: #0284c7;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 10px;
      margin-bottom: 4px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }
    table.data-table th {
      background-color: #023e8a !important;
      color: #ffffff !important;
      font-weight: 700;
      font-size: 10px;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #023e8a;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    table.data-table td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      font-size: 10.5px;
      vertical-align: middle;
      page-break-inside: avoid;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #f8fafc !important;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 9.5px;
      font-weight: 700;
      color: #ffffff !important;
      min-width: 55px;
      text-align: center;
    }
    .badge-soft {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 9.5px;
      font-weight: 700;
    }
    .footer-box {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      font-size: 9.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 class="brand-title">RISKO</h1>
      <p class="brand-sub">Sistema de Gestión Integral de Riesgos</p>
      <h2 class="report-heading">${reportTitle}</h2>
    </div>
    <div class="meta-box">
      <span class="record-pill">Total en lista: ${recordCount} registros</span>
      <div><strong>Fecha de emisión:</strong> ${formattedDateTime}</div>
      <div><strong>Formato:</strong> Listado Ejecutivo Oficial</div>
    </div>
  </div>

  <table class="data-table">
    <thead>
      ${thead}
    </thead>
    <tbody>
      ${tbody}
    </tbody>
  </table>

  <div class="footer-box">
    <span>RISKO Platform &copy; — Documento Oficial Confidencial</span>
    <span>Página generada automáticamente para archivo y auditoría</span>
  </div>
</body>
</html>`;
  }
}

