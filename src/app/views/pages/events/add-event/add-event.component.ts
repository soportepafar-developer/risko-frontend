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
import { Cause } from 'src/app/core/models/Risk/cause';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { CauseService } from 'src/app/core/services/Riesgo/cause.service';
import { ProcessService } from 'src/app/core/services/Riesgo/process.service';
import { Control } from 'src/app/core/models/Risk/control';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { Observable } from 'rxjs';
import { HeatmapItem, ImpactoFrecuencia } from 'src/app/core/models/Risk/impacto-frecuencia';
import { Criticality } from '../../../shared/helpers/criticality';
import { EventState } from 'src/app/views/shared/helpers/event-state';
import { GeneratedLoss } from 'src/app/views/shared/helpers/generated-loss';
import { Events } from 'src/app/core/models/Risk/event';
import { EventService } from 'src/app/core/services/Riesgo/event.service';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';


@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html'
})
export class AddEventComponent implements OnInit {
  private data$: Observable<Events>;
  processes: Process[];
  impacts: ImpactoFrecuencia[];
  frequencies: ImpactoFrecuencia[];
  causes: Cause[];
  responsables: Responsibles[];
  form: UntypedFormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  showListCause = false;
  showListSelectCause = true;
  showListProcess = false;
  showListSelectProcess = true;
  showListControl = false;
  showListSelectControl = true;
  showListRisks = false;
  showListSelectRisks = true;
  selectedRow;
  userSelect: any[] = [];
  processSelect: any[] = [];
  causeSelect: any[] = [];
  controlSelect: any[] = [];
  risksSelect: Risk[] = [];

  eventState: any[] = [];
  criticality: any[] = [];
  generatedLoss: any[] = [];

  minDate = new Date(2025, 0, 1);
  maxDate = new Date();

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

  displayedColumnsCause: string[] = ['id', 'name','actions'];
  dataSourceCause: MatTableDataSource<Cause>;
  dataSourceCauseSelect: MatTableDataSource<Cause>;
  @ViewChild('paginatorCause') paginatorCause: MatPaginator;
  @ViewChild('causeSort', { static: false }) causeSort: MatSort;

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
    private causeService: CauseService,
    private controlService: ControlService,
    private userService: UserService,
    private riskService: RiskService,
    private eventService: EventService,
    private impactService: ImpactService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
  ) {
      this.myFormValues();
      this.data$ = eventService.sharing;
      this.eventState = EventState;
      this.criticality = Criticality;
      this.generatedLoss = GeneratedLoss;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.setValues();
    this.getProcesses();
    this.getCauses();
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
      this.initTable(data);
    });
  }

  getCauses() {
    this.causeService.getAll().subscribe(( data => {
         this.initTableCauses(data);
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

  initTableCauses(cause: Cause[]){
    this.dataSourceCause = new MatTableDataSource(cause);
    if (this.paginatorCause) {
      this.dataSourceCause.paginator = this.paginatorCause;
      this.dataSourceCause.sort = this.causeSort;
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

  applyFilterCause(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCause.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceCause.paginator) {
      this.dataSourceCause.paginator.firstPage();
    }

    this.showListCause = false;
    this.showListSelectCause = true;
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
    this.router.navigate(['/events']);
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

  onValideCause(item: Cause){
    let exist = false;
    this.causeSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddCause(item);
    }
  }

  onAddCause(item: Cause){
    this.causeSelect.push({ 
      "id": item.id,
      "name": item.name
    });

    this.refreshListCause();
  }

  refreshListCause(){
    this.dataSourceCauseSelect = new MatTableDataSource(this.causeSelect);

    if (this.causeSelect.length == 0){
      this.showListCause = false;
      this.showListSelectCause = true;
    }else{
      this.showListCause = true;
      this.showListSelectCause = false;
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
              this.eventService.deleteUser(this.id, item.id);
              this.refreshList();
            }
         });
      }
    })
  }

  onDeleteCause(item: Cause){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.causeSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.causeSelect.splice(index,1);
              this.eventService.deleteCause(this.id, item.id);
              this.refreshListCause();
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
              this.eventService.deleteProcess(this.id, item.id);
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
              this.eventService.deleteControl(this.id, item.id);
              this.refreshListControl();
            }
         });
      }
    })
  }
  onDeleteRisk(item: Risk){
    Swal.fire({
    title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
    showDenyButton: true,
    confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.risksSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.risksSelect.splice(index,1);
              this.eventService.deleteRisk(this.id, item.id);
              this.refreshListRisks();
            }
          });
      }
    })
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

  onShowListCause(){
    if(this.showListSelectCause){
      this.showListCause = true;
      this.showListSelectCause = false;
    }else{
      this.showListCause = false;
      this.showListSelectCause = true;
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
        this.f.whereOcurred.setValue(data.whereOcurred);
        this.f.startDate.setValue(data.startDate);
        this.f.startTime.setValue(data.startTime);
        this.f.discoveryDate.setValue(data.discoveryDate);
        this.f.discoveryTime.setValue(data.discoveryTime);
        this.f.state.setValue(data.state);
        this.f.criticality.setValue(data.criticality);
        this.f.generateLoss.setValue(data.generateLoss);

        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
        this.causeSelect = data.causes;
        this.refreshListCause();
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
      whereOcurred: ['',Validators.required], 
      description: ['',Validators.required],
      startDate: ['',Validators.required], 
      startTime: ['',Validators.required],
      discoveryDate: ['',Validators.required], 
      discoveryTime: ['',Validators.required],
      state: ['',Validators.required],
      criticality: ['',Validators.required],
      generateLoss: ['',Validators.required],
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

    const event: Events = {
      name: this.f.name.value,
      whereOcurred: this.f.whereOcurred.value,
      description: this.f.description.value,
      startDate: this.f.startDate.value,
      startTime: this.f.startTime.value,
      discoveryDate: this.f.discoveryDate.value,
      discoveryTime: this.f.discoveryTime.value,
      state: this.f.state.value,
      criticality: this.f.criticality.value,
      generateLoss: this.f.generateLoss.value,
      responsibles: this.userSelect,
      causes: this.causeSelect,
      processes: this.processSelect,
      controls: this.controlSelect,
      risks: this.risksSelect
    }

    console.log(event);

    if(this.id == 0 || this.id == undefined){
      this.eventService.add(event);
    }else{
      this.eventService.update(this.id, event);
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
