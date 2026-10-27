import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
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
import { Control } from 'src/app/core/models/Risk/control';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { Observable } from 'rxjs';
import { HeatmapItem, ImpactoFrecuencia } from 'src/app/core/models/Risk/impacto-frecuencia';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';
import { Evaluation } from 'src/app/core/models/Risk/evaluation';
import { TypeEvaluation } from 'src/app/views/shared/helpers/type-evaluation';
import { EvaluationService } from 'src/app/core/services/Riesgo/evaluation.service';


@Component({
  selector: 'app-add-evaluation',
  templateUrl: './add-evaluation.component.html'
})
export class AddEvaluationComponent implements OnInit {
  private data$: Observable<Evaluation>;
  impacts: ImpactoFrecuencia[];
  frequencies: ImpactoFrecuencia[];
  responsables: Responsibles[];
  form: FormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  showListControl = false;
  showListSelectControl = true;
  showListRisks = false;
  showListSelectRisks = true;
  selectedRow;
  userSelect: any[] = [];
  controlSelect: any[] = [];
  risksSelect: Risk[] = [];

  showControlTab: boolean = false;
  showRiskTab: boolean = false;


  typeEvaluation: any[] = [];
  minDate = new Date();
  heatmapItem: HeatmapItem[] = [];

  displayedColumns: string[] = ['fullName', 'dependence', 'position', 'actions'];
  dataSource: MatTableDataSource<Responsibles>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

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
    private controlService: ControlService,
    private userService: UserService,
    private riskService: RiskService,
    private evaluationService: EvaluationService,
    private impactService: ImpactService,
    private formBuilder: FormBuilder,
    private router: Router,
    public matDialog: MatDialog,
  ) {
      this.myFormValues();
      this.typeEvaluation = TypeEvaluation;
      this.data$ = evaluationService.sharing;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.setValues();
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
    this.router.navigate(['/evaluations']);
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
              this.evaluationService.deleteUser(this.id, item.id);
              this.refreshList();
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
              this.evaluationService.deleteControl(this.id, item.id);
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
              this.evaluationService.deleteRisk(this.id, item.id);
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
        this.f.type.setValue(data.type);

        data.type == 'Por Riesgos' ? this.showControlTab = true :  this.showRiskTab = true; 

        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
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
      endDate: ['',Validators.required],
      type: ['',Validators.required], 
    })
  }

    onSubmit() {

    this.submitted = true;

    if (this.userSelect.length == 0) {
      Swal.fire('', `Agregue al menos un responsable a la lista`, 'info');
      return;
    }

    if (this.risksSelect.length == 0 && this.controlSelect.length == 0) {
        if(this.f.type.value == 'Por Controles') Swal.fire('', `Seleccione el contros a evaluar`, 'info');
        if(this.f.type.value == 'Por Riesgos') Swal.fire('', `Seleccione el riesgo a evaluar`, 'info');
        
      return;
    }


    if(this.f.type.value == 'Por Controles') this.risksSelect = [];
    if(this.f.type.value == 'Por Riesgos') this.controlSelect = [];

    if (this.form.invalid) { return; }

    this.loading = true;

    const evaluation: Evaluation = {
      name: this.f.name.value,
      description: this.f.description.value,
      startDate: this.f.startDate.value,
      endDate: this.f.endDate.value,
      type: this.f.type.value,
      responsibles: this.userSelect,
      controls: this.controlSelect,
      risks: this.risksSelect
    }

    console.log(evaluation);

    if(this.id == 0 || this.id == undefined){
      this.evaluationService.add(evaluation);
    }else{
      this.evaluationService.update(this.id, evaluation);
    }
  }


  onEvaluationChange(value: string) {
    this.showControlTab = value === 'Por Riesgos';
    this.showRiskTab = value === 'Por Controles';
  }
}
