import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Responsibles } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Process } from 'src/app/core/models/Risk/process';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { Risk } from 'src/app/core/models/Risk/risk';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { ProcessService } from 'src/app/core/services/Riesgo/process.service';
import { Control } from 'src/app/core/models/Risk/control';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { Observable } from 'rxjs';
import { HeatmapItem, ImpactoFrecuencia } from 'src/app/core/models/Risk/impacto-frecuencia';
import { Criticality } from '../../../shared/helpers/criticality';
import { EventState } from 'src/app/views/shared/helpers/event-state';
import { GeneratedLoss } from 'src/app/views/shared/helpers/generated-loss';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';
import { Plan } from 'src/app/core/models/Risk/plan';
import { PlanService } from 'src/app/core/services/Riesgo/plan.service';
import { Events } from 'src/app/core/models/Risk/event';
import { EventService } from 'src/app/core/services/Riesgo/event.service';
import { PlanActivity } from 'src/app/core/models/Risk/plan-activity';


@Component({
  selector: 'app-add-plan',
  templateUrl: './add-plan.component.html'
})
export class AddPlanComponent implements OnInit {
  private data$: Observable<Plan>;
  processes: Process[];
  impacts: ImpactoFrecuencia[];
  frequencies: ImpactoFrecuencia[];
  events: Events[];
  responsibles: Responsibles[];


  form: UntypedFormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  showListEvent = false;
  showListSelectEvent = true;
  showListProcess = false;
  showListSelectProcess = true;
  showListControl = false;
  showListSelectControl = true;
  showListRisks = false;
  showListSelectRisks = true;
  selectedRow;
  userSelect: any[] = [];
  processSelect: any[] = [];
  eventSelect: any[] = [];
  controlSelect: any[] = [];
  risksSelect: Risk[] = [];

  eventState: any[] = [];
  criticality: any[] = [];
  generatedLoss: any[] = [];

  minDate = new Date(2025, 0, 1);

  heatmapItem: HeatmapItem[] = [];

  displayedColumns: string[] = ['fullName', 'dependence', 'position', 'actions'];
  dataSource: MatTableDataSource<Responsibles>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

  displayedColumnsProcess: string[] = ['id', 'name', 'type', 'category','actions'];
  dataSourceProcess: MatTableDataSource<Process>;
  dataSourceProcessSelect: MatTableDataSource<Process>;
  @ViewChild('paginatorProcess') paginatorProcess: MatPaginator;
  @ViewChild('processSort', { static: false }) processSort: MatSort;

  displayedColumnsEvent: string[] = ['id', 'name','actions'];
  dataSourceEvent: MatTableDataSource<Events>;
  dataSourceEventSelect: MatTableDataSource<Events>;
  @ViewChild('paginatorEvent') paginatorEvent: MatPaginator;
  @ViewChild('eventSort', { static: false }) eventSort: MatSort;

  displayedColumnsControl: string[] = ['name', 'type', 'execution', 'actions'];
  dataSourceControl: MatTableDataSource<Control>;
  dataSourceControlSelect: MatTableDataSource<Control>;
  @ViewChild('paginatorControl') paginatorControl: MatPaginator;
  @ViewChild('controlSort', { static: false }) controlSort: MatSort;

  displayedColumnsRisk: string[] = ['id', 'name', 'inherente', 'actions'];
  dataSourceRisk: MatTableDataSource<Risk>;
  @ViewChild('paginatorRisks') paginatorRisks: MatPaginator;
  @ViewChild('sortRisks', { static: false }) sortRisks: MatSort;

  dataSourceRiskSelect: MatTableDataSource<Risk>;

  constructor(
    private processService: ProcessService,
    private eventService: EventService,
    private controlService: ControlService,
    private userService: UserService,
    private riskService: RiskService,
    private planService: PlanService,
    private impactService: ImpactService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
  ) {
      this.myFormValues();
      this.data$ = planService.sharing;
      this.eventState = EventState;
      this.criticality = Criticality;
      this.generatedLoss = GeneratedLoss;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.setValues();
    this.getProcesses();
    this.getEvents();
    this.getControls();
    this.getRisks();
    this.getUsers();
    this.getMapaCalor();
  }

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  getRisks(){
    this.riskService.getAllForAccosiate().subscribe(( data => {
        this.initTableRisk(data);
      }
    ));
  }

  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.responsibles = data;
      this.initTable(data);
    });
  }

  getEvents() {
    this.eventService.getAll().subscribe(( data => {
         this.initTableEvents(data);
      }
    ));
  }

  getProcesses() {
    this.processService.getAll().subscribe(( data => {
         this.initTableProcesses(data);
      }
    ));
  }

  getControls() {
    this.controlService.getAll().subscribe(( data => {
         this.initTableControls(data);
      }
    ));
  }

  initTable(user: Responsibles[]){
    this.dataSource = new MatTableDataSource(user);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.loading = false;
  }

  
  initTableRisk(risks: any[]){
    this.dataSourceRisk = new MatTableDataSource(risks);
    if (this.paginatorRisks) {
      this.dataSourceRisk.paginator = this.paginatorRisks;
      this.dataSourceRisk.sort = this.sortRisks;
    }
    this.loading = false;
  }

  initTableEvents(event: Events[]){
    this.dataSourceEvent = new MatTableDataSource(event);
    if (this.paginatorEvent) {
      this.dataSourceEvent.paginator = this.paginatorEvent;
      this.dataSourceEvent.sort = this.eventSort;
    }
  }

  initTableProcesses(process: Process[]){
    this.dataSourceProcess = new MatTableDataSource(process);
    if (this.paginatorProcess) {
      this.dataSourceProcess.paginator = this.paginatorProcess;
      this.dataSourceProcess.sort = this.processSort;
    }
  }

  initTableControls(control: Control[]){
    this.dataSourceControl = new MatTableDataSource(control);
    if (this.paginatorControl) {
      this.dataSourceControl.paginator = this.paginatorControl;
      this.dataSourceControl.sort = this.controlSort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.showList = false;
    this.showListSelect = true;
  }

  applyFilterEvent(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceEvent.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceEvent.paginator) {
      this.dataSourceEvent.paginator.firstPage();
    }

    this.showListEvent = false;
    this.showListSelectEvent = true;
  }

  applyFilterProcess(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProcess.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceProcess.paginator) {
      this.dataSourceProcess.paginator.firstPage();
    }

    this.showListProcess = false;
    this.showListSelectProcess = true;
  }

  applyFilterControl(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceControl.paginator) {
      this.dataSourceControl.paginator.firstPage();
    }

    this.showListControl = false;
    this.showListSelectControl = true;
  }

  applyFilterRisks(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRisk.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceRisk.paginator) {
      this.dataSourceRisk.paginator.firstPage();
    }

    this.showListRisks = false;
    this.showListSelectRisks = true;
  }

  onShowListRisk(){
    if(this.showListSelectRisks){
      this.showListRisks = true;
      this.showListSelectRisks = false;
    }else{
      this.showListRisks = false;
      this.showListSelectRisks = true;
    }
  }
  
  onAddRisk(risk: Risk){
    let exist = false;
    this.risksSelect.forEach((element)=>{
      if(element.id===risk.id) {
        exist = true
        Swal.fire('', `${ risk.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddRiskToProcess(risk);
    }
  }

  onAddRiskToProcess(item: Risk){
    this.risksSelect.push(item);
    this.refreshListRisks();
  }

  onResponsibleRiesgo(row: Risk){
    this.matDialog.open(ModalResponsibleComponent, {
      data: { responsible: row.responsibles },
      width: '50%',
      maxWidth: '50vw',
      disableClose: true,
      id: 'modal-resposible'
    });
  }

  refreshListRisks(){
    this.dataSourceRiskSelect = new MatTableDataSource(this.risksSelect);

    if (this.risksSelect.length == 0){
      this.showListRisks = false;
      this.showListSelectRisks = true;
    }else{
      this.showListRisks = true;
      this.showListSelectRisks = false;
    }
  }

  
  getInherenteData(row: any): { value: string, color: string } | null {
    const match = this.heatmapItem.find(item =>
      item.impacto === row.impact && item.frecuencia === row.frecuency
    );

    if (match) {
      return {
        value: match.inherente,
        color: match.colorInherente
      };
    }
    return null;
  }

  back() {
    this.router.navigate(['/plans']);
    this.riskService.resetData();
  }

  onValidaUser(item: Responsibles){
    let exist = false;
    this.userSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.fullName } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddUser(item);
    }
  }

  onAddUser(item: Responsibles){
    this.userSelect.push({
      "id": item.id,
      "fullName": item.fullName,
      "dependence": item.dependence,
      "position": item.position,
    });

    this.refreshList();
  }

  refreshList(){
    this.dataSourceSelect = new MatTableDataSource(this.userSelect);

    if (this.userSelect.length == 0){
      this.showList = false;
      this.showListSelect = true;
    }else{
      this.showList = true;
      this.showListSelect = false;
    }
  }

  onValidaProcess(item: Process){
    let exist = false;
    this.processSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddProcess(item);
    }
  }

  onAddProcess(item: Process){
    this.processSelect.push({
      "id": item.id,
      "name": item.name,
      "type": item.type,
      "category": item.category
    });

    this.refreshListProcess();
  }

  refreshListProcess(){
    this.dataSourceProcessSelect = new MatTableDataSource(this.processSelect);

    if (this.processSelect.length == 0){
      this.showListProcess = false;
      this.showListSelectProcess = true;
    }else{
      this.showListProcess = true;
      this.showListSelectProcess = false;
    }
  }

  onValideEvent(item: Events){
    let exist = false;
    this.eventSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddEvent(item);
    }
  }

  onAddEvent(item: Events){
    this.eventSelect.push({ 
      "id": item.id,
      "name": item.name
    });

    this.refreshListEvent();
  }

  refreshListEvent(){
    this.dataSourceEventSelect = new MatTableDataSource(this.eventSelect);

    if (this.eventSelect.length == 0){
      this.showListEvent = false;
      this.showListSelectEvent = true;
    }else{
      this.showListEvent = true;
      this.showListSelectEvent = false;
    }
  }

  onValidaControl(item: Control){
    let exist = false;
    this.controlSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddControl(item);
    }
  }

  onAddControl(item: Control){
    this.controlSelect.push({
      "id": item.id,
      "name": item.name,
      "qualify": item.qualify,
      "executionType": item.executionType,

    });

    this.refreshListControl();
  }

  refreshListControl(){
    this.dataSourceControlSelect = new MatTableDataSource(this.controlSelect);

    if (this.controlSelect.length == 0){
      this.showListControl = false;
      this.showListSelectControl = true;
    }else{
      this.showListControl = true;
      this.showListSelectControl = false;
    }
  }

  onDelete(item: Responsibles){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.fullName }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.userSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.userSelect.splice(index,1);
              this.planService.deleteUser(this.id, item.id);
              this.refreshList();
            }
         });
      }
    })
  }

  onDeleteEvent(item: Events){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.eventSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.eventSelect.splice(index,1);
              this.planService.deleteEvent(this.id, item.id);
              this.refreshListEvent();
            }
         });
      }
    })
  }

  onDeleteProcess(item: Process){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.processSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.processSelect.splice(index,1);
              this.planService.deleteProcess(this.id, item.id);
              this.refreshListProcess();
            }
         });
      }
    })
  }

  onDeleteControl(item: Control){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.controlSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.controlSelect.splice(index,1);
              this.planService.deleteControl(this.id, item.id);
              this.refreshListControl();
            }
         });
      }
    })
  }

  onDeleteRisk(item: Risk){
    Swal.fire({
      title: `¿Estás seguro que deseas eliminar de la lista "${item.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.risksSelect.findIndex(el => el.id === item.id);
        if (index !== -1) {
          this.risksSelect.splice(index, 1);
          this.planService.deleteRisk(this.id, item.id);
          this.refreshListRisks();
        }
      }
    });

  }

  onShowList(){
    if(this.showListSelect){
      this.showList = true;
      this.showListSelect = false;
    }else{
      this.showList = false;
      this.showListSelect = true;
    }
  }

  onShowListEvent(){
    if(this.showListSelectEvent){
      this.showListEvent = true;
      this.showListSelectEvent = false;
    }else{
      this.showListEvent = false;
      this.showListSelectEvent = true;
    }
  }

  onShowListProcess(){
    if(this.showListSelectProcess){
      this.showListProcess = true;
      this.showListSelectProcess = false;
    }else{
      this.showListProcess = false;
      this.showListSelectProcess = true;
    }
  }

  onShowListControl(){
    if(this.showListSelectControl){
      this.showListControl = true;
      this.showListSelectControl = false;
    }else{
      this.showListControl = false;
      this.showListSelectControl = true;
    }
  }

  onResponsibleProcess(row: Process){
    this.matDialog.open(ModalResponsibleComponent, {
        data: { responsible: row.responsibles },
        width: '50%',
        maxWidth: '50vw',
        disableClose: true,
        id: 'modal-resposible'
      });
  }

  onResponsibleControl(row: Control){
    this.matDialog.open(ModalResponsibleComponent, {
        data: { responsible: row.responsibles },
        width: '50%',
        maxWidth: '50vw',
        disableClose: true,
        id: 'modal-resposible'
      });
  }

  setValues(){
    this.data$.subscribe( data => {
      if(data.id > 0){
        this.f.name.setValue(data.name);
        this.f.description.setValue(data.description);
        this.f.startDate.setValue(data.startDate);
        this.f.endDate.setValue(data.endDate);

        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
        this.eventSelect = data.events;
        this.refreshListEvent();
        this.processSelect = data.processes;
        this.refreshListProcess();
        this.controlSelect = data.controls;
        this.refreshListControl();
        this.risksSelect = data.risks;
        this.refreshListRisks();
      }
    });
  }

  
  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required], 
      description: ['',Validators.required],
      startDate: ['',Validators.required], 
      endDate: ['',Validators.required]
    })
  }

  onSubmit() {

    this.submitted = true;

    if (this.userSelect.length == 0) {
      Swal.fire('', `Agregue al menos un responsable a la lista`, 'info');
      return;
    }

    if (this.form.invalid) { return; }

    this.loading = true;

    const event: Plan = {
      name: this.f.name.value,
      description: this.f.description.value,
      startDate: this.f.startDate.value,
      endDate: this.f.endDate.value,
      responsibles: this.userSelect,
      events: this.eventSelect,
      processes: this.processSelect,
      controls: this.controlSelect,
      risks: this.risksSelect
    }

    console.log(event);

    if(this.id == 0 || this.id == undefined){
      this.planService.add(event);
    }else{
      this.planService.update(this.id, event);
    }
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
