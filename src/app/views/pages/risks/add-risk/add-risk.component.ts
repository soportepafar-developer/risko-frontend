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
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';
import { FrecuenceService } from 'src/app/core/services/Riesgo/frequency.service';


@Component({
  selector: 'app-add-risk',
  templateUrl: './add-risk.component.html',
  styleUrls: ['./add-risk.component.scss']
})
export class AddRiskComponent implements OnInit {
  private data$: Observable<Risk>;
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
  selectedRow;
  userSelect: any[] = [];
  processSelect: any[] = [];
  causeSelect: any[] = [];
  controlSelect: any[] = [];

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

  // Mapa de Calor
  frecuenciaLabels: string[] = [];
  impactoLabels: string[] = [];
  heatmapItem: HeatmapItem[] = [];
  selectedItem: any = null;

  selectedImpact: number | null = null;
  selectedFrequency: number | null = null;
  selectedCellKey: string | null = null;

  constructor(
    private processService: ProcessService,
    private causeService: CauseService,
    private controlService: ControlService,
    private userService: UserService,
    private riskService: RiskService,
    private impactService: ImpactService,
    private frequenceService: FrecuenceService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
  ) {
      this.myFormValues();
      this.data$ = riskService.sharing;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.getImpacts();
    this.getFrecuences();
    this.setValues();
    this.getProcesses();
    this.getCauses();
    this.getControls();
    this.getUsers();
    this.getMapaCalor();

    this.form.get('impact')?.valueChanges.subscribe(value => {
      this.selectedImpact = value;
      this.updateSelectedCell();
    });

    this.form.get('frequency')?.valueChanges.subscribe(value => {
      this.selectedFrequency = value;
      this.updateSelectedCell();
    });
  }

  updateSelectedCell(): void {
    if (this.selectedImpact != null && this.selectedFrequency != null) {
      this.selectedCellKey = `${this.selectedImpact}-${this.selectedFrequency}`;
    } else {
      this.selectedCellKey = null;
    }
  }


  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.initTable(data);
    });
  }

  getImpacts(){
    this.impactService.getAll().subscribe(( data => {
         this.impacts = data;
      }
    ));
  }

  getFrecuences(){
    this.frequenceService.getAll().subscribe(( data => {
        this.frequencies = data;
      }
    ));
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

  back() {
    this.router.navigate(['/risks']);
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
              this.riskService.deleteUser(this.id, item.id);
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
              this.causeService.deleteRisk(item.id, this.id);
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
              this.riskService.deleteProcess(this.id, item.id);
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
              this.riskService.deleteControl(this.id, item.id);
              this.refreshListControl();
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
        this.f.impact.setValue(data.impact);
        this.f.frequency.setValue(data.frequency);
        this.f.affect.setValue(data.affect == 1 ? true : false);
        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
        this.causeSelect = data.causes;
        this.refreshListCause();
        this.processSelect = data.processes;
        this.refreshListProcess();
        this.controlSelect = data.controls;
        this.refreshListControl();

 
        this.selectedImpact = data.impact;
        this.selectedFrequency = data.frequency;
        this.updateSelectedCell();
      }
    });
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required], 
      impact: ['',Validators.required], 
      frequency: ['',Validators.required],
      description: [''],
      affect: [false]
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

    const risk: Risk = {
      name: this.f.name.value,
      impact: this.f.impact.value,
      frequency: this.f.frequency.value,
      description: this.f.description.value,
      affect: this.f.affect.value ? 1 : 0,
      responsibles: this.userSelect,
      causes: this.causeSelect,
      processes: this.processSelect,
      controls: this.controlSelect,
    }

    console.log(risk);

    if(this.id == 0 || this.id == undefined){
      this.riskService.add(risk);
    }else{
      this.riskService.update(this.id, risk);
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

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  getCellStyle(item: { impacto: number; frecuencia: number; color: string }) {
    const col = item.impacto + 1;          // Impacto crece de izquierda a derecha (1 → columna 2)
    const row = 7 - item.frecuencia;       // Frecuencia crece de abajo a arriba (1 → fila 6)

    return {
      background: item.color,
      gridColumn: col,
      gridRow: row
    };
  }
}
