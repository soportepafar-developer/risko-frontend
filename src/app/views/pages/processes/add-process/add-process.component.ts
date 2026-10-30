import { Component, OnInit, Type, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Project, Responsibles } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Process } from 'src/app/core/models/Risk/process';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ChangeDetectorRef } from '@angular/core';
import { TypeProcess } from 'src/app/core/models/Enum/type-process.enum';
import { CategoryProcess } from '../../../../core/models/Enum/category-process.enum';
import { ProcessService } from 'src/app/core/services/Riesgo/process.service';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { Risk, RiskForAssociate } from 'src/app/core/models/Risk/risk';
import { ProjectService } from 'src/app/core/services/Riesgo/project.service';
import { Observable } from 'rxjs';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';
import { HeatmapItem } from 'src/app/core/models/Risk/impacto-frecuencia';
import { StructureService } from 'src/app/core/services/structure.service';
import { Structure } from 'src/app/core/models/structure';

@Component({
  selector: 'app-add-process',
  templateUrl: './add-process.component.html'
})
export class AddProcessComponent implements OnInit {
  private data$: Observable<Process>;
  responsables: Responsibles[];
  form: UntypedFormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  showListRisks = false;
  showListSelectRisks = true;
  onAsociar = false;
  selectedRow;
  userSelect: any[] = [];
  risksSelect: Risk[] = [];

  displayedColumns: string[] = ['fullName', 'dependence', 'position', 'actions'];
  dataSource: MatTableDataSource<Responsibles>;
  @ViewChild('paginatorUsers') paginatorUsers: MatPaginator;
  @ViewChild('sortUsers', { static: false }) sortUsers: MatSort;

  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

  displayedColumnsRisk: string[] = ['id', 'name', 'inherente', 'actions'];
  
  dataSourceRisk: MatTableDataSource<Risk>;
  dataSourceRiskSelect: MatTableDataSource<Risk>;
  @ViewChild('paginatorRisks') paginatorRisks: MatPaginator;
  @ViewChild('sortRisks', { static: false }) sortRisks: MatSort;

  typeProcess: any[] = [];
  categoryProcess: any[] = [];
  projects: Project[] = [];
  processes: Process[] = [];
  processesFilter: Process[] = [];
  
  // Riesgo inherente
  
  heatmapItem: HeatmapItem[] = [];
  risksList: RiskForAssociate[] = [];

  levelsData: Structure[][] = [[]]; // Almacena cada grupo de datos por nivel
  idEstructura: number = 1; // ID de la estructura seleccionada

  constructor(
    private projectService: ProjectService,
    private processService: ProcessService,
    private riskService: RiskService,
    private userService: UserService,
    private impactService: ImpactService,
    private structureService: StructureService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
      this.myFormValues();
      this.data$ = processService.sharing;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.cdr.detectChanges();
    this.getTypeProcess();
    this.getCategoryProcess();
    this.getProjects();
    this.getProcesses();
    this.setValues();
    this.getUsers();
    this.getMapaCalor();
    this.getStructure();
  }

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.initTable(data);
    });
  }

  ngAfterViewInit() {
    this.getRisks();
  }

  getProcesses() {
    this.processService.getAll().subscribe((data) => {
      this.processes = data;
      this.processesFilter = data;
    });
  }

  getProjects() {
    this.projectService.getAll().subscribe((data) => {
      this.projects = data;
    });
  }

  getTypeProcess(){
    for (let key in TypeProcess) {
      if (isNaN(Number(key))) {
        this.typeProcess.push({ value: TypeProcess[key], label: key });
      }
    }
  }

  getCategoryProcess(){
    for (let key in CategoryProcess) {
      if (isNaN(Number(key))) {
        this.categoryProcess.push({ value: CategoryProcess[key], label: key });
      }
    }
  }

  getRisks(){
    this.riskService.getAllForAccosiate().subscribe(( data => {
      this.risksList = data;
      this.initTableRisk(data);
    }));
    this.cdr.detectChanges();
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


  initTable(user: Responsibles[]){
    this.dataSource = new MatTableDataSource(user);
    if (this.paginatorUsers) {
      this.dataSource.paginator = this.paginatorUsers;
      this.dataSource.sort = this.sortUsers;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.showList = false;
    this.showListSelect = true;
  }

  applyFilterRisk(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRisk.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceRisk.paginator) {
      this.dataSourceRisk.paginator.firstPage();
    }

    this.showListRisks = false;
    this.showListSelectRisks = true;
  }

  back() {
    this.router.navigate(['/processes/process']);
    this.processService.resetData();
  }

  onAdd(item: Responsibles){
    let exist = false;
    this.userSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.fullName  } ya fue agregado`, 'info');
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

  onDelete(item: Responsibles){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista a ${ item.fullName }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.userSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.userSelect.splice(index,1);
              this.processService.deleteUser(this.id, item.id);
              this.refreshList();
            }
         });
      }
    })
  }

  onDeleteRisk(item: Risk){
     Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista  ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.risksSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.risksSelect.splice(index,1);
              this.riskService.deleteProcess(item.id, this.id);
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

  onShowListRisk(){
    if(this.showListSelectRisks){
      this.showListRisks = true;
      this.showListSelectRisks = false;
    }else{
      this.showListRisks = false;
      this.showListSelectRisks = true;
    }
  }

  onResponsibleRiesgo(row: Process){
    this.matDialog.open(ModalResponsibleComponent, {
        data: { responsible: row.responsibles },
        width: '50%',
        maxWidth: '50vw',
        disableClose: true,
        id: 'modal-resposible'
      });
  }

  getCategory(category: number){
    if(category == 2){
      this.processesFilter = this.processes.filter((process) => process.category === 1);
      document.getElementById('asociara').innerHTML= 'Macroproceso';
      this.onAsociar = false;
    }else if(category == 3){
      this.processesFilter = this.processes.filter((process) => process.category === 2);
      document.getElementById('asociara').innerHTML= 'Proceso';
      this.onAsociar = false;
    }else{
      this.onAsociar = true;
      this.f.idprocess.setValue('');
    }

  }

  onSubmit() {

    this.submitted = true;

    if (this.userSelect.length == 0) {
      Swal.fire('', `Agregue al menos un responsable a la lista`, 'info');
      return;
    }

    if (this.form.invalid) { return; }

    this.loading = true;
    
    const process: Process = {
      code:  this.f.code.value,
      name: this.f.name.value,
      category: this.f.category.value,
      type: this.f.type.value,
      project:  this.f.idproject.value,
      process:  this.f.idprocess.value,
      unit:  this.idEstructura,
      description:  this.f.description.value,
      responsibles: this.userSelect,
      risks: this.risksSelect
    }

    console.log(process);

    if(this.id == 0 || this.id == undefined){
      this.processService.add(process);
    }else{
      this.processService.update(this.id, process);
    }
  }

  setValues(){
    this.data$.subscribe( data => {
      if(data.id > 0){
        this.f.name.setValue(data.name);
        this.f.type.setValue(Number(data.type));
        this.f.category.setValue(Number(data.category));
        this.f.idprocess.setValue(Number(data.process));
        this.f.idproject.setValue(Number(data.project));
        this.f.code.setValue(data.code);
        this.idEstructura = data.unit;

        this.f.description.setValue(data.description);
        this.id = data.id;
        this.userSelect = data.responsibles;
        this.risksSelect = data.risks;
        this.refreshList();
        this.refreshListRisks();
      }
    });
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required], 
      type: ['',Validators.required], 
      category: ['',Validators.required], 
      code: ['',Validators.required], 
      description: [''],
      idproject: [''],
      idprocess: [''], // Proceso Padre. Proceso esta asociado a Marcoproceso y un subproceso a un proceso
      levels: this.formBuilder.array([
        this.formBuilder.control('') // Nivel 1
      ]),
    })
  }

  getStructure(){
      this.structureService.getAll().subscribe((data: Structure[]) => {
        this.levelsData = [data]; // Asignar como primer nivel
        this.levelsFormArray.clear(); // Limpiar si ya existía algo
        this.levelsFormArray.push(this.formBuilder.control('')); // Crear FormControl para nivel 1
      });
    }
  
    onLevelChange(levelIndex: number, id: number): void {
      this.structureService.getById(id).subscribe((data: Structure[]) => {
        this.idEstructura = id;
        // Cortar niveles inferiores si el usuario cambia selección en uno anterior
        this.levelsData = this.levelsData.slice(0, levelIndex + 1);
        
        if (data.length > 0) {
          this.levelsData.push(data);
          this.levelsFormArray.push(this.formBuilder.control(''));
        }
      });
    }
  
    get levelsFormArray(): UntypedFormArray {
      return this.form.get('levels') as UntypedFormArray;
    }
  
    getLevelControl(index: number): UntypedFormControl {
      return this.levelsFormArray.at(index) as UntypedFormControl;
    }

}
